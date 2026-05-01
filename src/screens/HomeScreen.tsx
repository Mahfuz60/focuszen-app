import React, { useMemo } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFocusStore } from '../stores/useFocusStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useStudyStore } from '../stores/useStudyStore';
import { useUsageStore } from '../stores/useUsageStore';

import { spacing } from '../theme/tokens';
import {
  createHomeStyles as createStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
  qaCardStyle,
  qaArrowBtnStyle,
  qaArrowIconColor,
  perfCardStyle,
  brandZenStyle,
  brandTextStyle,
  greetingNameStyle,
  greetingTextStyle,
  upNextArrowStyle,
  extraStyles,
} from '../styles/HomeScreen.styles';
import { formatMinutes } from '../utils/date';
import { buildHomeDashboard } from '../utils/homeDashboard';

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
  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
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
    ? `Live • Starts: ${dashboard.activeSessionTask?.startTime ?? featuredFocusTask?.startTime ?? '--:--'}`
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

  const localQuickActions = [
    { key: 'breathe', label: 'Breathe', sub: 'Guided breathing', icon: 'wind' as const, target: 'Breathe', color: '#38bdf8' },
    { key: 'alarm', label: 'Power Nap', sub: 'Energy timer', icon: 'moon' as const, target: 'Alarm', color: '#fbbf24' },
    { key: 'bodycare', label: 'Body Care', sub: 'Water & eye care', icon: 'heart' as const, target: 'BodyCare', color: '#10b981' },
    { key: 'plan', label: 'Planner', sub: 'Daily tasks', icon: 'clipboard' as const, target: 'DailyPlanner', color: '#a855f7' },
  ] as const;

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
            <Text style={[styles.brandText, brandTextStyle(mode, palette)]}>
              Focus<Text style={brandZenStyle(mode, palette)}>Zen</Text>
            </Text>
            <View>
              <Pressable
                onPress={() => navigation.navigate('Insights')}
                style={styles.headerIconButton}
              >
                <Ionicons name="notifications-outline" size={20} color={palette.text} />
              </Pressable>
              <View style={styles.notificationDot} />
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={[styles.greetingText, greetingTextStyle(mode)]}>
                {mode === 'dark' ? `${dashboard.greeting.toUpperCase()}, ` : `${dashboard.greeting}, `}
                <Text style={greetingNameStyle(mode, palette)}>
                  {mode === 'dark' ? displayName.toUpperCase() : displayName}
                </Text>
                {mode === 'light' ? ' 👋' : ''}
              </Text>
              <Text style={styles.heroLine}>Own your day</Text>
              <Text style={[styles.heroLine, styles.heroLineAccent]}>before</Text>
              <Text style={styles.heroLine}>distractions do.</Text>
              <Text style={styles.heroSupport}>
                {`${supportDate} is shaped by your focus, your plan, and the attention you protect.`}
              </Text>
            </View>

            <View style={styles.streakWrap}>
              <View style={styles.streakRing}>
                <Svg width={140} height={140} style={{ position: 'absolute', transform: [{ scaleX: -1 }] }}>
                  <Circle
                    cx={70}
                    cy={70}
                    r={60}
                    stroke={palette.greenSoft}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={[272.2, 377]}
                    transform="rotate(140 70 70)"
                  />
                  <Circle
                    cx={70}
                    cy={70}
                    r={60}
                    stroke={palette.green}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={[272.2, 377]}
                    strokeDashoffset={272.2 * 0.25}
                    transform="rotate(140 70 70)"
                  />
                  <Circle cx={70} cy={10} r={6} fill={palette.green} transform={`rotate(${230 + 260 * 0.75} 70 70)`} />
                </Svg>
                <View style={styles.streakCore}>
                  <Text style={styles.streakValue}>{dashboard.summary.streakDays}</Text>
                  <Text style={styles.streakLabel}>DAY STREAK</Text>
                  <View style={extraStyles.streakBadge}>
                    <Text style={[extraStyles.streakBadgeText, { color: palette.green }]}>Keep it going!</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Pressable onPress={handlePrimaryAction} style={styles.focusCard}>
            <View style={[extraStyles.focusCardContent, { paddingRight: spacing.sm }]}>
              <View style={styles.focusHeader}>
                <View style={styles.focusEyebrowRow}>
                  <Ionicons name="flash" size={14} color={palette.green} />
                  <Text style={styles.focusEyebrow}>TODAY'S FOCUS</Text>
                </View>
              </View>

              <Text style={styles.focusTitle}>{focusCardTitle}</Text>

              <View style={styles.focusFooter}>
                <View style={styles.focusTimerRow}>
                  <Ionicons name="timer-outline" size={18} color={palette.green} />
                  <Text style={styles.focusTimer}>{focusCardTime}</Text>
                </View>
                <View style={styles.focusFooterRight}>
                  <Text style={styles.focusMeta}>Start with your next block</Text>
                </View>
              </View>
            </View>

            <View style={styles.playGlowOuter}>
              <View style={styles.playGlowInner}>
                <Ionicons
                  name={activeSession ? 'pause' : 'play'}
                  size={32}
                  color={palette.white}
                  style={activeSession ? styles.playIconActive : styles.playIcon}
                />
              </View>
            </View>
          </Pressable>


          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.qaGrid}>
            {localQuickActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => navigation.navigate(action.target)}
                style={[styles.qaCard, qaCardStyle(mode, action.color)]}
              >
                <View style={styles.qaInner}>
                  <View style={styles.qaTopRow}>
                    <View style={[styles.qaIconWrap, { backgroundColor: `${action.color}25` }]}>
                      <Feather name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <View style={[styles.qaArrowBtn, qaArrowBtnStyle(mode)]}>
                      <Feather name="arrow-right" size={16} color={qaArrowIconColor(mode)} />
                    </View>
                  </View>

                  <View style={styles.qaLabelWrap}>
                    <Text style={styles.qaLabel}>{action.label}</Text>
                    <Text style={styles.qaSub}>{action.sub}</Text>
                  </View>
                </View>

                <View style={styles.qaBarRow}>
                  {[0.25, 0.55, 0.35, 0.7, 0.45, 0.85, 0.6].map((h, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qaBarItem,
                        {
                          height: `${h * 100}%` as any,
                          backgroundColor: i === 6 ? action.color : `${action.color}55`,
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={[styles.qaBottomBar, { backgroundColor: action.color }]} />
              </Pressable>
            ))}
          </View>

          {/* ── Daily Performance ── */}
          <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionTitle}>Daily Performance</Text>
          </View>

          <View style={styles.perfGrid}>
            {[
              { key: 'focus',  label: 'Focus',  value: formatMinutes(dashboard.summary.focusMinutes), sub: 'Focus time today',  icon: 'target' as const,         color: '#22d3ee' },
              { key: 'study',  label: 'Study',  value: formatMinutes(dashboard.summary.studyMinutes), sub: 'Study time today',  icon: 'book-open' as const,      color: '#a78bfa' },
              { key: 'social', label: 'Social', value: formatMinutes(dashboard.summary.socialMinutes),sub: 'Social app time',   icon: 'message-circle' as const, color: '#fb7185' },
              { key: 'tasks',  label: 'Tasks',  value: String(openTasksCount),                        sub: 'Open tasks left',   icon: 'check-circle' as const,   color: '#fbbf24' },
            ].map((metric) => (
              <View
                key={metric.key}
                style={[styles.perfCard, perfCardStyle(mode, metric.color)]}
              >
                <View style={styles.perfInner}>
                  <View style={styles.perfTopRow}>
                    <View style={[styles.perfIconWrap, { backgroundColor: `${metric.color}25` }]}>
                      <Feather name={metric.icon as any} size={20} color={metric.color} />
                    </View>
                    <Text style={styles.perfLabel}>{metric.label}</Text>
                  </View>
                  <Text style={styles.perfValue}>{metric.value}</Text>
                  <Text style={styles.perfSub}>{metric.sub}</Text>
                </View>

                <Svg width="100%" height={44} viewBox="0 0 160 44" preserveAspectRatio="none">
                  <Defs>
                    <SvgLinearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={metric.color} stopOpacity={0.3} />
                      <Stop offset="1" stopColor={metric.color} stopOpacity={0.02} />
                    </SvgLinearGradient>
                  </Defs>
                  <Path
                    d="M0,30 L10,26 L22,32 L34,20 L46,28 L58,16 L70,24 L82,18 L94,28 L106,14 L118,22 L130,18 L142,26 L160,20 L160,44 L0,44 Z"
                    fill={`url(#grad-${metric.key})`}
                  />
                  <Path
                    d="M0,30 L10,26 L22,32 L34,20 L46,28 L58,16 L70,24 L82,18 L94,28 L106,14 L118,22 L130,18 L142,26 L160,20"
                    stroke={metric.color}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>

                <View style={[styles.perfBottomBar, { backgroundColor: metric.color }]} />
              </View>
            ))}
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
              <Ionicons name="trending-up-outline" size={18} color={palette.green} />
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

            {nextTask ? (
              <Text style={styles.upNextTime}>{nextTask.startTime}</Text>
            ) : (
              <View style={[styles.upNextArrowWrap, upNextArrowStyle(mode, styles)]}>
                <Ionicons name="chevron-forward" size={18} color={mode === 'dark' ? palette.text : palette.green} />
              </View>
            )}
          </Pressable>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
