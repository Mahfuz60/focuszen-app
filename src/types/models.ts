export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'en' | 'bn';
export type PurifyMilestoneKey = '7-days' | '14-days' | '30-days' | '90-days' | '365-days';

export type FocusLevel = 'Seedling' | 'Focus Pro' | 'Deep Worker' | 'Zen Master';

export type SessionStatus = 'running' | 'paused' | 'completed' | 'cancelled';

export type PlannerCategory = 'Study' | 'Work' | 'Health' | 'Personal';

export type GoalPeriod = 'weekly' | 'monthly';

export type GoalMetric = 'study-hours' | 'focus-sessions' | 'social-reduction' | 'planner-completion';

export type SuggestionTone = 'info' | 'positive' | 'warning';

export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'night';

export type AppFeatureKey =
  | 'blockApp'
  | 'blockShorts'
  | 'blockSearch'
  | 'blockFeed'
  | 'blockExplore'
  | 'blockStories'
  | 'blockComments'
  | 'blockPictureInPicture'
  | 'blockChannels'
  | 'blockStatus'
  | 'blockSpotlight'
  | 'blockReels'
  | 'blockVoom';

export type AppControlTarget =
  | 'YouTube'
  | 'Instagram'
  | 'Facebook'
  | 'Snapchat'
  | 'TikTok'
  | 'Telegram'
  | 'Line'
  | 'Messenger'
  | 'WhatsApp'
  | 'X';

export type UserProfile = {
  id: string;
  displayName: string;
  avatarLabel: string;
  focusLevel: FocusLevel;
  joinedAt: string;
  pinEnabled: boolean;
  privacyModeEnabled: boolean;
};

export type FocusSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  completedMinutes: number;
  deepWork: boolean;
  linkedTaskId?: string;
  status: SessionStatus;
  presetLabel: string;
};

export type StudySession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  subject: string;
  category: PlannerCategory;
};

export type UsageEntry = {
  id: string;
  appName: AppControlTarget;
  packageName: string;
  date: string;
  minutesUsed: number;
  opens: number;
  peakHour: number;
};

export type AppUsageSnapshot = {
  appName: AppControlTarget;
  minutesUsed: number;
  benchmarkMinutes: number;
  deltaMinutes: number;
};

export type UsageComparison = {
  totalUserMinutes: number;
  totalBenchmarkMinutes: number;
  differencePercent: number;
  snapshots: AppUsageSnapshot[];
  narrative: string;
};

export type TimeLimitRule = {
  id: string;
  appName: AppControlTarget | 'Social';
  dailyMinutes: number;
  enabled: boolean;
};

export type StoryBlockRule = {
  id: string;
  appName: Extract<AppControlTarget, 'Instagram' | 'Facebook' | 'Snapchat' | 'Messenger'>;
  enabled: boolean;
};

export type ScheduleRule = {
  id: string;
  startHour: number;
  endHour: number;
  days: number[];
  enabled: boolean;
};

export type AppControlSettings = {
  appName: AppControlTarget;
  packageName: string;
  icon: string;
  blocked: boolean;
  todayUsageMinutes: number;
  features: Partial<Record<AppFeatureKey, boolean>>;
  timeLimitMinutes?: number;
  scheduleRule?: ScheduleRule;
  requiresPermission: boolean;
};

export type SafeBrowsingSettings = {
  adultContentBlock: boolean;
  harmfulSitesBlock: boolean;
  safeSearch: boolean;
  gamblingBlock: boolean;
  customDomains: string[];
  status: 'demo' | 'requires-permission' | 'enabled';
};

export type RoutineStep = {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
};

export type Routine = {
  id: string;
  name: string;
  activeDays: number[];
  enabled: boolean;
  streakDays: number;
  steps: RoutineStep[];
};

export type PlannerTask = {
  id: string;
  title: string;
  category: PlannerCategory;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  completed: boolean;
  focusPresetMinutes?: number;
  icon: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  period: GoalPeriod;
  metric: GoalMetric;
  target: number;
  current: number;
  rewardBadgeId?: string;
};

export type Badge = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  requirement: number;
};

export type Streak = {
  current: number;
  best: number;
  lastCompletedDate?: string;
};

export type SuggestionCard = {
  id: string;
  title: string;
  body: string;
  tone: SuggestionTone;
  actionLabel: string;
  actionTarget: 'Focus' | 'Planner' | 'Control' | 'Goals';
};

export type InsightSummary = {
  focusMinutesToday: number;
  studyMinutesToday: number;
  socialMinutesToday: number;
  bestStudyWindow: TimeWindow;
  peakUsageHour: number;
  focusVsDistractionRatio: number;
  strongestDayLabel: string;
};

export type PrivacyPreferences = {
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  permissionsSetupCompleted?: boolean;
  exportIncludesHistory: boolean;
};

export type AppSettings = {
  themeMode: ThemeMode;
  strictModeEnabled: boolean;
  localRemindersEnabled: boolean;
  purifyLanguage: AppLanguage;
};

export type PurifyState = {
  active: boolean;
  startedAt: string | null;
  lastCheckInAt: string | null;
  currentStreakDays: number;
  bestStreakDays: number;
  lifetimeDays: number;
  reachedMilestones: PurifyMilestoneKey[];
  lastResetAt: string | null;
};

export type LocalExportPayload = {
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
};
