import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedBadges, seedGoals, seedStreak, seedSuggestions } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { GoalMetric, SuggestionCard } from '../types/models';
import { unlockBadges } from '../utils/badges';
import { calculateStreak } from '../utils/streaks';

type GoalsState = {
  goals: typeof seedGoals;
  badges: typeof seedBadges;
  streak: typeof seedStreak;
  suggestions: SuggestionCard[];
  incrementGoalMetric: (metric: GoalMetric, value: number) => void;
  refreshBadges: () => void;
  registerCompletion: () => void;
  setSuggestions: (suggestions: SuggestionCard[]) => void;
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: seedGoals,
      badges: seedBadges,
      streak: seedStreak,
      suggestions: seedSuggestions,
      incrementGoalMetric: (metric, value) =>
        set((state) => ({
          goals: (state.goals || []).map((goal) =>
            goal.metric === metric ? { ...goal, current: goal.current + value } : goal
          ),
        })),
      refreshBadges: () =>
        set((state) => ({
          badges: unlockBadges(state.badges || [], state.goals || [], state.streak, new Date().toISOString()),
        })),
      registerCompletion: () => {
        const streak = calculateStreak(get().streak, new Date().toISOString());
        set((state) => ({
          streak,
          badges: unlockBadges(state.badges || [], state.goals || [], streak, new Date().toISOString()),
        }));
      },
      setSuggestions: (suggestions) => set({ suggestions }),
    }),
    {
      name: STORAGE_KEYS.goals,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
