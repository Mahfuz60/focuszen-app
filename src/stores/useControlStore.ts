import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const { FocusZenSettings } = NativeModules;
import { seedControlSettings } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { AppControlSettings, AppControlTarget, AppFeatureKey, SafeBrowsingSettings, ScheduleRule } from '../types/models';
import { getControlOptionDescriptors } from '../utils/controlOptions';
import { syncRulesToNative } from '../modules/AppBlockerModule';

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
  permissionsGranted: boolean;
  toggleAppBlocked: (appName: AppControlTarget) => void;
  toggleFeature: (appName: AppControlTarget, feature: AppFeatureKey) => void;
  setTimeLimit: (appName: AppControlTarget, minutes: number) => void;
  setScheduleRule: (appName: AppControlTarget, rule: ScheduleRule) => void;
  toggleSafeBrowsing: (key: keyof Omit<SafeBrowsingSettings, 'customDomains' | 'status'>) => void;
  setCustomDomains: (domains: string[]) => void;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => void;
  syncAllSettings: () => void;
};

export const useControlStore = create<ControlState>()(
  persist(
    (set, get) => ({
      controls: seedControlSettings,
      safeBrowsing: seedSafeBrowsing,
      permissionsGranted: false,

      // NEW: Check if accessibility service is enabled
    checkPermissions: async () => {
  if (!FocusZenSettings?.isAccessibilityServiceEnabled) {
    set({ permissionsGranted: false });
    return;
  }

  try {
    const enabled = await FocusZenSettings.isAccessibilityServiceEnabled();
    set({ permissionsGranted: enabled });

    if (enabled) {
      get().syncAllSettings();
      FocusZenSettings.startService?.();
    } else {
      FocusZenSettings.stopService?.();
    }
  } catch (error) {
    console.error('Failed to check permissions:', error);
    set({ permissionsGranted: false });
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
        syncRulesToNative(state.controls);
      },
      toggleAppBlocked: (appName) => {
        const state = get();

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

        const nextControls = state.controls.map((c) =>
          c.appName === appName
            ? { ...c, blocked: nextBlocked, features: nextFeatures }
            : c
        );

        set({ controls: nextControls });

        if (FocusZenSettings) {
          FocusZenSettings.updateAppFeatures(appName, nextFeatures);
        }
        syncRulesToNative(nextControls);
      },
      toggleFeature: (appName, feature) => {
        const state = get();

        const control = state.controls.find((c) => c.appName === appName);
        if (!control) return;

        const nextValue = !(control.features[feature] ?? false);
        const nextFeatures: Partial<Record<AppFeatureKey, boolean>> = {
          ...control.features,
          [feature]: nextValue,
        };

        const nextControls = state.controls.map((c) => {
          if (c.appName !== appName) return c;
          return {
            ...c,
            blocked: feature === 'blockApp' ? nextValue : c.blocked,
            features: nextFeatures,
          };
        });

        set({ controls: nextControls });

        if (FocusZenSettings) {
          FocusZenSettings.updateAppFeatures(appName, nextFeatures);
        }
        syncRulesToNative(nextControls);
      },
      setTimeLimit: (appName, minutes) => {
        const nextControls = (get().controls || []).map((control) =>
          control.appName === appName ? { ...control, timeLimitMinutes: minutes } : control
        );
        set({ controls: nextControls });
        syncRulesToNative(nextControls);
      },
      setScheduleRule: (appName, rule) => {
        const nextControls = (get().controls || []).map((control) =>
          control.appName === appName ? { ...control, scheduleRule: rule } : control
        );
        set({ controls: nextControls });
        syncRulesToNative(nextControls);
      },
      toggleSafeBrowsing: (key) =>
        set((state) => {
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
    }),
    {
      name: STORAGE_KEYS.control,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.syncAllSettings();
      },
    }
  )
);
