import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedComparison, seedUsageEntries } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { UsageComparison, UsageEntry } from '../types/models';
import { calculateComparison } from '../utils/comparison';

type UsageState = {
  entries: UsageEntry[];
  comparison: UsageComparison;
  dailyLimitMinutes: number;
  addUsageEntry: (entry: UsageEntry) => void;
  refreshComparison: () => void;
  setDailyLimit: (limit: number) => void;
};

export const useUsageStore = create<UsageState>()(
  persist(
    (set) => ({
      entries: seedUsageEntries,
      comparison: seedComparison,
      dailyLimitMinutes: 120,
      addUsageEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
          comparison: calculateComparison([entry, ...state.entries], seedComparison),
        })),
      refreshComparison: () =>
        set((state) => ({
          comparison: calculateComparison(state.entries, seedComparison),
        })),
      setDailyLimit: (dailyLimitMinutes) => set({ dailyLimitMinutes }),
    }),
    {
      name: STORAGE_KEYS.usage,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
