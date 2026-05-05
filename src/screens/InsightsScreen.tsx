import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
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
import { useControlStore } from '../stores/useControlStore';
import { useFocusStore } from '../stores/useFocusStore';
import { usePurifyStore } from '../stores/usePurifyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useStudyStore } from '../stores/useStudyStore';
import { useUsageStore } from '../stores/useUsageStore';
import { spacing } from '../theme/tokens';
import {
  createInsightsStyles as createStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/InsightsScreen.styles';
import { AppControlTarget } from '../types/models';
import { buildControlInsightsOverview } from '../utils/controlInsightsOverview';
import { getLatestInsightsAnchorDate } from '../utils/insightsAnalytics';
import { buildPurifyFocusOverview } from '../utils/purifyFocusOverview';
import { buildPurifyInsights } from '../utils/purifyInsights';
import { buildPurifyStatus } from '../utils/purifyProgress';



type InsightTab = 'overview' | 'focus' | 'control' | 'purify';
type UsageFilter = 'all' | 'blocked' | 'used';

function parseMinutes(value: string) {
  return Number.parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const daysFromSaturday = (start.getDay() + 1) % 7;
  start.setDate(start.getDate() - daysFromSaturday);
  return start;
}

function endOfWeek(date: Date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return end;
}

function formatDelta(change: number) {
  const rounded = Math.round(change);
  if (rounded === 0) {
    return '0% vs last week';
  }

  return `${rounded > 0 ? '+' : ''}${rounded}% vs last week`;
}

function formatHourWindow(hour: number | null) {
  if (hour === null) {
    return 'No sessions yet';
  }

  const formatHour = (value: number) => {
    const normalized = ((value % 24) + 24) % 24;
    const suffix = normalized >= 12 ? 'PM' : 'AM';
    const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
    return `${hour12} ${suffix}`;
  };

  return `${formatHour(hour)} - ${formatHour(hour + 2)}`;
}

export function InsightsScreen() {
  const { mode, text } = useAppTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState<InsightTab>('overview');
  const [insightRange, setInsightRange] = useState<'week' | 'month' | 'year'>('week');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all');
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  const palette = useMemo(
    () =>
      mode === 'dark'
        ? ({ ...darkPalette } as ScreenPalette)
        : ({ ...lightPalette } as ScreenPalette),
    [mode, darkPalette, lightPalette]
  );
  const styles = useMemo(() => createStyles(palette), [palette]);
  const controls = useControlStore((state) => state.controls);
  const strictModeEnabled = useControlStore((state) => state.strictModeEnabled);
  const focusSessions = useFocusStore((state) => state.sessions);
  const purify = usePurifyStore((state) => state.purify);
  const refreshPurify = usePurifyStore((state) => state.refreshPurify);
  const purifyLanguage = useSettingsStore((state) => state.settings.purifyLanguage ?? 'en');
  const studySessions = useStudyStore((state) => state.sessions);
  const usageEntries = useUsageStore((state) => state.entries);
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const now = new Date().toISOString();
    setNowIso(now);
    void refreshPurify(now, purifyLanguage);
  }, [isFocused, purifyLanguage, refreshPurify]);

  useEffect(() => {
    if (!isFocused || !purify.active) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().toISOString();
      setNowIso(now);
      void refreshPurify(now, purifyLanguage);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocused, purify.active, purifyLanguage, refreshPurify]);

  const anchorDate = useMemo(
    () =>
      getLatestInsightsAnchorDate({
        focusSessions,
        studySessions,
        usageEntries,
      }),
    [focusSessions, studySessions, usageEntries]
  );

  const focusOverview = useMemo(
    () =>
      buildPurifyFocusOverview({
        language: 'en',
        range: insightRange,
        anchorDate,
        focusSessions,
        studySessions,
        usageEntries,
      }),
    [anchorDate, focusSessions, studySessions, usageEntries, insightRange]
  );

  const controlOverview = useMemo(
    () =>
      buildControlInsightsOverview({
        language: 'en',
        anchorDate,
        controls,
        usageEntries,
        strictModeEnabled,
      }),
    [anchorDate, controls, strictModeEnabled, usageEntries]
  );

  const purifyStatus = useMemo(
    () =>
      buildPurifyStatus({
        state: purify,
        nowIso,
        language: 'en',
      }),
    [nowIso, purify]
  );

  const purifyInsights = useMemo(
    () =>
      buildPurifyInsights({
        currentDays: purifyStatus.currentStreakDays,
        bestDays: purifyStatus.bestStreakDays,
        lifetimeDays: purify.lifetimeDays + purifyStatus.currentStreakDays,
        reachedMilestones: [...new Set([...purify.reachedMilestones, ...purifyStatus.reachedNow])],
        language: 'en',
      }),
    [purify, purifyStatus]
  );

  const weekStart = useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const weekEnd = useMemo(() => endOfWeek(anchorDate), [anchorDate]);

  const currentWeekFocusMinutes = useMemo(
    () => focusOverview.chartItems.reduce((total, item) => total + item.value, 0),
    [focusOverview.chartItems]
  );

  const previousWeekFocusMinutes = useMemo(() => {
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setMilliseconds(previousWeekEnd.getMilliseconds() - 1);

    return focusSessions
      .filter((session) => session.endedAt)
      .filter((session) => {
        const endedAt = new Date(session.endedAt as string);
        return endedAt >= previousWeekStart && endedAt <= previousWeekEnd;
      })
      .reduce((total, session) => total + session.completedMinutes, 0);
  }, [focusSessions, weekStart]);

  const weeklyDelta = useMemo(() => {
    if (previousWeekFocusMinutes <= 0) {
      return currentWeekFocusMinutes > 0 ? 100 : 0;
    }

    return ((currentWeekFocusMinutes - previousWeekFocusMinutes) / previousWeekFocusMinutes) * 100;
  }, [currentWeekFocusMinutes, previousWeekFocusMinutes]);

  const topTimeRange = useMemo(() => {
    const hourTotals = new Map<number, number>();

    [...focusSessions, ...studySessions].forEach((session) => {
      const startedAt = new Date(session.startedAt);
      if (startedAt < weekStart || startedAt > weekEnd) {
        return;
      }

      const duration =
        'completedMinutes' in session ? session.completedMinutes : session.durationMinutes;
      hourTotals.set(startedAt.getHours(), (hourTotals.get(startedAt.getHours()) ?? 0) + duration);
    });

    let bestHour: number | null = null;
    let bestMinutes = -1;

    hourTotals.forEach((minutes, hour) => {
      if (minutes > bestMinutes) {
        bestMinutes = minutes;
        bestHour = hour;
      }
    });

    return formatHourWindow(bestHour);
  }, [focusSessions, studySessions, weekEnd, weekStart]);

  const appUsageRows = useMemo(() => {
    const totals = new Map<AppControlTarget, number>();

    usageEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate < weekStart || entryDate > weekEnd) {
        return;
      }

      totals.set(entry.appName, (totals.get(entry.appName) ?? 0) + entry.minutesUsed);
    });

    return [...totals.entries()]
      .map(([appName, minutesUsed]) => {
        const control = controls.find((item) => item.appName === appName);
        const protectedState = Boolean(
          control?.blocked ||
            control?.timeLimitMinutes ||
            Object.values(control?.features ?? {}).some(Boolean)
        );

        return {
          appName,
          minutesUsed,
          blocked: Boolean(control?.blocked),
          protectedState,
        };
      })
      .filter((item) => {
        if (usageFilter === 'blocked') {
          return item.blocked;
        }

        if (usageFilter === 'used') {
          return item.minutesUsed > 0;
        }

        return true;
      })
      .sort((left, right) => right.minutesUsed - left.minutesUsed);
  }, [controls, usageEntries, usageFilter, weekEnd, weekStart]);

  const focusMinutesLabel = `${parseMinutes(focusOverview.metrics.focus.value)}m`;
  const controlUsageLabel = controlOverview.metrics.usage.value;

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }

  function renderFocusOverviewCard() {
    const dataPoints = focusOverview.chartItems || [];
    const highestValue = Math.max(...dataPoints.map((item) => item.value), 60);
    
    // SVG Line Chart Logic
    const width = 300; // Adjusted for Y-axis
    const height = 120;
    const padding = 10;
    const chartHeight = height - padding * 2;
    const stepX = (width - padding * 2) / (dataPoints.length - 1);
    
    const points = dataPoints.map((item, i) => ({
      x: padding + i * stepX,
      y: height - padding - (Math.min(item.value, highestValue) / highestValue) * chartHeight,
    }));
 
    const linePath = points.reduce((path, p, i) => 
      i === 0 ? `M${p.x},${p.y}` : `${path} L${p.x},${p.y}`, '');
    
    const fillPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;
 
    return (
      <View style={[styles.sectionCard, {
        borderColor: mode === 'dark' ? `${palette.green}40` : `${palette.green}15`,
        shadowColor: palette.green,
        shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
        borderWidth: 1.5,
      }]}>
        <View style={styles.sectionHeader}>
          <View>
             <Text style={styles.heroMinutes}>{focusMinutesLabel}</Text>
             <Text style={styles.heroMeta}>Total focus</Text>
          </View>
          <View style={{ alignItems: 'flex-end', paddingTop: 8 }}>
             <Text style={styles.heroDelta}>↑ {formatDelta(weeklyDelta)}</Text>
          </View>
        </View>
 
        <View style={styles.chartContainer}>
          <View style={styles.chartYAxis}>
            <Text style={styles.chartYLabel}>60m</Text>
            <Text style={styles.chartYLabel}>45m</Text>
            <Text style={styles.chartYLabel}>30m</Text>
            <Text style={styles.chartYLabel}>15m</Text>
            <Text style={styles.chartYLabel}>0m</Text>
          </View>
 
          <View style={styles.chartArea}>
            <View style={styles.chartGrid}>
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
            </View>
            
            <Svg width="100%" height={height}>
              <Defs>
                <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={palette.green} stopOpacity={0.25} />
                  <Stop offset="1" stopColor={palette.green} stopOpacity={0} />
                </SvgLinearGradient>
              </Defs>
              <Path d={fillPath} fill="url(#chartFill)" />
              <Path d={linePath} stroke={palette.green} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={4.5} fill={palette.green} stroke={palette.surface} strokeWidth={2.5} />
              ))}
            </Svg>
 
            <View style={styles.chartXLabels}>
              {dataPoints.map((item) => (
                <Text key={item.label} style={styles.chartXLabel}>{item.label}</Text>
              ))}
            </View>
          </View>
        </View>
 
        <View style={styles.periodToggle}>
          {['7D', '4W', '12M'].map((p) => (
            <Pressable 
              key={p} 
              style={[styles.periodBtn, insightRange === (p === '7D' ? 'week' : p === '4W' ? 'month' : 'year') ? styles.periodBtnActive : null]}
              onPress={() => setInsightRange(p === '7D' ? 'week' : p === '4W' ? 'month' : 'year')}
            >
              <Text style={[styles.periodText, insightRange === (p === '7D' ? 'week' : p === '4W' ? 'month' : 'year') ? styles.periodTextActive : null]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }
 
  function renderSummaryPairs() {
    return (
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, {
          borderColor: mode === 'dark' ? `${palette.green}30` : `${palette.green}12`,
          shadowColor: palette.green,
          shadowOpacity: mode === 'dark' ? 0.2 : 0.08,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
          backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
          borderWidth: 1,
        }]}>
          <View style={styles.summaryHeader}>
             <View style={styles.summaryIconWrap}>
                <Ionicons name="leaf-outline" size={16} color={palette.green} />
             </View>
             <Text style={styles.summaryLabel}>Best Day</Text>
          </View>
          <Text style={styles.summaryValue}>{focusOverview.bestDay.value || 'None'}</Text>
          <Text style={styles.summarySub}>No focus sessions</Text>
        </View>
 
        <View style={[styles.summaryCard, {
          borderColor: mode === 'dark' ? `${palette.purple}30` : `${palette.purple}12`,
          shadowColor: palette.purple,
          shadowOpacity: mode === 'dark' ? 0.2 : 0.08,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
          backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
          borderWidth: 1,
        }]}>
          <View style={styles.summaryHeader}>
             <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(217,70,239,0.05)' }]}>
                <Ionicons name="sparkles" size={16} color={palette.purple} />
             </View>
             <Text style={styles.summaryLabel}>Top Time</Text>
          </View>
          <Text style={styles.summaryValue}>{topTimeRange || 'None'}</Text>
          <Text style={styles.summarySub}>No data yet</Text>
        </View>
      </View>
    );
  }
 
  function renderControlSnapshot() {
    return (
      <View style={[styles.sectionCard, {
        borderColor: mode === 'dark' ? `${palette.purple}40` : `${palette.purple}15`,
        shadowColor: palette.purple,
        shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
        borderWidth: 1.5,
        marginTop: 20,
      }]}>
        <View style={styles.purifyHeader}>
          <Text style={styles.sectionTitle}>Control snapshot</Text>
          <Text style={[styles.sectionTitle, { color: palette.green }]}>0%</Text>
        </View>
 
        <View style={styles.tripletGrid}>
          {[
            { label: 'Protected', value: controlOverview.metrics.protected.value, icon: 'shield-outline', color: palette.blue },
            { label: 'Blocked', value: controlOverview.metrics.blocked.value, icon: 'lock-closed-outline', color: palette.green },
            { label: 'Usage', value: controlUsageLabel, icon: 'time-outline', color: palette.purple },
          ].map((item, i) => (
            <View key={i} style={[styles.tripletCard, {
              borderColor: mode === 'dark' ? `${item.color}30` : `${item.color}10`,
              shadowColor: item.color,
              shadowOpacity: mode === 'dark' ? 0.2 : 0.05,
              shadowRadius: 10,
              elevation: 4,
              borderWidth: 1,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            }]}>
              <View style={[styles.tripletIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.tripletValue}>{item.value}</Text>
              <Text style={styles.tripletLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24, backgroundColor: 'transparent', padding: 0 }}>
           <Text style={styles.summaryLabel}>Top App</Text>
           <Text style={[styles.summaryValue, { marginTop: 4 }]}>{controlOverview.facts.topApp.value || 'None'}</Text>
           <Text style={styles.summarySub}>No app usage recorded</Text>
        </View>
      </View>
    );
  }

  function renderPurifyOverhaul() {
    return (
      <View style={[styles.sectionCard, {
        borderColor: mode === 'dark' ? `${palette.purple}40` : `${palette.purple}15`,
        shadowColor: palette.purple,
        shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
        borderWidth: 1.5,
        marginTop: 20,
      }]}>
        <View style={styles.purifyHeader}>
          <Text style={styles.sectionTitle}>Purify progress</Text>
          <View style={styles.purifyBadge}>
            <Text style={styles.purifyBadgeText}>{purifyInsights.activeStage.title}</Text>
          </View>
        </View>
 
        <View style={styles.tripletGrid}>
          {[
            { label: 'Current Streak', value: purifyInsights.summary.current.value, icon: 'flash-outline', color: palette.purple },
            { label: 'Best Streak', value: purifyInsights.summary.best.value, icon: 'star-outline', color: palette.green },
            { label: 'Lifetime Days', value: purifyInsights.summary.lifetime.value, icon: 'calendar-outline', color: palette.blue },
          ].map((item, i) => (
            <View key={i} style={[styles.tripletCard, {
              borderColor: mode === 'dark' ? `${item.color}30` : `${item.color}10`,
              shadowColor: item.color,
              shadowOpacity: mode === 'dark' ? 0.2 : 0.05,
              shadowRadius: 10,
              elevation: 4,
              borderWidth: 1,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            }]}>
              <View style={[styles.tripletIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.tripletValue}>{item.value}</Text>
              <Text style={styles.tripletLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.timelineWrap}>
           <Text style={styles.summaryLabel}>Live Streak</Text>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={styles.summaryValue}>{purifyStatus.currentStreakLabel || '0 day streak'}</Text>
              <Ionicons name="rocket-outline" size={24} color={palette.purple} />
           </View>

           <View style={[styles.timelineRow, { marginTop: 20 }]}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.timelineDot, i === 0 ? styles.timelineDotActive : null]} />
              ))}
           </View>
           <View style={styles.timelineMeta}>
              <Text style={styles.timelineText}>Elapsed {purifyStatus.elapsedLabel}</Text>
              <Text style={styles.timelineText}>Next: {purifyInsights.nextStage?.title || 'None'}</Text>
           </View>
        </View>
      </View>
    );
  }

  function renderTabContent() {
    if (activeTab === 'focus') {
      return (
        <>
          {renderFocusOverviewCard()}
          {renderSummaryPairs()}
        </>
      );
    }

    if (activeTab === 'control') {
      return (
        <>
          {renderControlSnapshot()}
        </>
      );
    }

    if (activeTab === 'purify') {
      return (
        <>
          {renderPurifyOverhaul()}
        </>
      );
    }

    // Overview Tab
    return (
      <>
        {renderFocusOverviewCard()}
        {renderSummaryPairs()}
        {renderControlSnapshot()}
        {renderPurifyOverhaul()}
      </>
    );
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
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <Text style={styles.topTitle}>Insights</Text>

            <Pressable style={styles.topIconButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {(
              [
                ['overview', 'Overview'],
                ['focus', 'Focus'],
                ['control', 'Control'],
                ['purify', 'Purify'],
              ] as const
            ).map(([tab, label]) => {
              const active = activeTab === (tab as InsightTab);

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab as InsightTab)}
                  style={[styles.tabChip, active ? styles.tabChipActive : null]}
                >
                  <Text style={[styles.tabChipText, active ? styles.tabChipTextActive : null]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {renderTabContent()}
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}

