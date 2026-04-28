import {
  AppControlSettings,
  AppControlTarget,
  AppSettings,
  Badge,
  Goal,
  PlannerTask,
  PrivacyPreferences,
  PurifyState,
  Routine,
  Streak,
  StudySession,
  SuggestionCard,
  UsageComparison,
  UsageEntry,
  UserProfile,
} from '../types/models';
import { APP_PACKAGE_NAMES, SOCIAL_APPS } from '../constants/apps';


export const seedProfile: UserProfile = {
  id: 'user-1',
  displayName: 'FocusZen User',
  avatarLabel: 'FZ',
  focusLevel: 'Seedling',
  joinedAt: new Date().toISOString(),
  pinEnabled: false,
  privacyModeEnabled: false,
};

export const seedSettings: AppSettings = {
  themeMode: 'system',
  strictModeEnabled: false,
  localRemindersEnabled: true,
  purifyLanguage: 'en',
};

export const seedPurifyState: PurifyState = {
  active: false,
  startedAt: null,
  lastCheckInAt: null,
  currentStreakDays: 0,
  bestStreakDays: 0,
  lifetimeDays: 0,
  reachedMilestones: [],
  lastResetAt: null,
};

export const seedPrivacyPreferences: PrivacyPreferences = {
  notificationsEnabled: true,
  onboardingCompleted: false,
  exportIncludesHistory: true,
};

export const seedFocusSessions: any[] = [];
export const seedStudySessions: StudySession[] = [];
export const seedUsageEntries: UsageEntry[] = [];

export const seedComparison: UsageComparison = {
  totalUserMinutes: 0,
  totalBenchmarkMinutes: 0,
  differencePercent: 0,
  narrative: 'No usage data collected yet. Keep focusing!',
  snapshots: [],
};

export const seedPlannerTasks: PlannerTask[] = [];
export const seedRoutines: Routine[] = [];
export const seedGoals: Goal[] = [];

export const seedBadges: Badge[] = [
  { id: 'badge-study', label: 'Study Builder', description: 'Reach 20 study hours in a week.', unlocked: false, progress: 0, requirement: 100 },
  { id: 'badge-balance', label: 'Balanced Feed', description: 'Reduce social usage by 30%.', unlocked: false, progress: 0, requirement: 100 },
  { id: 'badge-focus', label: 'Deep Worker', description: 'Finish 10 focus sessions in a week.', unlocked: false, progress: 0, requirement: 100 },
  { id: 'badge-streak', label: 'Zen Master', description: 'Maintain a 14-day streak.', unlocked: false, progress: 0, requirement: 100 },
];

export const seedStreak: Streak = {
  current: 0,
  best: 0,
};

export const seedSuggestions: SuggestionCard[] = [];

export const seedControlSettings: AppControlSettings[] = SOCIAL_APPS.map((appName) => ({
  appName,
  packageName: APP_PACKAGE_NAMES[appName],
  icon:
    appName === 'YouTube'
      ? 'logo-youtube'
      : appName === 'Instagram'
        ? 'logo-instagram'
        : appName === 'Facebook'
          ? 'logo-facebook'
          : appName === 'Snapchat'
            ? 'logo-snapchat'
            : appName === 'TikTok'
              ? 'logo-tiktok'
              : appName === 'Telegram'
                ? 'paper-plane'
                : appName === 'Line'
                  ? 'chatbubbles'
                : appName === 'Messenger'
                  ? 'chatbubble-ellipses'
                  : appName === 'WhatsApp'
                    ? 'logo-whatsapp'
                    : 'logo-twitter',
  blocked: false,
  todayUsageMinutes: 0,
  timeLimitMinutes: undefined,
  requiresPermission: true,
  features: {},
}));
