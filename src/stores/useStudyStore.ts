import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../storage/storage';
import { StudySession } from '../types/models';
import { seedStudySessions } from '../data/seed';

type StudyState = {
  sessions: StudySession[];
  addStudySession: (session: StudySession) => void;
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      sessions: seedStudySessions,
      addStudySession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
    }),
    {
      name: STORAGE_KEYS.study,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
