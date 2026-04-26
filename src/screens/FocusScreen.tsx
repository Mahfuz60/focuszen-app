import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { ProgressRing } from '../components/ProgressRing';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFocusStore } from '../stores/useFocusStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { spacing, typography } from '../theme/tokens';
import { isSameDay } from '../utils/date';

const darkPalette = {
  backgroundTop: '#0f111a',
  backgroundBottom: '#181124',
  screenGlow: 'rgba(0, 255, 170, 0.25)',
  screenGlowSoft: 'rgba(255, 51, 153, 0.2)',
  screenGlowAccent: 'rgba(51, 153, 255, 0.25)',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  surfaceButton: 'rgba(255, 255, 255, 0.12)',
  stroke: 'rgba(255, 255, 255, 0.15)',
  text: '#ffffff',
  textMuted: '#b0b8c4',
  textSoft: '#8f9bb3',
  green: '#00ff9d',
  greenGlow: 'rgba(0, 255, 157, 0.25)',
  greenDeep: '#00cc7e',
  greenSoft: 'rgba(0, 255, 157, 0.2)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.5)',
  ringTrack: 'rgba(0, 255, 157, 0.15)',
  ringDisc: 'rgba(20, 20, 30, 0.6)',
  ringGlowSolid: '#00ff9d',
  ringDiscBorder: 'rgba(255, 255, 255, 0.15)',
  ringDiscShadow: '#000000',
  ringDiscShadowOpacity: 0.8,
};

const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  screenGlow: 'rgba(0, 200, 83, 0.15)',
  screenGlowSoft: 'rgba(170, 0, 255, 0.12)',
  screenGlowAccent: 'rgba(41, 98, 255, 0.15)',
  surface: 'rgba(255, 255, 255, 0.8)',
  surfaceSoft: 'rgba(255, 255, 255, 0.6)',
  surfaceButton: 'rgba(255, 255, 255, 0.9)',
  stroke: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  green: '#00c853',
  greenGlow: 'rgba(0, 200, 83, 0.2)',
  greenDeep: '#00a344',
  greenSoft: 'rgba(0, 200, 83, 0.15)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.06)',
  ringTrack: 'rgba(16, 185, 129, 0.2)',
  ringDisc: 'rgba(255, 255, 255, 0.8)',
  ringGlowSolid: '#00c853',
  ringDiscBorder: 'rgba(255, 255, 255, 1)',
  ringDiscShadow: 'rgba(0, 0, 0, 0.1)',
  ringDiscShadowOpacity: 0.12,
};

type ScreenPalette = typeof darkPalette & {
  screenGlow: string;
  screenGlowSoft: string;
  screenGlowAccent: string;
};

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function FocusScreen() {
  const { mode, text } = useAppTheme();
  const defaultFocusMinutes = 30;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const activeSession = useFocusStore((state) => state.activeSession);
  const sessions = useFocusStore((state) => state.sessions);
  const selectedPreset = useFocusStore((state) => state.selectedPreset);
  const deepWorkEnabled = useFocusStore((state) => state.deepWorkEnabled);
  const setDeepWorkEnabled = useFocusStore((state) => state.setDeepWorkEnabled);
  const startSession = useFocusStore((state) => state.startSession);
  const pauseSession = useFocusStore((state) => state.pauseSession);
  const resumeSession = useFocusStore((state) => state.resumeSession);
  const tick = useFocusStore((state) => state.tick);
  const completeSession = useFocusStore((state) => state.completeSession);
  const cancelSession = useFocusStore((state) => state.cancelSession);
  const setSessionTotalMinutes = useFocusStore((state) => state.setSessionTotalMinutes);
  const incrementGoalMetric = useGoalsStore((state) => state.incrementGoalMetric);
  const registerCompletion = useGoalsStore((state) => state.registerCompletion);
  const refreshBadges = useGoalsStore((state) => state.refreshBadges);
  const markTaskInProgressFromFocus = usePlannerStore((state) => state.markTaskInProgressFromFocus);
  const tasks = usePlannerStore((state) => state.tasks);
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(String(selectedPreset));
  const palette = useMemo<ScreenPalette>(
    () =>
      mode === 'dark'
        ? {
            ...darkPalette,
          }
        : {
            ...lightPalette,
          },
    [mode]
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    if (!isFocused || !activeSession || activeSession.paused) {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, isFocused, tick]);

  useEffect(() => {
    if (!activeSession || activeSession.paused || activeSession.remainingSeconds > 0) {
      return;
    }

    handleCompleteSession();
  }, [activeSession]);

  const todaySessions = useMemo(
    () => sessions.filter((session) => session.endedAt && isSameDay(session.endedAt, selectedDate)),
    [selectedDate, sessions]
  );
  const todayFocusMinutes = todaySessions.reduce(
    (total, session) => total + session.completedMinutes,
    0
  );
  const recommendedTask = tasks.find(
    (task) => isSameDay(task.scheduledDate, selectedDate) && !task.completed && task.focusPresetMinutes
  ) ?? null;
  const idleFocusMinutes = activeSession ? null : selectedPreset || defaultFocusMinutes;
  const targetMinutes =
    activeSession?.presetMinutes ?? idleFocusMinutes ?? recommendedTask?.focusPresetMinutes ?? defaultFocusMinutes;
  const ringCountdown = activeSession
    ? formatCountdown(activeSession.remainingSeconds)
    : `${String(idleFocusMinutes ?? defaultFocusMinutes).padStart(2, '0')}:00`;
  const ringState = activeSession
    ? activeSession.paused
      ? 'Paused'
      : 'Session in progress'
    : 'Ready to start';
  const ringProgress = activeSession
    ? Math.min(
        activeSession.remainingSeconds / (activeSession.presetMinutes * 60),
        1
      )
    : 1;
  const goalProgress = targetMinutes ? Math.min(todayFocusMinutes / targetMinutes, 1) : 0;
  const minimumEditableMinutes = Math.max(
    15,
    activeSession ? Math.ceil(activeSession.elapsedSeconds / 60) : 15
  );
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    setDraftMinutes(String(activeSession?.presetMinutes ?? selectedPreset));
  }, [activeSession?.presetMinutes, selectedPreset]);

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }

  function handleCompleteSession() {
    const completed = completeSession();

    if (!completed) {
      cancelSession();
      return;
    }

    incrementGoalMetric('focus-sessions', 1);
    registerCompletion();
    refreshBadges();

    if (completed.linkedTaskId) {
      markTaskInProgressFromFocus(completed.linkedTaskId);
    }

    Alert.alert('Focus complete', 'Session saved and your linked task was updated.');
  }

  function handleMainAction() {
    if (!activeSession) {
      startSession(idleFocusMinutes ?? defaultFocusMinutes, recommendedTask?.id);
      return;
    }

    if (activeSession.paused) {
      resumeSession();
      return;
    }

    pauseSession();
  }

  function handleStopSession() {
    if (!activeSession) {
      return;
    }

    cancelSession();
  }

  function handleOpenTimeEditor() {
    setDraftMinutes(String(activeSession?.presetMinutes ?? selectedPreset));
    setShowTimeEditor((current) => !current);
  }

  function handleShiftDraftMinutes(delta: number) {
    const currentValue = Number.parseInt(draftMinutes, 10) || minimumEditableMinutes;
    setDraftMinutes(String(Math.max(minimumEditableMinutes, currentValue + delta)));
  }

  function handleApplyTimeEdit() {
    const parsedMinutes = Number.parseInt(draftMinutes, 10);

    if (!Number.isFinite(parsedMinutes)) {
      setDraftMinutes(String(activeSession?.presetMinutes ?? selectedPreset));
      return;
    }

    const nextMinutes = Math.max(minimumEditableMinutes, parsedMinutes);
    setSessionTotalMinutes(nextMinutes);
    setDraftMinutes(String(nextMinutes));
    setShowTimeEditor(false);
  }

  function handleModeSelect(nextDeepWorkEnabled: boolean) {
    setDeepWorkEnabled(nextDeepWorkEnabled);
    setShowModeMenu(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={palette.backgroundTop} />
      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={palette.screenGlowAccent}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <Text style={styles.topTitle}>Focus</Text>

            <Pressable
              onPress={() => navigation.navigate('QuickStart')}
              style={styles.topIconButton}
            >
              <Ionicons name="settings-outline" size={18} color={palette.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setShowModeMenu((current) => !current)}
            style={styles.modeChip}
          >
            <Text style={styles.modeChipText}>{deepWorkEnabled ? 'Deep focus' : 'Focus'}</Text>
            <Ionicons
              name={showModeMenu ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={palette.textMuted}
            />
          </Pressable>

          {showModeMenu ? (
            <View style={styles.modeMenu}>
              <Pressable
                onPress={() => handleModeSelect(true)}
                style={[
                  styles.modeOption,
                  deepWorkEnabled ? styles.modeOptionActive : null,
                ]}
              >
                <Text style={styles.modeOptionTitle}>Deep focus</Text>
                <Text style={styles.modeOptionMeta}>Block harder. Stay locked in.</Text>
              </Pressable>

              <Pressable
                onPress={() => handleModeSelect(false)}
                style={[
                  styles.modeOption,
                  !deepWorkEnabled ? styles.modeOptionActive : null,
                ]}
              >
                <Text style={styles.modeOptionTitle}>Focus mode</Text>
                <Text style={styles.modeOptionMeta}>Lighter session. Same clean timer.</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.subtitle}>Block distractions. Dive deep.</Text>

          <View style={styles.ringSection}>
            <Svg
              pointerEvents="none"
              width={340}
              height={340}
              style={styles.ringAtmosphere}
            >
              <Defs>
                <RadialGradient id="focusRingGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={palette.ringGlowSolid} stopOpacity={mode === 'dark' ? 0.3 : 0.15} />
                  <Stop offset="50%" stopColor={palette.ringGlowSolid} stopOpacity={mode === 'dark' ? 0.15 : 0.08} />
                  <Stop offset="76%" stopColor={palette.ringGlowSolid} stopOpacity={mode === 'dark' ? 0.05 : 0.02} />
                  <Stop offset="100%" stopColor={palette.ringGlowSolid} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="170" cy="170" r="160" fill="url(#focusRingGlow)" />
            </Svg>

            <View style={styles.ringShell}>
              <ProgressRing
                size={292}
                strokeWidth={10}
                progress={ringProgress}
                valueLabel=" "
                caption=" "
                trackColor={palette.ringTrack}
                progressGradientColors={[palette.green, mode === 'dark' ? '#38bdf8' : '#3b82f6']}
                valueColor={palette.text}
                captionColor={palette.textMuted}
              />
            </View>

            <View pointerEvents="none" style={styles.ringCenterDisc} />

            <View pointerEvents="none" style={styles.ringOverlay}>
              <Text style={styles.timerValue}>{ringCountdown}</Text>
              <Text style={styles.timerState}>{ringState}</Text>
            </View>

            <Pressable onPress={handleMainAction} style={styles.centerAction}>
              <Ionicons
                name={
                  !activeSession
                    ? 'play'
                    : activeSession.paused
                      ? 'play'
                      : 'pause'
                }
                size={26}
                color={palette.white}
                style={{ marginLeft: !activeSession || activeSession.paused ? 3 : 0 }}
              />
            </Pressable>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons name="home-outline" size={18} color="#7aa2ff" />
              <Text style={styles.goalLabel}>Today's focus goal</Text>
            </View>

            <Text style={styles.goalValue}>{`${todayFocusMinutes} / ${targetMinutes} min`}</Text>

            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${goalProgress * 100}%` as `${number}%` }]} />
            </View>
          </View>

          {showTimeEditor ? (
            <View style={styles.editCard}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Focus Duration</Text>
                <Text style={styles.editMeta}>{`Min ${minimumEditableMinutes} min`}</Text>
              </View>

              <View style={styles.presetRow}>
                {[15, 30, 45, 60].map((preset) => {
                  const isActive = draftMinutes === String(preset);
                  return (
                    <Pressable
                      key={preset}
                      style={[styles.presetChip, isActive && styles.presetChipActive]}
                      onPress={() => setDraftMinutes(String(preset))}
                    >
                      <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>
                        {preset}m
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.editRow}>
                <Pressable
                  onPress={() => handleShiftDraftMinutes(-5)}
                  style={styles.editStepButton}
                >
                  <Ionicons name="remove" size={24} color={palette.text} />
                </Pressable>

                <View style={styles.editInputShell}>
                  <TextInput
                    value={draftMinutes}
                    onChangeText={(value) => setDraftMinutes(value.replace(/[^\d]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.editInput}
                    selectionColor={palette.green}
                  />
                  <Text style={styles.editUnit}>min</Text>
                </View>

                <Pressable
                  onPress={() => handleShiftDraftMinutes(5)}
                  style={styles.editStepButton}
                >
                  <Ionicons name="add" size={24} color={palette.text} />
                </Pressable>
              </View>

              <View style={styles.editActions}>
                <Pressable onPress={() => setShowTimeEditor(false)} style={styles.editGhostButton}>
                  <Text style={styles.editGhostText}>Cancel</Text>
                </Pressable>

                <Pressable onPress={handleApplyTimeEdit} style={styles.editApplyButton}>
                  <Text style={styles.editApplyText}>Save Settings</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.bottomActions}>
            <Pressable onPress={handleStopSession} style={styles.actionButton}>
              <Ionicons name="stop" size={18} color={palette.text} />
              <Text style={styles.actionLabel}>Stop session</Text>
            </Pressable>

            <Pressable onPress={handleOpenTimeEditor} style={styles.actionButton}>
              <Ionicons name="create-outline" size={18} color={palette.text} />
              <View style={styles.actionCopy}>
                <Text style={styles.actionLabel}>Edit time</Text>
                <Text style={styles.actionHint}>
                  {activeSession ? 'Increase or reduce' : 'Set your preset'}
                </Text>
              </View>
            </Pressable>
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
    backgroundColor: palette.backgroundTop,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
    fontWeight: '700',
    color: palette.text,
  },
  modeChip: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  modeMenu: {
    marginTop: spacing.sm,
    borderRadius: 20,
    padding: spacing.sm,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  modeOption: {
    borderRadius: 16,
    padding: spacing.md,
  },
  modeOptionActive: {
    backgroundColor: palette.surfaceSoft,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.2,
  },
  modeOptionMeta: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    color: palette.textMuted,
  },
  modeChipText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    marginTop: spacing.lg,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: palette.textMuted,
    maxWidth: 240,
    alignSelf: 'center',
  },
  ringSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  ringAtmosphere: {
    position: 'absolute',
  },
  ringShell: {
    borderRadius: 146,
    backgroundColor: 'transparent',
    shadowColor: '#7be18a',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  ringCenterDisc: {
    position: 'absolute',
    width: 248,
    height: 248,
    borderRadius: 124,
    borderWidth: 1,
    borderColor: palette.ringDiscBorder,
    backgroundColor: palette.ringDisc,
    shadowColor: palette.ringDiscShadow,
    shadowOpacity: palette.ringDiscShadowOpacity,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ringOverlay: {
    position: 'absolute',
    top: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '900',
    letterSpacing: -2,
    color: palette.green,
  },
  timerState: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: palette.textMuted,
  },
  centerAction: {
    position: 'absolute',
    bottom: 46,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: palette.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  goalCard: {
    marginTop: spacing.lg,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textMuted,
  },
  goalValue: {
    marginTop: spacing.sm,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -1,
    color: palette.text,
  },
  goalTrack: {
    marginTop: spacing.md,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: palette.ringTrack,
  },
  goalFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.green,
  },
  editCard: {
    marginTop: spacing.md,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.2,
  },
  editMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textMuted,
  },
  presetRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  presetChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  presetChipActive: {
    backgroundColor: palette.greenSoft,
    borderColor: palette.green,
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textMuted,
  },
  presetChipTextActive: {
    color: palette.greenDeep,
    fontWeight: '800',
  },
  editRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editStepButton: {
    minWidth: 68,
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceButton,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  editInputShell: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  editInput: {
    minWidth: 48,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    color: palette.text,
  },
  editUnit: {
    marginLeft: spacing.xs,
    fontSize: 15,
    fontWeight: '600',
    color: palette.textMuted,
  },
  editActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editGhostButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  editGhostText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textMuted,
  },
  editApplyButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenDeep,
  },
  editApplyText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.white,
  },
  bottomActions: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: palette.surfaceButton,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  actionCopy: {
    alignItems: 'flex-start',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  actionHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
  },
  });
}
