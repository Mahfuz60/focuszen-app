import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput, Vibration } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Roboto_100Thin,
  Roboto_200ExtraLight,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_800ExtraBold,
  Roboto_900Black,
  useFonts,
} from '@expo-google-fonts/roboto';
import { RootNavigator } from '../navigation/RootNavigator';
import { ensureAppMeta } from '../storage/storage';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAlarmStore } from '../stores/useAlarmStore';
import { useControlStore } from '../stores/useControlStore';
import { NativeModules } from 'react-native';

const { FocusZenSettings } = NativeModules;

// Uncomment after running 'npx expo install expo-av'
// import { Audio } from 'expo-av';

const defaultTextStyle = { fontFamily: 'Roboto_400Regular' as const };
const GlobalText = Text as any;
const GlobalTextInput = TextInput as any;

GlobalText.defaultProps = {
  ...GlobalText.defaultProps,
  style: [defaultTextStyle, GlobalText.defaultProps?.style],
};

GlobalTextInput.defaultProps = {
  ...GlobalTextInput.defaultProps,
  style: [defaultTextStyle, GlobalTextInput.defaultProps?.style],
};

export function AppRoot() {
  const { mode } = useAppTheme();
  const activeSessionId = useAlarmStore((s) => s.activeSessionId);
  const isAlarmFiring = useAlarmStore((s) => s.isAlarmFiring);
  const setAlarmFiring = useAlarmStore((s) => s.setAlarmFiring);
  const sessions = useAlarmStore((s) => s.sessions);
  const syncAllSettings = useControlStore((s) => s.syncAllSettings);

  const activeSession = sessions.find(s => s.id === activeSessionId && !s.completedAt);

  const [fontsLoaded] = useFonts({
    Roboto_100Thin,
    Roboto_200ExtraLight,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_800ExtraBold,
    Roboto_900Black,
  });

  useEffect(() => {
    ensureAppMeta();
    syncAllSettings();
    if (FocusZenSettings) {
      FocusZenSettings.startService();
    }
  }, [syncAllSettings]);

  // Global Alarm Monitor
  useEffect(() => {
    if (!activeSession) return;

    const checkAlarm = () => {
      const start = new Date(activeSession.startedAt).getTime();
      const duration = activeSession.durationMinutes * 60 * 1000;
      const now = Date.now();
      if (now >= start + duration && !isAlarmFiring) {
        setAlarmFiring(true);
      }
    };

    const interval = setInterval(checkAlarm, 1000);
    return () => clearInterval(interval);
  }, [activeSession, isAlarmFiring, setAlarmFiring]);

  // Global Vibration handler
  useEffect(() => {
    if (isAlarmFiring) {
      Vibration.vibrate([0, 500, 200, 500, 200, 1000], true);
    } else {
      Vibration.cancel();
    }
    return () => Vibration.cancel();
  }, [isAlarmFiring]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
