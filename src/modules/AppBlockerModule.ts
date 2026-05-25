import { NativeModules } from 'react-native';

const { AppBlockerModule } = NativeModules;

export const syncRulesToNative = (rules: object) => {
  AppBlockerModule?.setBlockingRules(JSON.stringify(rules));
};

export const hasUsageStatsPermission = (): Promise<boolean> => {
  return AppBlockerModule?.hasUsageStatsPermission() ?? Promise.resolve(false);
};
