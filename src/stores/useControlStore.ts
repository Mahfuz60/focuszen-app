import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const { FocusZenSettings } = NativeModules;
import { seedControlSettings } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { AppControlSettings, AppControlTarget, AppFeatureKey, SafeBrowsingSettings, ScheduleRule } from '../types/models';
import { getControlOptionDescriptors } from '../utils/controlOptions';

const seedSafeBrowsing: SafeBrowsingSettings = {
  adultContentBlock: true,
  harmfulSitesBlock: true,
  safeSearch: true,
  gamblingBlock: true,
  customDomains: ['example-blocked.com'],
  status: 'requires-permission',
};

type ControlState = {
  controls: AppControlSettings[];
  safeBrowsing: SafeBrowsingSettings;
  strictModeEnabled: boolean;
  permissionsGranted: boolean;
  toggleAppBlocked: (appName: AppControlTarget) => void;
  toggleFeature: (appName: AppControlTarget, feature: AppFeatureKey) => void;
  setTimeLimit: (appName: AppControlTarget, minutes: number) => void;
  setScheduleRule: (appName: AppControlTarget, rule: ScheduleRule) => void;
  toggleSafeBrowsing: (key: keyof Omit<SafeBrowsingSettings, 'customDomains' | 'status'>) => void;
  setCustomDomains: (domains: string[]) => void;
  toggleStrictMode: () => void;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => void;
  syncAllSettings: () => void;
};

export const useControlStore = create<ControlState>()(
  persist(
    (set, get) => ({
      controls: seedControlSettings,
      safeBrowsing: seedSafeBrowsing,
      strictModeEnabled: false,
      permissionsGranted: false,

      // NEW: Check if accessibility service is enabled
      checkPermissions: async () => {
        if (!FocusZenSettings?.isAccessibilityServiceEnabled) {
          return;
        }
        
        try {
          const enabled = await FocusZenSettings.isAccessibilityServiceEnabled();
          set({ permissionsGranted: enabled });
          
          // Auto-sync settings if permissions just got granted
          if (enabled) {
            get().syncAllSettings();
          }
        } catch (error) {
          console.error('Failed to check permissions:', error);
        }
      },

      // NEW: Open accessibility settings
      requestPermissions: () => {
        if (FocusZenSettings?.openAccessibilitySettings) {
          FocusZenSettings.openAccessibilitySettings();
        }
      },

      syncAllSettings: () => {
        const state = get();
        if (FocusZenSettings) {
          state.controls.forEach(control => {
            FocusZenSettings.updateAppFeatures(control.appName, control.features);
          });
          FocusZenSettings.setStrictMode(state.strictModeEnabled);
          if (FocusZenSettings.setSafeBrowsing) {
            FocusZenSettings.setSafeBrowsing(
              state.safeBrowsing.adultContentBlock ?? false,
              state.safeBrowsing.gamblingBlock ?? false,
            );
          }
          if (FocusZenSettings.setCustomBlockedDomains && state.safeBrowsing.customDomains) {
            FocusZenSettings.setCustomBlockedDomains(state.safeBrowsing.customDomains);
          }
        }
      },
      toggleAppBlocked: (appName) => {
        const state = get();
        if (state.strictModeEnabled) return;

        const control = state.controls.find((c) => c.appName === appName);
        if (!control) return;

        const nextBlocked = !control.blocked;

        // When blocking: set blockApp + all feature flags to true
        // When unblocking: clear blockApp flag only, keep other features as-is
        const nextFeatures: Partial<Record<AppFeatureKey, boolean>> = nextBlocked
          ? (getControlOptionDescriptors(appName) || []).reduce(
              (acc, opt) => { acc[opt.key] = true; return acc; },
              { ...control.features, blockApp: true } as Partial<Record<AppFeatureKey, boolean>>
            )
          : { ...control.features, blockApp: false };

        set((s) => ({
          controls: s.controls.map((c) =>
            c.appName === appName
              ? { ...c, blocked: nextBlocked, features: nextFeatures }
              : c
          ),
        }));

        if (FocusZenSettings) {
          FocusZenSettings.updateAppFeatures(appName, nextFeatures);
        }
      },
      toggleFeature: (appName, feature) => {
        const state = get();
        if (state.strictModeEnabled) return;

        const control = state.controls.find((c) => c.appName === appName);
        if (!control) return;

        const nextValue = !(control.features[feature] ?? false);
        const nextFeatures: Partial<Record<AppFeatureKey, boolean>> = {
          ...control.features,
          [feature]: nextValue,
        };

        set((s) => ({
          controls: s.controls.map((c) => {
            if (c.appName !== appName) return c;
            return {
              ...c,
              blocked: feature === 'blockApp' ? nextValue : c.blocked,
              features: nextFeatures,
            };
          }),
        }));

        if (FocusZenSettings) {
          FocusZenSettings.updateAppFeatures(appName, nextFeatures);
        }
      },
      setTimeLimit: (appName, minutes) =>
        set((state) => ({
          controls: (state.controls || []).map((control) =>
            control.appName === appName ? { ...control, timeLimitMinutes: minutes } : control
          ),
        })),
      setScheduleRule: (appName, rule) =>
        set((state) => ({
          controls: (state.controls || []).map((control) =>
            control.appName === appName ? { ...control, scheduleRule: rule } : control
          ),
        })),
      toggleSafeBrowsing: (key) =>
        set((state) => {
          if (state.strictModeEnabled) return {};
          const updated = {
            ...state.safeBrowsing,
            [key]: !state.safeBrowsing[key],
          };
          // Sync to native SharedPrefs so AccessibilityService reads live values
          if (FocusZenSettings?.setSafeBrowsing) {
            FocusZenSettings.setSafeBrowsing(
              updated.adultContentBlock ?? false,
              updated.gamblingBlock ?? false,
            );
          }
          if (FocusZenSettings?.setCustomBlockedDomains && updated.customDomains) {
            FocusZenSettings.setCustomBlockedDomains(updated.customDomains);
          }
          return { safeBrowsing: updated };
        }),
      setCustomDomains: (domains) =>
        set((state) => ({
          safeBrowsing: { ...state.safeBrowsing, customDomains: domains },
        })),
      toggleStrictMode: () => set((state) => {
        const next = !state.strictModeEnabled;
        if (FocusZenSettings) {
          FocusZenSettings.setStrictMode(next);
        }
        return { strictModeEnabled: next };
      }),
    }),
    {
      name: STORAGE_KEYS.control,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
