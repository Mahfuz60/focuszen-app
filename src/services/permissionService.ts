import { NativeModules } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

const { AppBlockerModule } = NativeModules;

export const requestUsageStatsPermission = () =>
  IntentLauncher.startActivityAsync(
    'android.settings.USAGE_ACCESS_SETTINGS'
  );

export const checkUsageStatsGranted = async (): Promise<boolean> => {
  try {
    return await AppBlockerModule?.hasUsageStatsPermission() ?? false;
  } catch (error) {
    console.error('Error checking usage stats permission:', error);
    return false;
  }
};
