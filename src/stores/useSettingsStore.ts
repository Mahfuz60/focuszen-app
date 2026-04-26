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
  toggleStrictMode: () => void;
  toggleNotifications: () => void;
  replayOnboarding: () => void;
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
      toggleStrictMode: () =>
        set((state) => ({
          settings: { ...state.settings, strictModeEnabled: !state.settings.strictModeEnabled },
        })),
      toggleNotifications: () =>
        set((state) => ({
          privacy: { ...state.privacy, notificationsEnabled: !state.privacy.notificationsEnabled },
        })),
      replayOnboarding: () =>
        set((state) => ({
          privacy: { ...state.privacy, onboardingCompleted: false },
        })),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
