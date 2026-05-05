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
  grantPermissions: () => void;
  syncAllSettings: () => void;
};

export const useControlStore = create<ControlState>()(
  persist(
    (set, get) => ({
      controls: seedControlSettings,
      safeBrowsing: seedSafeBrowsing,
      strictModeEnabled: false,
      permissionsGranted: false,
      grantPermissions: () => set({ permissionsGranted: true }),
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
      toggleAppBlocked: (appName) =>
        set((state) => {
          if (state.strictModeEnabled) return {};
          return {
            controls: (state.controls || []).map((control) =>
              control.appName === appName
                ? {
                    ...control,
                    blocked: !control.blocked,
                    features: !control.blocked
                      ? (getControlOptionDescriptors(control.appName) || []).reduce((acc, opt) => {
                          acc[opt.key] = true;
                          return acc;
                        }, { ...control.features } as Record<AppFeatureKey, boolean>)
                      : control.features,
                  }
                : control
            ),
          };
        }),
      toggleFeature: (appName, feature) =>
        set((state) => {
          if (state.strictModeEnabled) return {};
          const newControls = (state.controls || []).map((control) =>
            control.appName === appName
              ? {
                  ...control,
                  blocked: feature === 'blockApp' ? !(control.features[feature] ?? false) : control.blocked,
                  features: {
                    ...control.features,
                    [feature]: !(control.features[feature] ?? false),
                  },
                }
              : control
          );
          
          const updatedControl = newControls.find(c => c.appName === appName);
          if (updatedControl && FocusZenSettings) {
            FocusZenSettings.updateAppFeatures(appName, updatedControl.features);
          }
          
          return { controls: newControls };
        }),
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
