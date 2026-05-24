import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DrinkType = 'Water' | 'Coffee' | 'Tea' | 'Juice' | 'Milk';

export type WaterEntry = {
  id: string;
  amountMl: number;
  loggedAt: string;
  type: DrinkType;
};

export type EyeRestLog = {
  id: string;
  completedAt: string;
  type: '20-20-20' | 'rapid-blink' | 'palming' | 'figure-8' | 'near-far';
};

type BodyCareStore = {
  waterGoalMl: number;
  waterEntries: WaterEntry[];
  eyeRestLogs: EyeRestLog[];
  totalWaterToday: number;
  lastVolumes: Record<DrinkType, number>;
  lastType: DrinkType;
  setWaterGoal: (ml: number) => void;
  updateGoal: (ml: number) => void;
  logWater: (amountMl: number, type?: DrinkType) => void;
  deleteWaterEntry: (id: string) => void;
  logEyeRest: (type?: EyeRestLog['type']) => void;
  resetDailyWater: () => void;
};

export const WATER_PRESETS_ML = [250, 350, 500, 1000] as const;

export const DRINK_TYPES: { type: DrinkType; label: string; icon: string; imageUri: string; color: string }[] = [
  { type: 'Water', label: 'Water', icon: 'water', imageUri: 'https://img.icons8.com/fluency/96/water.png', color: '#38bdf8' },
  { type: 'Coffee', label: 'Coffee', icon: 'cafe', imageUri: 'https://img.icons8.com/fluency/96/coffee-to-go.png', color: '#8b5e3c' },
  { type: 'Tea', label: 'Tea', icon: 'leaf', imageUri: 'https://img.icons8.com/fluency/96/tea.png', color: '#10b981' },
  { type: 'Juice', label: 'Juice', icon: 'sunny', imageUri: 'https://img.icons8.com/fluency/96/orange-juice.png', color: '#fbbf24' },
  { type: 'Milk', label: 'Milk', icon: 'color-fill', imageUri: 'https://img.icons8.com/fluency/96/milk-bottle.png', color: '#94a3b8' },
];

export function computeTodayWater(entries: WaterEntry[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return (entries || [])
    .filter((e) => e && e.loggedAt && new Date(e.loggedAt) >= todayStart)
    .reduce((sum, e) => sum + (e.amountMl || 0), 0);
}

export const useBodyCareStore = create<BodyCareStore>()(
  persist(
    (set, get) => ({
      waterGoalMl: 2500,
      waterEntries: [],
      eyeRestLogs: [],
      totalWaterToday: 0,
      lastVolumes: {
        Water: 250,
        Coffee: 200,
        Tea: 200,
        Juice: 330,
        Milk: 200
      },
      lastType: 'Water',
      setWaterGoal: (ml) => set({ waterGoalMl: ml }),
      updateGoal: (ml) => set({ waterGoalMl: ml }),
      logWater: (amountMl, type = 'Water') => {
        const entry: WaterEntry = {
          id: `water-${Date.now()}`,
          amountMl,
          loggedAt: new Date().toISOString(),
          type,
        };
        set((state) => {
          const updated = [entry, ...(state.waterEntries || [])].slice(0, 500);
          return {
            waterEntries: updated,
            totalWaterToday: computeTodayWater(updated),
            lastVolumes: { ...(state.lastVolumes || {}), [type]: amountMl },
            lastType: type
          };
        });
      },
      logEyeRest: (type = '20-20-20') => {
        const log: EyeRestLog = {
          id: `eye-${Date.now()}`,
          completedAt: new Date().toISOString(),
          type,
        };
        set((state) => ({
          eyeRestLogs: [log, ...(state.eyeRestLogs || [])].slice(0, 200),
        }));
      },
      deleteWaterEntry: (id: string) => {
        set((state) => {
          const updated = (state.waterEntries || []).filter(e => e.id !== id);
          return {
            waterEntries: updated,
            totalWaterToday: computeTodayWater(updated),
          };
        });
      },
      resetDailyWater: () => {
        const entries = get().waterEntries;
        set({ totalWaterToday: computeTodayWater(entries) });
      },
    }),
    {
      name: 'focuszen/bodycare',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalWaterToday = computeTodayWater(state.waterEntries);
        }
      },
    }
  )
);
