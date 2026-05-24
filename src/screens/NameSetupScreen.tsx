import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StatusBar,
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
import {
  createNameSetupStyles as createStyles,
} from '../styles/NameSetupScreen.styles';

export function NameSetupScreen() {
  const navigation = useNavigation<any>();
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('nameSetup'), [getPalette]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const currentName = useProfileStore((state) => state.profile.displayName);
  const setDisplayName = useProfileStore((state) => state.setDisplayName);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const [name, setName] = useState(currentName === 'FocusZen User' ? '' : currentName);

  const trimmedName = name.trim();
  const disabled = trimmedName.length < 4 || trimmedName.length > 15;
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.44)'}
      >
        <View style={styles.content}>
          <Text style={styles.brand}>FocusZen</Text>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            Your name appears across your focus plan each day.
          </Text>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              autoFocus
              maxLength={32}
              returnKeyType="done"
            />

            <View style={styles.previewWrap}>
              <Text style={styles.previewLabel}>Your greeting</Text>
              <Text style={styles.previewText}>
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

