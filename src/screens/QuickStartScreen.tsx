import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useControlStore } from '../stores/useControlStore';
import { useFocusStore } from '../stores/useFocusStore';
import { useStudyStore } from '../stores/useStudyStore';
import { spacing, typography } from '../theme/tokens';
import {
  createQuickStartStyles as createStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/QuickStartScreen.styles';



type QuickActionProps = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
  palette: ScreenPalette;
  styles: ReturnType<typeof createStyles>;
};

function QuickAction({
  label,
  subtitle,
  icon,
  onPress,
  tone = 'secondary',
  palette,
  styles,
}: QuickActionProps) {
  const danger = tone === 'danger';
  const primary = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        primary ? styles.actionButtonPrimary : null,
        danger ? styles.actionButtonDanger : null,
      ]}
    >
      <View
        style={[
          styles.actionIconWrap,
          primary ? styles.actionIconWrapPrimary : null,
          danger ? styles.actionIconWrapDanger : null,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={primary ? palette.white : danger ? palette.red : palette.green}
        />
      </View>

      <View style={styles.actionCopy}>
        <Text
          style={[
            styles.actionTitle,
            primary ? styles.actionTitlePrimary : null,
            danger ? styles.actionTitleDanger : null,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={primary ? 'rgba(255,255,255,0.82)' : palette.textSoft}
      />
    </Pressable>
  );
}

export function QuickStartScreen() {
  const { mode, text } = useAppTheme();
  const navigation = useNavigation<any>();
  const startSession = useFocusStore((state) => state.startSession);
  const activeSession = useFocusStore((state) => state.activeSession);
  const selectedPreset = useFocusStore((state) => state.selectedPreset);
  const addStudySession = useStudyStore((state) => state.addStudySession);
  const strictModeEnabled = useControlStore((state) => state.strictModeEnabled);
  const toggleStrictMode = useControlStore((state) => state.toggleStrictMode);
  const palette = React.useMemo<ScreenPalette>(
    () =>
      mode === 'dark'
        ? {
            ...darkPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          }
        : {
            ...lightPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          },
    [mode, text]
  );
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }

  function handleStartFocus() {
    startSession(selectedPreset);
    navigation.navigate('MainTabs', { screen: 'Focus' });
  }

  function handleStartStudySession() {
    addStudySession({
      id: `study-${Date.now()}`,
      startedAt: new Date().toISOString(),
      endedAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      durationMinutes: 45,
      subject: 'Quick study',
      category: 'Study',
    });
  }

  function handleResumeSession() {
    if (activeSession) {
      navigation.navigate('MainTabs', { screen: 'Focus' });
      return;
    }

    Alert.alert('No session to resume', 'Start a focus session first.');
  }

  function handleOpenControl() {
    navigation.navigate('MainTabs', { screen: 'Control' });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.42)'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <Text style={styles.topTitle}>Quick Start</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Fast lane</Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            One tap into focus, study, blocking, or strict mode.
          </Text>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardGreen]}>
              <Text style={styles.metricValue}>{selectedPreset}</Text>
              <Text style={styles.metricLabel}>Preset</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <Text style={styles.metricValue}>{activeSession ? 'Live' : 'Idle'}</Text>
              <Text style={styles.metricLabel}>Session</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardRed]}>
              <Text style={styles.metricValue}>{strictModeEnabled ? 'On' : 'Off'}</Text>
              <Text style={styles.metricLabel}>Strict</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>Quick actions</Text>
                <Text style={styles.cardTitle}>Fastest route into action</Text>
              </View>

              <View style={styles.cardIconWrap}>
                <Ionicons name="flash" size={18} color={palette.green} />
              </View>
            </View>

            <Text style={styles.cardSubtitle}>
              Reuses your most recent settings and keeps core actions one tap away.
            </Text>

            <View style={styles.actionsList}>
              <QuickAction
                label="Start Focus"
                subtitle={`Launch ${selectedPreset} minute focus session`}
                icon="play"
                tone="primary"
                onPress={handleStartFocus}
                palette={palette}
                styles={styles}
              />
              <QuickAction
                label="Start Study Session"
                subtitle="Create a quick 45 minute study block"
                icon="school-outline"
                onPress={handleStartStudySession}
                palette={palette}
                styles={styles}
              />
              <QuickAction
                label="Resume Last Session"
                subtitle={activeSession ? 'Jump back into your live timer' : 'Open when a session is active'}
                icon="refresh-outline"
                onPress={handleResumeSession}
                palette={palette}
                styles={styles}
              />
              <QuickAction
                label="Block distractions"
                subtitle="Open App Control and block apps fast"
                icon="shield-checkmark-outline"
                onPress={handleOpenControl}
                palette={palette}
                styles={styles}
              />
              <QuickAction
                label={strictModeEnabled ? 'Turn off strict mode' : 'Turn on strict mode'}
                subtitle={strictModeEnabled ? 'Ease the strongest lock set' : 'Enable the strongest lock set'}
                icon="lock-closed-outline"
                tone="danger"
                onPress={toggleStrictMode}
                palette={palette}
                styles={styles}
              />
            </View>
          </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}


