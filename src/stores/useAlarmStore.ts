import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NapPreset = '10min' | '20min' | '26min' | '90min' | 'custom';

export type AlarmSession = {
  id: string;
  preset: NapPreset;
  durationMinutes: number;
  startedAt: string;
  completedAt: string | null;
};

type AlarmStore = {
  sessions: AlarmSession[];
  totalNapsTaken: number;
  addSession: (session: AlarmSession) => void;
  completeSession: (id: string) => void;
};

export const NAP_PRESETS: Record<NapPreset, { label: string; minutes: number; emoji: string; benefit: string }> = {
  '10min': {
    label: '10 min',
    minutes: 10,
    emoji: '⚡',
    benefit: 'Energy shot. Best between 1–3 PM.',
  },
  '20min': {
    label: '20 min',
    minutes: 20,
    emoji: '🧠',
    benefit: 'Peak cognitive reset. NASA approved.',
  },
  '26min': {
    label: '26 min',
    minutes: 26,
    emoji: '🚀',
    benefit: 'NASA pilot nap. +34% alertness.',
  },
  '90min': {
    label: '90 min',
    minutes: 90,
    emoji: '💫',
    benefit: 'Full sleep cycle. Deep recovery.',
  },
  custom: {
    label: 'Custom',
    minutes: 20,
    emoji: '⚙️',
    benefit: 'Set your own duration.',
  },
};

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set) => ({
      sessions: [],
      totalNapsTaken: 0,
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100),
          totalNapsTaken: state.totalNapsTaken + 1,
        })),
      completeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, completedAt: new Date().toISOString() } : s
          ),
        })),
    }),
    {
      name: 'focuszen/alarm',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
