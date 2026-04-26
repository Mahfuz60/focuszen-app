import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
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
import { useFocusStore } from '../stores/useFocusStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useStudyStore } from '../stores/useStudyStore';
import { useUsageStore } from '../stores/useUsageStore';
import { spacing, typography } from '../theme/tokens';
import { formatMinutes } from '../utils/date';
import { buildHomeDashboard } from '../utils/homeDashboard';

const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  screenGlow: 'rgba(0, 230, 118, 0.18)',
  screenGlowSoft: 'rgba(213, 0, 249, 0.15)',
  screenGlowAccent: 'rgba(0, 176, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceSoft: 'rgba(255, 255, 255, 0.04)',
  surfaceMuted: 'rgba(255, 255, 255, 0.02)',
  stroke: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textMuted: '#b0b8c4',
  textSoft: '#8f9bb3',
  green: '#00e676',
  greenSoft: 'rgba(0, 230, 118, 0.2)',
  purple: '#d500f9',
  purpleSoft: 'rgba(213, 0, 249, 0.2)',
  blue: '#00b0ff',
  blueSoft: 'rgba(0, 176, 255, 0.2)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.6)',
  streakShell: 'rgba(255, 255, 255, 0.08)',
  streakBorder: 'rgba(0, 230, 118, 0.5)',
  streakCoreBorder: 'rgba(255, 255, 255, 0.15)',
};

const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  screenGlow: 'rgba(0, 200, 83, 0.15)',
  screenGlowSoft: 'rgba(170, 0, 255, 0.12)',
  screenGlowAccent: 'rgba(41, 98, 255, 0.15)',
  surface: 'rgba(255, 255, 255, 0.8)',
  surfaceSoft: 'rgba(255, 255, 255, 0.6)',
  surfaceMuted: 'rgba(255, 255, 255, 0.4)',
  stroke: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  green: '#00c853',
  greenSoft: 'rgba(0, 200, 83, 0.15)',
  purple: '#aa00ff',
  purpleSoft: 'rgba(170, 0, 255, 0.12)',
  blue: '#2962ff',
  blueSoft: 'rgba(41, 98, 255, 0.12)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.06)',
  streakShell: 'rgba(255, 255, 255, 0.9)',
  streakBorder: 'rgba(0, 200, 83, 0.4)',
  streakCoreBorder: 'rgba(0, 200, 83, 0.2)',
};

type ScreenPalette = typeof darkPalette;

const quickActions = [
  {
    key: 'focus',
    label: 'Focus',
    icon: 'timer',
    target: 'Focus',
    baseColorLight: '#10b981',
    bgDark: '#00e676',
    iconDark: '#ffffff',
  },
  {
    key: 'planner',
    label: 'Planner',
    icon: 'calendar',
    target: 'DailyPlanner',
    baseColorLight: '#a855f7',
    bgDark: '#d500f9',
    iconDark: '#ffffff',
  },
  {
    key: 'control',
    label: 'App Control',
    icon: 'options',
    target: 'Control',
    baseColorLight: '#3b82f6',
    bgDark: '#2979ff',
    iconDark: '#ffffff',
  },
  {
    key: 'insights',
    label: 'Insights',
    icon: 'bar-chart',
    target: 'Insights',
    baseColorLight: '#f43f5e',
    bgDark: '#ff1744',
    iconDark: '#ffffff',
  },
] as const;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatFocusSlot(minutes: number) {
  return `${minutes.toString().padStart(2, '0')}:00`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] ?? 'there';
}

export function HomeScreen() {
  const { mode, text } = useAppTheme();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const profile = useProfileStore((state) => state.profile);
  const focusSessions = useFocusStore((state) => state.sessions);
  const activeSession = useFocusStore((state) => state.activeSession);
  const selectedPreset = useFocusStore((state) => state.selectedPreset);
  const startSession = useFocusStore((state) => state.startSession);
  const studySessions = useStudyStore((state) => state.sessions);
  const usageEntries = useUsageStore((state) => state.entries);
  const suggestions = useGoalsStore((state) => state.suggestions);
  const streak = useGoalsStore((state) => state.streak);
  const tasks = usePlannerStore((state) => state.tasks);
  const selectedDate = usePlannerStore((state) => state.selectedDate);
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

  const dashboard = useMemo(
    () =>
      buildHomeDashboard({
        selectedDate,
        nowIso: new Date().toISOString(),
        focusSessions,
        studySessions,
        usageEntries,
        tasks,
        activeSession,
        streak,
        suggestions,
      }),
    [
      activeSession,
      focusSessions,
      selectedDate,
      streak,
      studySessions,
      suggestions,
      tasks,
      usageEntries,
    ]
  );

  const displayName = firstName(profile.displayName);
  const openTasksCount = Math.max(
    dashboard.summary.totalTasks - dashboard.summary.completedTasks,
    0
  );
  const featuredFocusTask = dashboard.featuredFocusTask;
  const nextTask = dashboard.nextTask;
  const focusCardTitle = activeSession
    ? dashboard.activeSessionTask?.title ?? featuredFocusTask?.title ?? 'Deep work session'
    : featuredFocusTask?.title ?? 'Deep work session';
  const focusCardTime = activeSession
    ? formatCountdown(activeSession.remainingSeconds)
    : formatFocusSlot(featuredFocusTask?.focusPresetMinutes ?? selectedPreset);
  const focusCardMeta = activeSession
    ? 'Session live now'
    : featuredFocusTask
      ? 'Ready to begin'
      : 'Start with your next block';
  const supportDate = dashboard.selectedDateLabel === 'Today'
    ? formatShortDate(selectedDate)
    : dashboard.selectedDateLabel;
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  function handlePrimaryAction() {
    if (activeSession) {
      navigation.navigate('Focus');
      return;
    }

    if (featuredFocusTask?.focusPresetMinutes) {
      startSession(featuredFocusTask.focusPresetMinutes, featuredFocusTask.id);
      navigation.navigate('Focus');
      return;
    }

    navigation.navigate('Focus');
  }

  function navigateQuickAction(target: (typeof quickActions)[number]['target']) {
    if (target === 'DailyPlanner') {
      navigation.navigate('DailyPlanner');
      return;
    }

    navigation.navigate(target);
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
          <View style={styles.headerRow}>
            <Text style={styles.brandText}>FocusZen</Text>
            <Pressable
              onPress={() => navigation.navigate('Insights')}
              style={styles.headerIconButton}
            >
              <Ionicons name="notifications-outline" size={20} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.greetingText}>{`${dashboard.greeting}, ${displayName}`}</Text>
              <Text style={styles.heroLine}>Own your day</Text>
              <Text style={[styles.heroLine, styles.heroLineAccent]}>before</Text>
              <Text style={styles.heroLine}>distractions</Text>
              <Text style={styles.heroLine}>do.</Text>
              <Text style={styles.heroSupport}>
                {`${supportDate} is shaped by your focus, your plan, and the attention you protect.`}
              </Text>
            </View>

            <View style={styles.streakWrap}>
              <View style={styles.streakRing}>
                <View style={styles.streakArc} />
                <View style={styles.streakCore}>
                  <Text style={styles.streakValue}>{dashboard.summary.streakDays}</Text>
                  <Text style={styles.streakLabel}>day streak</Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable onPress={handlePrimaryAction} style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <View style={styles.focusEyebrowRow}>
                <Ionicons name="flash" size={16} color={palette.green} />
                <Text style={styles.focusEyebrow}>Today's focus</Text>
              </View>
              <View style={styles.playGlow}>
                <Ionicons
                  name={activeSession ? 'pause' : 'play'}
                  size={20}
                  color={palette.white}
                  style={{ marginLeft: activeSession ? 0 : 3 }}
                />
              </View>
            </View>

            <Text style={styles.focusTitle}>{focusCardTitle}</Text>

            <View style={styles.focusFooter}>
              <View style={styles.focusTimerRow}>
                <Ionicons name="timer-outline" size={18} color={palette.green} />
                <Text style={styles.focusTimer}>{focusCardTime}</Text>
              </View>
              <Text style={styles.focusMeta}>{focusCardMeta}</Text>
            </View>
          </Pressable>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="leaf-outline" size={16} color={palette.green} />
                <Text style={styles.metricLabel}>Focus</Text>
              </View>
              <Text style={styles.metricValue}>{formatMinutes(dashboard.summary.focusMinutes)}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="school-outline" size={16} color={palette.purple} />
                <Text style={styles.metricLabel}>Study</Text>
              </View>
              <Text style={styles.metricValue}>{formatMinutes(dashboard.summary.studyMinutes)}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="heart-outline" size={16} color={palette.blue} />
                <Text style={styles.metricLabel}>Social</Text>
              </View>
              <Text style={styles.metricValue}>{formatMinutes(dashboard.summary.socialMinutes)}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="folder-open-outline" size={16} color={palette.textMuted} />
                <Text style={styles.metricLabel}>Open tasks</Text>
              </View>
              <Text style={styles.metricValue}>{String(openTasksCount)}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
          </View>

          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => {
              const bgColor = mode === 'dark' ? action.bgDark : action.baseColorLight;
              return (
                <Pressable
                  key={action.key}
                  onPress={() => navigateQuickAction(action.target)}
                  style={styles.quickActionItem}
                >
                  <View
                    style={[
                      styles.quickActionIconWrap,
                      {
                        backgroundColor: bgColor,
                        shadowColor: bgColor,
                      },
                    ]}
                  >
                    <Ionicons name={action.icon} size={28} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Up next</Text>
            <Pressable onPress={() => navigation.navigate('DailyPlanner')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.navigate('DailyPlanner')}
            style={styles.upNextCard}
          >
            <View style={styles.upNextIconWrap}>
              <Ionicons name="trending-up-outline" size={18} color={palette.purple} />
            </View>

            <View style={styles.upNextCopy}>
              <Text style={styles.upNextTitle}>
                {nextTask?.title ?? 'No tasks planned for this day yet.'}
              </Text>
              <Text style={styles.upNextMeta}>
                {nextTask
                  ? `${nextTask.category} | ${nextTask.durationMinutes} min`
                  : 'Open Planner to add a task'}
              </Text>
            </View>

            <Text style={styles.upNextTime}>{nextTask?.startTime ?? '--:--'}</Text>
          </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.green,
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  heroRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  heroLine: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.5,
  },
  heroLineAccent: {
    color: palette.green,
  },
  heroSupport: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: palette.textSoft,
    maxWidth: '90%',
  },
  streakWrap: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: palette.streakBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.streakShell,
    shadowColor: palette.green,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  streakArc: {
    position: 'absolute',
    top: 5,
    right: 10,
    width: 32,
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.purple,
    shadowColor: palette.purple,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  streakCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.streakCoreBorder,
    backgroundColor: palette.surface,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -1,
  },
  streakLabel: {
    marginTop: -2,
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  focusCard: {
    marginTop: spacing.xl,
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  focusEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
    shadowColor: palette.green,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  focusTitle: {
    marginTop: spacing.md,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.5,
  },
  focusFooter: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  focusTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  focusTimer: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.2,
  },
  focusMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textSoft,
  },
  metricsGrid: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textMuted,
  },
  metricValue: {
    marginTop: spacing.sm,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -1,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.blue,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  quickActionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.text,
  },
  upNextCard: {
    marginBottom: spacing.sm,
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  upNextIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.purpleSoft,
  },
  upNextCopy: {
    flex: 1,
  },
  upNextTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: palette.text,
    letterSpacing: -0.2,
  },
  upNextMeta: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: palette.textMuted,
  },
  upNextTime: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  });
}
