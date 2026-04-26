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

const darkPalette = {
  backgroundTop: '#121c29',
  backgroundBottom: '#172334',
  screenGlow: 'rgba(120, 220, 140, 0.1)',
  screenGlowSoft: 'rgba(136, 168, 255, 0.08)',
  surface: 'rgba(31, 43, 61, 0.96)',
  surfaceSoft: 'rgba(37, 49, 68, 0.96)',
  surfaceMuted: 'rgba(45, 58, 78, 0.92)',
  stroke: 'rgba(201, 214, 233, 0.08)',
  text: '#f3f7fe',
  textMuted: '#bcc8d9',
  textSoft: '#9aa9bd',
  white: '#ffffff',
  green: '#78dc8c',
  greenDeep: '#355f3f',
  greenSoft: 'rgba(120, 220, 140, 0.16)',
  blue: '#8db0ff',
  blueSoft: 'rgba(141, 176, 255, 0.16)',
  red: '#ff8e88',
  redSoft: 'rgba(255, 142, 136, 0.14)',
  shadow: 'rgba(3, 9, 18, 0.34)',
};

const lightPalette = {
  backgroundTop: '#eef5f0',
  backgroundBottom: '#f8fbf8',
  screenGlow: 'rgba(31, 165, 91, 0.05)',
  screenGlowSoft: 'rgba(46, 111, 242, 0.04)',
  surface: 'rgba(255, 255, 255, 0.98)',
  surfaceSoft: 'rgba(250, 252, 250, 0.98)',
  surfaceMuted: 'rgba(241, 246, 242, 0.98)',
  stroke: 'rgba(19, 32, 24, 0.08)',
  text: '#132018',
  textMuted: '#425149',
  textSoft: '#64736c',
  white: '#ffffff',
  green: '#1fa55b',
  greenDeep: '#1f7a46',
  greenSoft: 'rgba(31, 165, 91, 0.1)',
  blue: '#2e6ff2',
  blueSoft: 'rgba(46, 111, 242, 0.08)',
  red: '#d9534f',
  redSoft: 'rgba(217, 83, 79, 0.08)',
  shadow: 'rgba(19, 32, 24, 0.14)',
};

type ScreenPalette = typeof darkPalette;

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

function createStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    backgroundColor: palette.backgroundTop,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  badge: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
    borderWidth: 1,
    borderColor: 'rgba(120, 220, 140, 0.1)',
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.green,
  },
  helperText: {
    marginTop: spacing.lg,
    maxWidth: 240,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
  metricsRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  metricCardGreen: {
    backgroundColor: palette.greenSoft,
  },
  metricCardBlue: {
    backgroundColor: palette.blueSoft,
  },
  metricCardRed: {
    backgroundColor: palette.redSoft,
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: palette.text,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textMuted,
  },
  card: {
    marginTop: spacing.lg,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardEyebrow: {
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: palette.textSoft,
  },
  cardTitle: {
    marginTop: spacing.xs,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: palette.text,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
  },
  cardSubtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
  actionsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 74,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  actionButtonPrimary: {
    backgroundColor: palette.greenDeep,
    borderColor: 'rgba(120, 220, 140, 0.24)',
    shadowColor: palette.green,
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(88, 41, 45, 0.6)',
    borderColor: 'rgba(255, 142, 136, 0.22)',
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  actionIconWrapPrimary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  actionIconWrapDanger: {
    backgroundColor: 'rgba(255, 142, 136, 0.14)',
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  actionTitlePrimary: {
    color: palette.white,
  },
  actionTitleDanger: {
    color: palette.red,
  },
  actionSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    color: palette.textMuted,
  },
  });
}
