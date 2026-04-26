// import * as Notifications from 'expo-notifications';
// import { seedComparison, seedControlSettings, seedSuggestions, seedUsageEntries } from '../data/seed';
// import { AppBlockingService, AppUsageService, ComparisonService, NotificationService, SafeBrowsingService, SuggestionEngineService } from './interfaces';
// import { SafeBrowsingSettings, ScheduleRule } from '../types/models';
// import { getPeakUsageTime, getTodayUsageEntries } from '../utils/usage';

// const safeBrowsingState: SafeBrowsingSettings = {
//   adultContentBlock: true,
//   harmfulSitesBlock: true,
//   safeSearch: true,
//   gamblingBlock: true,
//   customDomains: ['example-blocked.com'],
//   status: 'requires-permission',
// };

// export const localAppUsageService: AppUsageService = {
//   async getTodayUsageByApp() {
//     return getTodayUsageEntries(seedUsageEntries, new Date().toISOString());
//   },
//   async getWeeklyUsage() {
//     return seedUsageEntries;
//   },
//   async getPeakUsageTime() {
//     return getPeakUsageTime(seedUsageEntries);
//   },
//   async getMostUsedApps() {
//     return [...seedUsageEntries].sort((left, right) => right.minutesUsed - left.minutesUsed).slice(0, 4);
//   },
//   async getUsageComparisonSnapshot() {
//     return seedComparison;
//   },
// };

// export const localAppBlockingService: AppBlockingService = {
//   async setAppBlocked() {},
//   async setFeatureBlocked() {},
//   async setTimeLimit(appName, minutes) {
//     return { id: `rule-${appName}`, appName: appName as never, dailyMinutes: minutes, enabled: true };
//   },
//   async setScheduleRule(_appName: string, _rule: ScheduleRule) {},
//   async enableStrictMode() {},
//   async getControls() {
//     return seedControlSettings;
//   },
// };

// export const localSafeBrowsingService: SafeBrowsingService = {
//   async toggleAdultContentBlock(enabled) {
//     safeBrowsingState.adultContentBlock = enabled;
//   },
//   async toggleHarmfulSitesBlock(enabled) {
//     safeBrowsingState.harmfulSitesBlock = enabled;
//   },
//   async toggleSafeSearch(enabled) {
//     safeBrowsingState.safeSearch = enabled;
//   },
//   async toggleGamblingBlock(enabled) {
//     safeBrowsingState.gamblingBlock = enabled;
//   },
//   async manageCustomDomains(domains) {
//     safeBrowsingState.customDomains = domains;
//   },
//   async getSettings() {
//     return safeBrowsingState;
//   },
// };

// export const localSuggestionEngineService: SuggestionEngineService = {
//   async getDailySuggestions() {
//     return seedSuggestions.map((item) => item.title);
//   },
// };

// export const localNotificationService: NotificationService = {
//   async scheduleFocusReminder(minutesFromNow) {
//     await Notifications.scheduleNotificationAsync({
//       content: { title: 'FocusZen', body: `Focus block starts in ${minutesFromNow} minutes.` },
//       trigger: null,
//     });
//   },
//   async scheduleRoutineReminder(routineName, hour) {
//     await Notifications.scheduleNotificationAsync({
//       content: { title: 'Routine reminder', body: `${routineName} is scheduled for ${hour}:00.` },
//       trigger: null,
//     });
//   },
//   async schedulePurifyMilestoneNotification(title, body) {
//     await Notifications.scheduleNotificationAsync({
//       content: { title, body },
//       trigger: null,
//     });
//   },
//   async cancelAll() {
//     await Notifications.cancelAllScheduledNotificationsAsync();
//   },
// };

// export const localComparisonService: ComparisonService = {
//   async getComparisonSnapshot() {
//     return seedComparison;
//   },
// };



import { seedComparison, seedControlSettings, seedSuggestions, seedUsageEntries } from '../data/seed';
import {
  AppBlockingService,
  AppUsageService,
  ComparisonService,
  NotificationService,
  SafeBrowsingService,
  SuggestionEngineService,
} from './interfaces';
import { SafeBrowsingSettings, ScheduleRule } from '../types/models';
import { getPeakUsageTime, getTodayUsageEntries } from '../utils/usage';

const safeBrowsingState: SafeBrowsingSettings = {
  adultContentBlock: true,
  harmfulSitesBlock: true,
  safeSearch: true,
  gamblingBlock: true,
  customDomains: ['example-blocked.com'],
  status: 'requires-permission',
};

export const localAppUsageService: AppUsageService = {
  async getTodayUsageByApp() {
    return getTodayUsageEntries(seedUsageEntries, new Date().toISOString());
  },
  async getWeeklyUsage() {
    return seedUsageEntries;
  },
  async getPeakUsageTime() {
    return getPeakUsageTime(seedUsageEntries);
  },
  async getMostUsedApps() {
    return [...seedUsageEntries]
      .sort((left, right) => right.minutesUsed - left.minutesUsed)
      .slice(0, 4);
  },
  async getUsageComparisonSnapshot() {
    return seedComparison;
  },
};


export const localAppBlockingService: AppBlockingService = {
  async setAppBlocked() {},
  async setFeatureBlocked() {},
  async setTimeLimit(appName, minutes) {
    return {
      id: `rule-${appName}`,
      appName: appName as never,
      dailyMinutes: minutes,
      enabled: true,
    };
  },
  async setScheduleRule(_appName: string, _rule: ScheduleRule) {},
  async enableStrictMode() {},
  async getControls() {
    return seedControlSettings;
  },
};

export const localSafeBrowsingService: SafeBrowsingService = {
  async toggleAdultContentBlock(enabled) {
    safeBrowsingState.adultContentBlock = enabled;
  },
  async toggleHarmfulSitesBlock(enabled) {
    safeBrowsingState.harmfulSitesBlock = enabled;
  },
  async toggleSafeSearch(enabled) {
    safeBrowsingState.safeSearch = enabled;
  },
  async toggleGamblingBlock(enabled) {
    safeBrowsingState.gamblingBlock = enabled;
  },
  async manageCustomDomains(domains) {
    safeBrowsingState.customDomains = domains;
  },
  async getSettings() {
    return safeBrowsingState;
  },
};

export const localSuggestionEngineService: SuggestionEngineService = {
  async getDailySuggestions() {
    return seedSuggestions.map((item) => item.title);
  },
};

export const localNotificationService: NotificationService = {
  async scheduleFocusReminder(minutesFromNow) {
    console.log('Focus reminder skipped in offline mode:', minutesFromNow);
  },
  async scheduleRoutineReminder(routineName, hour) {
    console.log('Routine reminder skipped in offline mode:', routineName, hour);
  },
  async schedulePurifyMilestoneNotification(title, body) {
    console.log('Purify milestone reminder skipped in offline mode:', title, body);
  },
  async cancelAll() {
    console.log('Cancel reminders skipped in offline mode');
  },
};

export const localComparisonService: ComparisonService = {
  async getComparisonSnapshot() {
    return seedComparison;
  },
};