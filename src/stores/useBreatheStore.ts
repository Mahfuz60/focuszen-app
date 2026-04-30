import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BreathePattern = 'box' | '4-7-8' | 'physiological' | 'custom';

export type BreatheSession = {
  id: string;
  pattern: BreathePattern;
  durationSeconds: number;
  completedAt: string;
};

export type BreathePhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

type BreatheStore = {
  sessions: BreatheSession[];
  totalSessionsCompleted: number;
  addSession: (session: BreatheSession) => void;
};

export const BREATHE_PATTERNS: Record<BreathePattern, { label: string; inhale: number; hold: number; exhale: number; hold2: number; description: string }> = {
  box: {
    label: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    hold2: 4,
    description: 'Equal rhythm. Used by Navy SEALs for stress control.',
  },
  '4-7-8': {
    label: '4-7-8 Breathing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    hold2: 0,
    description: 'Activates parasympathetic. Ideal before sleep or focus.',
  },
  physiological: {
    label: 'Physiological Sigh',
    inhale: 5,
    hold: 2,
    exhale: 8,
    hold2: 0,
    description: 'Double inhale. Fastest anxiety reducer known to science.',
  },
  custom: {
    label: 'Custom',
    inhale: 4,
    hold: 4,
    exhale: 6,
    hold2: 0,
    description: 'Your own rhythm.',
  },
};

export const useBreatheStore = create<BreatheStore>()(
  persist(
    (set) => ({
      sessions: [],
      totalSessionsCompleted: 0,
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100),
          totalSessionsCompleted: state.totalSessionsCompleted + 1,
        })),
    }),
    {
      name: 'focuszen/breathe',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
