import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeModules, Text, TextInput, Vibration } from 'react-native';
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
import { useFocusStore } from '../stores/useFocusStore';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { palettes } from '../theme/tokens';

const { FocusZenSettings } = NativeModules;



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
  const deepWorkEnabled = useFocusStore((s) => s.deepWorkEnabled);
  const activeFocusSession = useFocusStore((s) => s.activeSession);

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

  // Sync all settings once on startup (after store rehydrates from AsyncStorage)
  useEffect(() => {
    ensureAppMeta();
    // Small delay ensures Zustand has rehydrated persisted state before syncing to native
    const timer = setTimeout(() => {
      syncAllSettings();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync focus session state whenever it changes
  useEffect(() => {
    if (FocusZenSettings) {
      FocusZenSettings.setFocusSession(
        activeFocusSession ? !activeFocusSession.paused : false,
        deepWorkEnabled
      );
    }
  }, [activeFocusSession, deepWorkEnabled]);

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

  const palette = palettes[mode];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AnimatedThemeBackdrop
        colors={[palette.background, palette.background]}
        mode={mode}
        primaryGlow={mode === 'dark' ? 'rgba(0, 255, 157, 0.12)' : 'rgba(31, 165, 91, 0.08)'}
        secondaryGlow={mode === 'dark' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(170, 0, 255, 0.06)'}
        accentGlow={mode === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(41, 98, 255, 0.08)'}
      >
        <RootNavigator />
      </AnimatedThemeBackdrop>
    </GestureHandlerRootView>
  );
}
