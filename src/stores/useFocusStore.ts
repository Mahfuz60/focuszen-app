import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const { FocusZenSettings } = NativeModules;
import { STORAGE_KEYS } from '../storage/storage';
import { FocusSession } from '../types/models';
import { seedFocusSessions } from '../data/seed';
import { extendActiveFocusSession, setActiveFocusSessionTotalMinutes } from '../utils/focusSession';

type ActiveFocusSession = {
  startedAt: string;
  presetMinutes: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  deepWork: boolean;
  linkedTaskId?: string;
};

type FocusState = {
  sessions: FocusSession[];
  activeSession: ActiveFocusSession | null;
  selectedPreset: number;
  deepWorkEnabled: boolean;
  startSession: (presetMinutes: number, linkedTaskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tick: () => void;
  resetSession: () => void;
  addSessionMinutes: (extraMinutes: number) => void;
  setSessionTotalMinutes: (minutes: number) => void;
  completeSession: () => FocusSession | null;
  cancelSession: () => void;
  setDeepWorkEnabled: (enabled: boolean) => void;
  setSelectedPreset: (minutes: number) => void;
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: seedFocusSessions,
      activeSession: null,
      selectedPreset: 30,
      deepWorkEnabled: true,
      startSession: (presetMinutes, linkedTaskId) =>
        set((state) => {
          if (FocusZenSettings) {
            FocusZenSettings.setFocusSession(true, state.deepWorkEnabled);
          }
          return {
            selectedPreset: presetMinutes,
            activeSession: {
              startedAt: new Date().toISOString(),
              presetMinutes,
              remainingSeconds: presetMinutes * 60,
              elapsedSeconds: 0,
              paused: false,
              deepWork: state.deepWorkEnabled,
              linkedTaskId,
            },
          };
        }),
      pauseSession: () =>
        set((state) => {
          if (FocusZenSettings) {
            FocusZenSettings.setFocusSession(false, state.deepWorkEnabled);
          }
          return {
            activeSession: state.activeSession ? { ...state.activeSession, paused: true } : null,
          };
        }),
      resumeSession: () =>
        set((state) => {
          if (FocusZenSettings) {
            FocusZenSettings.setFocusSession(true, state.deepWorkEnabled);
          }
          return {
            activeSession: state.activeSession ? { ...state.activeSession, paused: false } : null,
          };
        }),
      tick: () =>
        set((state) => {
          if (!state.activeSession || state.activeSession.paused) {
            return state;
          }

          const remainingSeconds = Math.max(0, state.activeSession.remainingSeconds - 1);
          const elapsedSeconds = state.activeSession.elapsedSeconds + 1;

          return {
            activeSession: {
              ...state.activeSession,
              remainingSeconds,
              elapsedSeconds,
            },
          };
        }),
      resetSession: () =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                remainingSeconds: state.activeSession.presetMinutes * 60,
                elapsedSeconds: 0,
                paused: true,
              }
            : null,
        })),
      addSessionMinutes: (extraMinutes) =>
        set((state) => ({
          activeSession: extendActiveFocusSession(state.activeSession, extraMinutes),
        })),
      setSessionTotalMinutes: (minutes) =>
        set((state) => ({
          selectedPreset: Math.max(15, Math.round(minutes)),
          activeSession: setActiveFocusSessionTotalMinutes(state.activeSession, minutes),
        })),
      cancelSession: () => set((state) => {
        if (FocusZenSettings) {
          FocusZenSettings.setFocusSession(false, state.deepWorkEnabled);
        }
        return { activeSession: null, selectedPreset: 30 };
      }),
      completeSession: () => {
        const state = get();
        if (!state.activeSession) {
          return null;
        }

        if (FocusZenSettings) {
          FocusZenSettings.setFocusSession(false, state.deepWorkEnabled);
        }

        const nowIso = new Date().toISOString();
        const completed: FocusSession = {
          id: `focus-${nowIso}`,
          startedAt: state.activeSession.startedAt,
          endedAt: nowIso,
          durationMinutes: state.activeSession.presetMinutes,
          completedMinutes: Math.round(state.activeSession.elapsedSeconds / 60) || state.activeSession.presetMinutes,
          deepWork: state.activeSession.deepWork,
          linkedTaskId: state.activeSession.linkedTaskId,
          status: 'completed',
          presetLabel: `${state.activeSession.presetMinutes}m Focus`,
        };

        set({
          sessions: [completed, ...state.sessions],
          activeSession: null,
          selectedPreset: 30,
        });

        return completed;
      },
      setDeepWorkEnabled: (enabled) => set((state) => {
        if (state.activeSession && FocusZenSettings) {
          FocusZenSettings.setFocusSession(!state.activeSession.paused, enabled);
        }
        return { deepWorkEnabled: enabled };
      }),
      setSelectedPreset: (minutes) =>
        set((state) => {
          if (FocusZenSettings) {
            FocusZenSettings.setFocusSession(false, state.deepWorkEnabled);
          }
          return {
            selectedPreset: minutes,
            activeSession: state.activeSession
              ? {
                  ...state.activeSession,
                  startedAt: new Date().toISOString(),
                  presetMinutes: minutes,
                  remainingSeconds: minutes * 60,
                  elapsedSeconds: 0,
                  paused: true,
                }
              : null,
          };
        }),
    }),
    {
      name: STORAGE_KEYS.focus,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        activeSession: state.activeSession,
        selectedPreset: state.selectedPreset,
        deepWorkEnabled: state.deepWorkEnabled,
      }),
    }
  )
);
