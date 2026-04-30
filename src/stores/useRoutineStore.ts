import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedRoutines } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { RoutineStep } from '../types/models';

type RoutineState = {
  routines: typeof seedRoutines;
  toggleRoutineEnabled: (routineId: string) => void;
  toggleStepCompleted: (routineId: string, stepId: string) => void;
  addStep: (routineId: string, step: RoutineStep) => void;
  reorderSteps: (routineId: string, fromIndex: number, toIndex: number) => void;
};

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      routines: seedRoutines,
      toggleRoutineEnabled: (routineId) =>
        set((state) => ({
          routines: (state.routines || []).map((routine) =>
            routine.id === routineId ? { ...routine, enabled: !routine.enabled } : routine
          ),
        })),
      toggleStepCompleted: (routineId, stepId) =>
        set((state) => ({
          routines: (state.routines || []).map((routine) =>
            routine.id === routineId
              ? {
                  ...routine,
                  steps: (routine.steps || []).map((step) =>
                    step.id === stepId ? { ...step, completed: !step.completed } : step
                  ),
                }
              : routine
          ),
        })),
      addStep: (routineId, step) =>
        set((state) => ({
          routines: (state.routines || []).map((routine) =>
            routine.id === routineId ? { ...routine, steps: [...routine.steps, step] } : routine
          ),
        })),
      reorderSteps: (routineId, fromIndex, toIndex) =>
        set((state) => ({
          routines: (state.routines || []).map((routine) => {
            if (routine.id !== routineId) {
              return routine;
            }

            const steps = [...routine.steps];
            const [moved] = steps.splice(fromIndex, 1);
            steps.splice(toIndex, 0, moved);
            return { ...routine, steps };
          }),
        })),
    }),
    {
      name: STORAGE_KEYS.routine,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
