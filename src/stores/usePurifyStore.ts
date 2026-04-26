import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seedPurifyState } from '../data/seed';
import { localNotificationService } from '../services/localServices';
import { STORAGE_KEYS } from '../storage/storage';
import { PurifyMilestoneKey, PurifyState } from '../types/models';
import { useSettingsStore } from './useSettingsStore';
import { buildPurifyStatus, getPurifyMilestoneNotification, PurifyLanguage } from '../utils/purifyProgress';

type PurifyStore = {
  purify: PurifyState;
  startPurify: (nowIso?: string) => void;
  resetPurify: (nowIso?: string) => void;
  refreshPurify: (nowIso: string, language: PurifyLanguage) => Promise<PurifyMilestoneKey[]>;
};

export const usePurifyStore = create<PurifyStore>()(
  persist(
    (set, get) => ({
      purify: seedPurifyState,
      startPurify: (nowIso = new Date().toISOString()) =>
        set((state) => ({
          purify: {
            ...state.purify,
            active: true,
            startedAt: nowIso,
            lastCheckInAt: nowIso,
            currentStreakDays: 1,
            reachedMilestones: [],
            lastResetAt: null,
          },
        })),
      resetPurify: (nowIso = new Date().toISOString()) =>
        set((state) => ({
          purify: {
            ...state.purify,
            active: false,
            startedAt: null,
            lastCheckInAt: null,
            lifetimeDays: state.purify.lifetimeDays + state.purify.currentStreakDays,
            bestStreakDays: Math.max(state.purify.bestStreakDays, state.purify.currentStreakDays),
            currentStreakDays: 0,
            reachedMilestones: [],
            lastResetAt: nowIso,
          },
        })),
      refreshPurify: async (nowIso, language) => {
        const state = get().purify;
        const status = buildPurifyStatus({
          state,
          nowIso,
          language,
        });

        if (!state.active) {
          return [];
        }

        if (!status.active) {
          set({
            purify: {
              ...state,
              active: false,
              startedAt: null,
              lastCheckInAt: null,
              lifetimeDays: state.lifetimeDays + state.currentStreakDays,
              bestStreakDays: Math.max(state.bestStreakDays, state.currentStreakDays),
              currentStreakDays: 0,
              reachedMilestones: [],
              lastResetAt: nowIso,
            },
          });
          return [];
        }

        const reachedNow = status.reachedNow;
        const nextReached = [...state.reachedMilestones, ...reachedNow];

        set({
          purify: {
            ...state,
            lastCheckInAt: nowIso,
            currentStreakDays: status.currentStreakDays,
            bestStreakDays: status.bestStreakDays,
            reachedMilestones: nextReached,
          },
        });

        if (!reachedNow.length || !useSettingsStore.getState().privacy.notificationsEnabled) {
          return reachedNow;
        }

        for (const milestone of reachedNow) {
          const notification = getPurifyMilestoneNotification({
            milestone,
            language,
            quoteTone: milestone === '7-days' || milestone === '14-days' ? 'english' : 'islamic',
          });
          await localNotificationService.schedulePurifyMilestoneNotification(
            notification.title,
            notification.body
          );
        }

        return reachedNow;
      },
    }),
    {
      name: STORAGE_KEYS.purify,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
