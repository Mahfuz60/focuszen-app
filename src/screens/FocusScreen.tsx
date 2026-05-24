import React, { useEffect, useMemo, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StatusBar,
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
import { spacing } from '../theme/tokens';
import {
  createFocusStyles as createStyles,
} from '../styles/FocusScreen.styles';
import { isSameDay } from '../utils/date';



function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

import { FocusCompleteModal } from '../components/FocusCompleteModal';

export function FocusScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('focus'), [getPalette]);
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const defaultFocusMinutes = 30;
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = 0;
  }
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(String(selectedPreset));

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

  const linkedTask = useMemo(
    () => tasks.find((task) => task.id === activeSession?.linkedTaskId) ?? null,
    [activeSession?.linkedTaskId, tasks]
  );
  const idleFocusMinutes = activeSession ? null : selectedPreset || defaultFocusMinutes;
  const targetMinutes =
    activeSession?.presetMinutes ?? idleFocusMinutes ?? recommendedTask?.focusPresetMinutes ?? defaultFocusMinutes;
  const ringCountdown = activeSession
    ? formatCountdown(activeSession.remainingSeconds)
    : `${String(idleFocusMinutes ?? defaultFocusMinutes).padStart(2, '0')}:00`;
  const ringState = activeSession
    ? activeSession.paused
    ? 'Paused'
    : linkedTask
    ? `Focusing (Starts: ${linkedTask.startTime})`
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

    setShowCompleteModal(true);
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
          <View style={styles.focusHeaderContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <Pressable 
                onPress={handleBack}
                style={styles.backButton}
              >
                <Feather name="arrow-left" size={22} color={palette.text} />
              </Pressable>
              <Text style={styles.subtitle}>
                Block distractions. <Text style={styles.subtitleAccent}>Dive deep.</Text>
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Insights')} style={styles.backButton}>
              <Ionicons name="stats-chart" size={20} color={palette.text} />
            </Pressable>
          </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', zIndex: 100 }}>
              <Pressable
                onPress={() => setShowModeMenu((current) => !current)}
                style={styles.modeChip}
              >
                <Text style={styles.modeChipText}>{deepWorkEnabled ? 'Deep focus' : 'Focus'}</Text>
                <Ionicons
                  name={showModeMenu ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={palette.text}
                />
              </Pressable>

              {showModeMenu && (
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
              )}
            </View>

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
                progressGradientColors={[palette.green || '#10b981', mode === 'dark' ? '#38bdf8' : '#3b82f6']}
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

          <View style={[styles.goalCard, {
            borderColor: mode === 'dark' ? '#3b82f640' : '#3b82f620',
            shadowColor: '#3b82f6',
            shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
            borderWidth: 1,
          }]}>
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
            <View style={[styles.editCard, {
              borderColor: mode === 'dark' ? `${palette.green}40` : `${palette.green}20`,
              shadowColor: palette.green,
              shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
              backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
              borderWidth: 1,
            }]}>
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
            <Pressable onPress={handleStopSession} style={[styles.actionButton, {
              borderColor: mode === 'dark' ? '#ef444430' : '#ef444415',
              shadowColor: '#ef4444',
              shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
              backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
            }]}>
              <Ionicons name="stop" size={18} color={palette.text} />
              <Text style={styles.actionLabel}>Stop session</Text>
            </Pressable>
 
            <Pressable onPress={handleOpenTimeEditor} style={[styles.actionButton, {
              borderColor: mode === 'dark' ? `${palette.green}40` : `${palette.green}20`,
              shadowColor: palette.green,
              shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
              backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
            }]}>
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
        <FocusCompleteModal
          visible={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
        />
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}


