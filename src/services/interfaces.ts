import {
  AppControlSettings,
  SafeBrowsingSettings,
  ScheduleRule,
  TimeLimitRule,
  UsageComparison,
  UsageEntry,
} from '../types/models';

export interface AppUsageService {
  getTodayUsageByApp(): Promise<UsageEntry[]>;
  getWeeklyUsage(): Promise<UsageEntry[]>;
  getPeakUsageTime(): Promise<number>;
  getMostUsedApps(): Promise<UsageEntry[]>;
  getUsageComparisonSnapshot(): Promise<UsageComparison>;
}

export interface AppBlockingService {
  setAppBlocked(packageName: string, blocked: boolean): Promise<void>;
  setFeatureBlocked(appName: string, feature: string, enabled: boolean): Promise<void>;
  setTimeLimit(appName: string, minutes: number): Promise<TimeLimitRule>;
  setScheduleRule(appName: string, rule: ScheduleRule): Promise<void>;
  enableStrictMode(enabled: boolean): Promise<void>;
  getControls(): Promise<AppControlSettings[]>;
}

export interface SafeBrowsingService {
  toggleAdultContentBlock(enabled: boolean): Promise<void>;
  toggleHarmfulSitesBlock(enabled: boolean): Promise<void>;
  toggleSafeSearch(enabled: boolean): Promise<void>;
  toggleGamblingBlock(enabled: boolean): Promise<void>;
  manageCustomDomains(domains: string[]): Promise<void>;
  getSettings(): Promise<SafeBrowsingSettings>;
}

export interface SuggestionEngineService {
  getDailySuggestions(): Promise<string[]>;
}

export interface NotificationService {
  scheduleFocusReminder(minutesFromNow: number): Promise<void>;
  scheduleRoutineReminder(routineName: string, hour: number): Promise<void>;
  schedulePurifyMilestoneNotification(title: string, body: string): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface ComparisonService {
  getComparisonSnapshot(): Promise<UsageComparison>;
}
