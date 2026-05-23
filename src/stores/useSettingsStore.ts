import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../storage/storage';
import { AppLanguage, AppSettings, PrivacyPreferences, ThemeMode } from '../types/models';
import { seedPrivacyPreferences, seedSettings } from '../data/seed';

type SettingsState = {
  settings: AppSettings;
  privacy: PrivacyPreferences;
  setThemeMode: (themeMode: ThemeMode) => void;
  setPurifyLanguage: (purifyLanguage: AppLanguage) => void;
  completeOnboarding: () => void;
  completePermissionsSetup: () => void;
  toggleNotifications: () => void;
  replayOnboarding: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: seedSettings,
      privacy: seedPrivacyPreferences,
      setThemeMode: (themeMode) =>
        set((state) => ({ settings: { ...state.settings, themeMode } })),
      setPurifyLanguage: (purifyLanguage) =>
        set((state) => ({ settings: { ...state.settings, purifyLanguage } })),
      completeOnboarding: () =>
        set((state) => ({
          privacy: { ...state.privacy, onboardingCompleted: true },
        })),
      completePermissionsSetup: () =>
        set((state) => ({
          privacy: { ...state.privacy, permissionsSetupCompleted: true },
        })),
      toggleStrictMode: () =>
        set((state) => {
          const nextVal = !state.settings.strictModeEnabled;
          if (NativeModules.FocusZenSettings?.setStrictMode) {
             NativeModules.FocusZenSettings.setStrictMode(nextVal);
          }
          return {
            settings: { ...state.settings, strictModeEnabled: nextVal },
          };
        }),
      toggleNotifications: () =>
        set((state) => ({
          privacy: { ...state.privacy, notificationsEnabled: !state.privacy.notificationsEnabled },
        })),
      replayOnboarding: () =>
        set((state) => ({
          privacy: { ...state.privacy, onboardingCompleted: false, permissionsSetupCompleted: false },
        })),
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && NativeModules.FocusZenSettings?.setStrictMode) {
          NativeModules.FocusZenSettings.setStrictMode(state.settings.strictModeEnabled);
        }
      },
    }
  )
);
