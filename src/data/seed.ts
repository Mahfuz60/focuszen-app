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

const today = new Date('2026-04-18T08:00:00.000Z');

function iso(offsetDays: number, hour: number, minute = 0) {
  const date = new Date(today);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const seedProfile: UserProfile = {
  id: 'user-1',
  displayName: 'FocusZen User',
  avatarLabel: 'FZ',
  focusLevel: 'Focus Pro',
  joinedAt: iso(-30, 7),
  pinEnabled: false,
  privacyModeEnabled: true,
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

export const seedFocusSessions = [
  {
    id: 'focus-1',
    startedAt: iso(0, 4),
    endedAt: iso(0, 4, 60),
    durationMinutes: 60,
    completedMinutes: 60,
    deepWork: true,
    status: 'completed' as const,
    presetLabel: '60m Deep Work',
    linkedTaskId: 'task-2',
  },
  {
    id: 'focus-2',
    startedAt: iso(-1, 16),
    endedAt: iso(-1, 16, 30),
    durationMinutes: 30,
    completedMinutes: 30,
    deepWork: false,
    status: 'completed' as const,
    presetLabel: '30m Reset',
  },
  {
    id: 'focus-3',
    startedAt: iso(-2, 14),
    endedAt: iso(-2, 15, 30),
    durationMinutes: 90,
    completedMinutes: 90,
    deepWork: true,
    status: 'completed' as const,
    presetLabel: '90m Flow',
  },
];

export const seedStudySessions: StudySession[] = [
  {
    id: 'study-1',
    startedAt: iso(0, 2),
    endedAt: iso(0, 3, 20),
    durationMinutes: 80,
    subject: 'Physics',
    category: 'Study',
  },
  {
    id: 'study-2',
    startedAt: iso(-1, 13),
    endedAt: iso(-1, 14),
    durationMinutes: 60,
    subject: 'Math',
    category: 'Study',
  },
  {
    id: 'study-3',
    startedAt: iso(-3, 12),
    endedAt: iso(-3, 13, 30),
    durationMinutes: 90,
    subject: 'Programming',
    category: 'Study',
  },
];

export const seedUsageEntries: UsageEntry[] = [
  { id: 'usage-1', appName: 'Instagram', packageName: APP_PACKAGE_NAMES.Instagram, date: iso(0, 19), minutesUsed: 92, opens: 18, peakHour: 22 },
  { id: 'usage-2', appName: 'YouTube', packageName: APP_PACKAGE_NAMES.YouTube, date: iso(0, 14), minutesUsed: 76, opens: 9, peakHour: 21 },
  { id: 'usage-3', appName: 'WhatsApp', packageName: APP_PACKAGE_NAMES.WhatsApp, date: iso(0, 9), minutesUsed: 48, opens: 20, peakHour: 13 },
  { id: 'usage-4', appName: 'X', packageName: APP_PACKAGE_NAMES.X, date: iso(0, 8), minutesUsed: 28, opens: 7, peakHour: 23 },
  { id: 'usage-5', appName: 'TikTok', packageName: APP_PACKAGE_NAMES.TikTok, date: iso(-1, 20), minutesUsed: 54, opens: 11, peakHour: 20 },
  { id: 'usage-6', appName: 'Facebook', packageName: APP_PACKAGE_NAMES.Facebook, date: iso(-2, 18), minutesUsed: 34, opens: 5, peakHour: 18 },
];

export const seedComparison: UsageComparison = {
  totalUserMinutes: 244,
  totalBenchmarkMinutes: 310,
  differencePercent: -21,
  narrative: 'You use social apps 21% less than the average benchmark this week.',
  snapshots: [
    { appName: 'YouTube', minutesUsed: 76, benchmarkMinutes: 96, deltaMinutes: -20 },
    { appName: 'Instagram', minutesUsed: 92, benchmarkMinutes: 110, deltaMinutes: -18 },
    { appName: 'Facebook', minutesUsed: 34, benchmarkMinutes: 42, deltaMinutes: -8 },
    { appName: 'TikTok', minutesUsed: 54, benchmarkMinutes: 62, deltaMinutes: -8 },
  ],
};

export const seedPlannerTasks: PlannerTask[] = [
  { id: 'task-1', title: 'Morning revision', category: 'Study', scheduledDate: iso(0, 0), startTime: '07:00', durationMinutes: 60, completed: true, focusPresetMinutes: 60, icon: 'book-outline' },
  { id: 'task-2', title: 'Deep work coding sprint', category: 'Work', scheduledDate: iso(0, 0), startTime: '10:00', durationMinutes: 90, completed: false, focusPresetMinutes: 90, icon: 'laptop-outline' },
  { id: 'task-3', title: 'Gym recovery walk', category: 'Health', scheduledDate: iso(0, 0), startTime: '18:00', durationMinutes: 30, completed: false, icon: 'walk-outline' },
];

export const seedRoutines: Routine[] = [
  {
    id: 'routine-1',
    name: 'Morning routine',
    activeDays: [1, 2, 3, 4, 5, 6],
    enabled: true,
    streakDays: 6,
    steps: [
      { id: 'step-1', title: 'Drink water', durationMinutes: 5, completed: true },
      { id: 'step-2', title: 'Stretch', durationMinutes: 10, completed: false },
      { id: 'step-3', title: 'Plan top 3 priorities', durationMinutes: 10, completed: false },
    ],
  },
  {
    id: 'routine-2',
    name: 'Night reset',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    streakDays: 4,
    steps: [
      { id: 'step-4', title: 'No phone after 10 PM', durationMinutes: 60, completed: false },
      { id: 'step-5', title: 'Prepare study desk', durationMinutes: 10, completed: true },
    ],
  },
];

export const seedGoals: Goal[] = [
  { id: 'goal-1', title: 'Study 20 hours', description: 'Build a strong weekly learning rhythm.', period: 'weekly', metric: 'study-hours', target: 20, current: 7.7, rewardBadgeId: 'badge-study' },
  { id: 'goal-2', title: 'Reduce social media 30%', description: 'Lower distraction time compared with last week.', period: 'monthly', metric: 'social-reduction', target: 30, current: 21, rewardBadgeId: 'badge-balance' },
  { id: 'goal-3', title: 'Complete 10 focus sessions', description: 'Stay consistent with deep work blocks.', period: 'weekly', metric: 'focus-sessions', target: 10, current: 3, rewardBadgeId: 'badge-focus' },
];

export const seedBadges: Badge[] = [
  { id: 'badge-study', label: 'Study Builder', description: 'Reach 20 study hours in a week.', unlocked: false, progress: 38, requirement: 100 },
  { id: 'badge-balance', label: 'Balanced Feed', description: 'Reduce social usage by 30%.', unlocked: false, progress: 70, requirement: 100 },
  { id: 'badge-focus', label: 'Deep Worker', description: 'Finish 10 focus sessions in a week.', unlocked: false, progress: 30, requirement: 100 },
  { id: 'badge-streak', label: 'Zen Master', description: 'Maintain a 14-day streak.', unlocked: false, progress: 50, requirement: 100 },
];

export const seedStreak: Streak = {
  current: 7,
  best: 14,
  lastCompletedDate: iso(0, 6),
};

export const seedSuggestions: SuggestionCard[] = [
  {
    id: 'suggestion-1',
    title: 'You spent 3h on social media today',
    body: 'Reduce 30% tonight and reclaim a full study block.',
    tone: 'warning',
    actionLabel: 'Block after 10 PM',
    actionTarget: 'Control',
  },
  {
    id: 'suggestion-2',
    title: 'You study best between 7-9 PM',
    body: 'Schedule your hardest subject in that window.',
    tone: 'positive',
    actionLabel: 'Open Planner',
    actionTarget: 'Planner',
  },
];

const seededControlMinutes: Record<AppControlTarget, number> = {
  YouTube: 76,
  Instagram: 92,
  Facebook: 34,
  Snapchat: 18,
  TikTok: 54,
  Telegram: 20,
  Line: 14,
  Messenger: 26,
  WhatsApp: 48,
  X: 28,
};

const seededControlFeatures: Record<AppControlTarget, AppControlSettings['features']> = {
  YouTube: {
    blockShorts: true,
    blockSearch: true,
    blockComments: false,
    blockPictureInPicture: false,
  },
  Instagram: {
    blockExplore: true,
    blockReels: true,
    blockStories: true,
  },
  Facebook: {
    blockFeed: true,
    blockStories: false,
    blockReels: false,
  },
  Snapchat: {
    blockSpotlight: true,
    blockStories: true,
  },
  TikTok: {
    blockSearch: true,
    blockComments: true,
  },
  Telegram: {
    blockChannels: false,
  },
  Line: {
    blockVoom: false,
  },
  Messenger: {
    blockStories: false,
  },
  WhatsApp: {
    blockStatus: false,
    blockChannels: false,
  },
  X: {
    blockExplore: true,
    blockComments: false,
  },
};

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
  blocked: appName === 'TikTok',
  todayUsageMinutes: seededControlMinutes[appName],
  timeLimitMinutes: appName === 'Instagram' ? 60 : appName === 'YouTube' ? 75 : undefined,
  requiresPermission: true,
  features: seededControlFeatures[appName],
}));
