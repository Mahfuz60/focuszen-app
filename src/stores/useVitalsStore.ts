import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WaterEntry = {
  id: string;
  amountMl: number;
  loggedAt: string;
};

export type EyeRestLog = {
  id: string;
  completedAt: string;
};

type VitalsStore = {
  waterGoalMl: number;
  waterEntries: WaterEntry[];
  eyeRestLogs: EyeRestLog[];
  totalWaterToday: number;
  setWaterGoal: (ml: number) => void;
  logWater: (amountMl: number) => void;
  logEyeRest: () => void;
  resetDailyWater: () => void;
};

export const WATER_PRESETS_ML = [150, 250, 350, 500] as const;

export function computeTodayWater(entries: WaterEntry[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return entries
    .filter((e) => new Date(e.loggedAt) >= todayStart)
    .reduce((sum, e) => sum + e.amountMl, 0);
}

export const useVitalsStore = create<VitalsStore>()(
  persist(
    (set, get) => ({
      waterGoalMl: 2500,
      waterEntries: [],
      eyeRestLogs: [],
      totalWaterToday: 0,
      setWaterGoal: (ml) => set({ waterGoalMl: ml }),
      logWater: (amountMl) => {
        const entry: WaterEntry = {
          id: `water-${Date.now()}`,
          amountMl,
          loggedAt: new Date().toISOString(),
        };
        set((state) => {
          const updated = [entry, ...state.waterEntries].slice(0, 500);
          return {
            waterEntries: updated,
            totalWaterToday: computeTodayWater(updated),
          };
        });
      },
      logEyeRest: () => {
        const log: EyeRestLog = {
          id: `eye-${Date.now()}`,
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          eyeRestLogs: [log, ...state.eyeRestLogs].slice(0, 200),
        }));
      },
      resetDailyWater: () => {
        const entries = get().waterEntries;
        set({ totalWaterToday: computeTodayWater(entries) });
      },
    }),
    {
      name: 'focuszen/vitals',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalWaterToday = computeTodayWater(state.waterEntries);
        }
      },
    }
  )
);
