import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedPlannerTasks } from '../data/seed';
import { STORAGE_KEYS } from '../storage/storage';
import { PlannerTask } from '../types/models';

type PlannerState = {
  selectedDate: string;
  tasks: PlannerTask[];
  setSelectedDate: (isoDate: string) => void;
  addTask: (task: PlannerTask) => void;
  updateTask: (taskId: string, updates: Partial<PlannerTask>) => void;
  toggleTaskCompleted: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  markTaskInProgressFromFocus: (taskId?: string) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      selectedDate: new Date().toISOString(),
      tasks: seedPlannerTasks,
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: (state.tasks || []).map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      toggleTaskCompleted: (taskId) =>
        set((state) => ({
          tasks: (state.tasks || []).map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      markTaskInProgressFromFocus: (taskId) =>
        set((state) => ({
          tasks: (state.tasks || []).map((task) =>
            task.id === taskId ? { ...task, completed: true } : task
          ),
        })),
    }),
    {
      name: STORAGE_KEYS.planner,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
