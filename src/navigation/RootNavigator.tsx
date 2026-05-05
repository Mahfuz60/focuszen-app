import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { DailyPlannerScreen } from '../screens/DailyPlannerScreen';
import { NameSetupScreen } from '../screens/NameSetupScreen';
import { PermissionsSetupScreen } from '../screens/PermissionsSetupScreen';
import { BreatheScreen } from '../screens/BreatheScreen';
import { AlarmScreen } from '../screens/AlarmScreen';
import { BodyCareScreen } from '../screens/BodyCareScreen';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import { useProfileStore } from '../stores/useProfileStore';
import { useSettingsStore } from '../stores/useSettingsStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { mode, colors } = useAppTheme();
  const profileName = useProfileStore((state) => state.profile.displayName);
  const privacy = useSettingsStore((state) => state.privacy);
  const needsNameSetup = !privacy.onboardingCompleted || !profileName.trim() || profileName === 'FocusZen User';
  const needsPermissionsSetup = !privacy.permissionsSetupCompleted;

  let initialRouteName: keyof RootStackParamList = 'MainTabs';
  if (needsNameSetup) {
    initialRouteName = 'NameSetup';
  } else if (needsPermissionsSetup) {
    initialRouteName = 'PermissionsSetup';
  }

  const navigationTheme =
    mode === 'dark'
      ? {
          ...DarkTheme,
          colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.textPrimary, border: colors.border, primary: colors.focus },
        }
      : {
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.textPrimary, border: colors.border, primary: colors.focus },
        };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="NameSetup" component={NameSetupScreen} />
        <Stack.Screen name="PermissionsSetup" component={PermissionsSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="DailyPlanner" component={DailyPlannerScreen} />
        <Stack.Screen name="Breathe" component={BreatheScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Alarm" component={AlarmScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="BodyCare" component={BodyCareScreen} options={{ animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
