import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native';
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
  }, []);

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
