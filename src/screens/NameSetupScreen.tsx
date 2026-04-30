import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useProfileStore } from '../stores/useProfileStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { spacing } from '../theme/tokens';
import {
  nameSetupStyles as styles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/NameSetupScreen.styles';

export function NameSetupScreen() {
  const navigation = useNavigation<any>();
  const { colors, mode, text } = useAppTheme();
  const currentName = useProfileStore((state) => state.profile.displayName);
  const setDisplayName = useProfileStore((state) => state.setDisplayName);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const [name, setName] = useState(currentName === 'FocusZen User' ? '' : currentName);

  const palette = useMemo(
    () =>
      mode === 'dark'
        ? darkPalette(colors, text)
        : lightPalette(colors, text),
    [colors, mode, text]
  );

  const trimmedName = name.trim();
  const disabled = trimmedName.length < 2;
  const preview = useMemo(
    () => (trimmedName ? trimmedName : 'You'),
    [trimmedName]
  );

  function handleContinue() {
    if (disabled) {
      return;
    }

    setDisplayName(trimmedName);
    completeOnboarding();
    navigation.replace('PermissionsSetup');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.backgroundTop }]}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.44)'}
      >
        <View style={styles.content}>
          <Text style={[styles.brand, { color: palette.green }]}>FocusZen</Text>
          <Text style={[styles.title, { color: palette.text }]}>What should we call you?</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Your name appears across your focus plan each day.
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: palette.surface,
                borderColor: palette.stroke,
                shadowColor: palette.shadow,
              },
            ]}
          >
            <Text style={[styles.inputLabel, { color: palette.textMuted }]}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceSoft,
                  borderColor: palette.stroke,
                  color: palette.inputText,
                },
              ]}
              autoFocus
              maxLength={32}
              returnKeyType="done"

            />

            <View
              style={[
                styles.previewWrap,
                {
                  backgroundColor: palette.surfaceSoft,
                  borderColor: palette.stroke,
                },
              ]}
            >
              <Text style={[styles.previewLabel, { color: palette.textMuted }]}>Your greeting</Text>
              <Text style={[styles.previewText, { color: palette.text }]}>
                {`Welcome back, ${preview}`}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={disabled}
            style={[
              styles.button,
              {
                backgroundColor: disabled ? palette.buttonDisabled : palette.buttonEnabled,
                shadowColor: palette.shadow,
                borderColor: disabled ? 'transparent' : 'rgba(255,255,255,0.08)',
              },
              disabled ? null : styles.buttonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: disabled ? palette.buttonTextDisabled : palette.buttonText },
              ]}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}


