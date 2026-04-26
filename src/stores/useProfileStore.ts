import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedProfile } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';

type ProfileState = {
  profile: typeof seedProfile;
  setDisplayName: (displayName: string) => void;
  togglePinProtection: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: seedProfile,
      setDisplayName: (displayName) =>
        set((state) => {
          const trimmedName = displayName.trim();
          const initials = trimmedName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'FZ';

          return {
            profile: {
              ...state.profile,
              displayName: trimmedName,
              avatarLabel: initials,
            },
          };
        }),
      togglePinProtection: () =>
        set((state) => ({
          profile: { ...state.profile, pinEnabled: !state.profile.pinEnabled },
        })),
    }),
    {
      name: STORAGE_KEYS.profile,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
