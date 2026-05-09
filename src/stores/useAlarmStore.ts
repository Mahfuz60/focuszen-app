import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NapPreset = '10min' | '20min' | '30min' | '60min' | 'custom';

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
  activeSessionId: string | null;
  isAlarmFiring: boolean;
  addSession: (session: AlarmSession) => void;
  completeSession: (id: string) => void;
  cancelActiveSession: () => void;
  setAlarmFiring: (firing: boolean) => void;
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
  '30min': {
    label: '30 min',
    minutes: 30,
    emoji: '🚀',
    benefit: 'Advanced alertness boost. No inertia.',
  },
  '60min': {
    label: '60 min',
    minutes: 60,
    emoji: '💫',
    benefit: 'Deep restorative cycle. Full recovery.',
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
      activeSessionId: null,
      isAlarmFiring: false,
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100),
          totalNapsTaken: state.totalNapsTaken + 1,
          activeSessionId: session.id,
          isAlarmFiring: false,
        })),
      completeSession: (id) =>
        set((state) => ({
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
          isAlarmFiring: false,
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, completedAt: new Date().toISOString() } : s
          ),
        })),
      cancelActiveSession: () =>
        set((state) => ({
          activeSessionId: null,
          isAlarmFiring: false,
          sessions: state.sessions.filter((s) => s.id !== state.activeSessionId),
          totalNapsTaken: Math.max(0, state.totalNapsTaken - 1),
        })),
      setAlarmFiring: (firing) => set({ isAlarmFiring: firing }),
    }),
    {
      name: 'focuszen/alarm',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
