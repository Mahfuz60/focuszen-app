import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedControlSettings } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { AppControlSettings, AppControlTarget, AppFeatureKey, SafeBrowsingSettings, ScheduleRule } from '../types/models';

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
};

export const useControlStore = create<ControlState>()(
  persist(
    (set) => ({
      controls: seedControlSettings,
      safeBrowsing: seedSafeBrowsing,
      strictModeEnabled: false,
      permissionsGranted: false,
      grantPermissions: () => set({ permissionsGranted: true }),
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
                      ? Object.keys(control.features).reduce((acc, key) => {
                          acc[key as AppFeatureKey] = true;
                          return acc;
                        }, {} as Record<AppFeatureKey, boolean>)
                      : control.features,
                  }
                : control
            ),
          };
        }),
      toggleFeature: (appName, feature) =>
        set((state) => {
          if (state.strictModeEnabled) return {};
          return {
            controls: (state.controls || []).map((control) =>
              control.appName === appName
                ? {
                    ...control,
                    features: {
                      ...control.features,
                      [feature]: !(control.features[feature] ?? true),
                    },
                  }
                : control
            ),
          };
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
          return {
            safeBrowsing: {
              ...state.safeBrowsing,
              [key]: !state.safeBrowsing[key],
            },
          };
        }),
      setCustomDomains: (domains) =>
        set((state) => ({
          safeBrowsing: { ...state.safeBrowsing, customDomains: domains },
        })),
      toggleStrictMode: () => set((state) => ({ strictModeEnabled: !state.strictModeEnabled })),
    }),
    {
      name: STORAGE_KEYS.control,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
