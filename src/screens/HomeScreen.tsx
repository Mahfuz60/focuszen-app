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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
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
  const usageDetails = [
    { key: 'focus', label: 'Focus', value: dashboard.summary.focusMinutes, color: '#7bbce5' },
    { key: 'study', label: 'Study', value: dashboard.summary.studyMinutes, color: '#e59540' },
    { key: 'social', label: 'Social apps', value: dashboard.summary.socialMinutes, color: '#a9cf45' },
  ];
  const usageChartTotal = usageDetails.reduce((total, item) => total + item.value, 0);
  const usageDisplayTotal = Math.max(usageChartTotal, 1);
  const usageChartCircumference = 2 * Math.PI * 48;
  let usageChartOffset = 0;
  const usageChartSegments = usageDetails.map((item) => {
    const percent = item.value / usageDisplayTotal;
    const segment = {
      ...item,
      percent,
      dashOffset: -usageChartOffset,
      dashArray: `${percent * usageChartCircumference} ${usageChartCircumference}`,
    };

    usageChartOffset += percent * usageChartCircumference;
    return segment;
  });
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
    { key: 'breathe', label: 'Breathe', sub: 'Guided breathing', image: require('../../assets/breathe.png'), target: 'Breathe', color: '#38bdf8' },
    { key: 'alarm', label: 'Power Nap', sub: 'Energy timer', image: require('../../assets/powerNap.png'), target: 'Alarm', color: '#fbbf24' },
    { key: 'bodycare', label: 'Wellness', sub: 'Health & Hydration', image: require('../../assets/wellness.png'), target: 'BodyCare', color: '#10b981' },
    { key: 'plan', label: 'Planner', sub: 'Daily tasks', image: require('../../assets/planner.png'), target: 'DailyPlanner', color: '#a855f7' },
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
                      <Image
                        source={action.image}
                        style={{ width: 48, height: 48 }}
                        resizeMode="contain"
                      />
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

          {/* ── In-App Usage Details ── */}
          <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionTitle}>In-App Usage Details</Text>
          </View>

          <View style={styles.usageDetailsCard}>
            <View style={styles.usageHeaderRow}>
              <Text style={styles.usageTitle}>Today</Text>
              <Ionicons name="help-circle-outline" size={22} color={palette.textSoft} />
            </View>

            <View style={styles.usageDetailsBody}>
              <View style={styles.usageLegend}>
                {usageDetails.map((item) => (
                  <View key={item.key} style={styles.usageLegendRow}>
                    <View style={[styles.usageLegendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.usageLegendText}>
                      {`${item.label} · ${formatMinutes(item.value)}`}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.usageChartWrap}>
                <Svg width={190} height={190} viewBox="0 0 124 124">
                  <Circle
                    cx={62}
                    cy={62}
                    r={48}
                    stroke={mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#eef2f7'}
                    strokeWidth={12}
                    fill="none"
                  />
                  {usageChartSegments.map((segment) => (
                    <Circle
                      key={segment.key}
                      cx={62}
                      cy={62}
                      r={48}
                      stroke={segment.color}
                      strokeWidth={12}
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                      fill="none"
                      strokeLinecap="round"
                      transform="rotate(-90 62 62)"
                    />
                  ))}
                </Svg>
                <Text style={styles.usageCenterValue}>
                  {formatMinutes(usageChartTotal)}
                </Text>
                <Text style={styles.usageCenterLabel}>total</Text>
              </View>
            </View>

            <View style={styles.usagePercentRow}>
              {usageChartSegments.slice(0, 3).map((segment) => (
                <Text key={segment.key} style={styles.usagePercentText}>
                  {`${Math.round(segment.percent * 100)}%`}
                </Text>
              ))}
            </View>
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
