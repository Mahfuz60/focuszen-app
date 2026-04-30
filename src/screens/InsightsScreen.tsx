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
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { AppBrandIcon } from '../components/AppBrandIcon';
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
  chartPalettes,
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
    [mode]
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
    const highestValue = Math.max(...(focusOverview.chartItems || []).map((item) => item.value), 1);

    return (
      <LinearGradient colors={mode === 'dark' ? ['rgba(0, 255, 157, 0.15)', 'rgba(0, 255, 157, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(0, 200, 83, 0.15)']} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Focus overview</Text>
          <Pressable
            style={styles.weekChip}
            onPress={() =>
              setInsightRange((prev) => (prev === 'week' ? 'month' : prev === 'month' ? 'year' : 'week'))
            }
          >
            <Text style={styles.weekChipText}>
              {insightRange === 'week' ? 'This week' : insightRange === 'month' ? 'This month' : 'This year'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={palette.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.heroMinutes}>{focusMinutesLabel}</Text>
        <Text style={styles.heroMeta}>Total focus time</Text>
        <Text style={styles.heroDelta}>{formatDelta(weeklyDelta)}</Text>

        <View style={styles.barChartRow}>
          {(focusOverview.chartItems || []).map((item) => {
            const isBest = item.label === focusOverview.bestDay.value && item.value > 0;
            const barHeight = Math.max((item.value / highestValue) * 78, 18);
            
            const barColors = chartPalettes.focus[mode];
            const trackColor = chartPalettes.focus.track[mode];
            const shadowGlow = chartPalettes.focus.glow[mode];

            return (
              <View key={item.label} style={styles.barColumn}>
                <Text style={styles.barTopValue}>{item.value > 0 ? `${item.value}m` : ' '}</Text>
                <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
                  <LinearGradient
                    colors={barColors}
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        shadowColor: isBest ? shadowGlow : 'transparent',
                      },
                      isBest ? styles.barGlow : null,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isBest ? styles.barLabelActive : null]}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
              <Ionicons name="flame-outline" size={14} color={palette.green} />
            </View>
            <Text style={styles.summaryLabel}>Best day</Text>
            <Text style={styles.summaryValue}>{focusOverview.bestDay.value}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, styles.summaryIconWrapPurple]}>
              <Ionicons name="sparkles" size={14} color={palette.purple} />
            </View>
            <Text style={styles.summaryLabel}>Top time</Text>
            <Text style={styles.summaryValue}>{topTimeRange}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  function renderUsageCard() {
    return (
      <LinearGradient colors={mode === 'dark' ? ['rgba(0, 176, 255, 0.15)', 'rgba(0, 176, 255, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(41, 98, 255, 0.12)']} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>App usage</Text>

        <View style={styles.filterRow}>
          {(['all', 'blocked', 'used'] as UsageFilter[]).map((filter) => {
            const active = usageFilter === filter;
            const label =
              filter === 'all' ? 'All' : filter === 'blocked' ? 'Blocked' : 'Used';

            return (
              <Pressable
                key={filter}
                onPress={() => setUsageFilter(filter)}
                style={[styles.filterChip, active ? styles.filterChipActive : null]}
              >
                <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.usageList}>
          {appUsageRows.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={32} color={palette.textSoft} />
              <Text style={styles.emptyStateText}>No usage data recorded yet</Text>
            </View>
          ) : (
            appUsageRows.map((item) => (
            <View key={item.appName} style={styles.usageRow}>
              <View style={styles.usageLeft}>
                <AppBrandIcon appName={item.appName} size={34} />

                <View style={styles.usageCopy}>
                  <Text style={styles.usageTitle}>{item.appName}</Text>
                  <View style={styles.usageMeterTrack}>
                    <LinearGradient
                      colors={item.blocked ? chartPalettes.usage.blocked : chartPalettes.usage.active}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.usageMeterFill,
                        {
                          width: `${Math.max(Math.min((item.minutesUsed / Math.max(appUsageRows[0]?.minutesUsed ?? 1, 1)) * 100, 100), 2)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.usageMinutes}>{item.minutesUsed}m</Text>
            </View>
          )))}
        </View>
      </LinearGradient>
    );
  }

  function renderControlCard() {
    return (
      <LinearGradient colors={mode === 'dark' ? ['rgba(0, 176, 255, 0.15)', 'rgba(0, 176, 255, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(41, 98, 255, 0.12)']} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Control snapshot</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>{controlOverview.facts.strict.value}</Text>
          </View>
        </View>

        <View style={styles.metricTriplet}>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{controlOverview.metrics.protected.value}</Text>
            <Text style={styles.metricTileLabel}>Protected</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{controlOverview.metrics.blocked.value}</Text>
            <Text style={styles.metricTileLabel}>Blocked</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{controlUsageLabel}</Text>
            <Text style={styles.metricTileLabel}>Usage</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Top app</Text>
          <Text style={styles.detailValue}>{controlOverview.facts.topApp.value}</Text>
        </View>
      </LinearGradient>
    );
  }

  function renderPurifyCard() {
    return (
      <LinearGradient colors={chartPalettes.purify[mode]} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Purify progress</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>{purifyInsights.activeStage.title}</Text>
          </View>
        </View>

        <View style={styles.metricTriplet}>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{purifyInsights.summary.current.value}</Text>
            <Text style={styles.metricTileLabel}>{purifyInsights.summary.current.label}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{purifyInsights.summary.best.value}</Text>
            <Text style={styles.metricTileLabel}>{purifyInsights.summary.best.label}</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricTileValue}>{purifyInsights.summary.lifetime.value}</Text>
            <Text style={styles.metricTileLabel}>{purifyInsights.summary.lifetime.label}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Live streak</Text>
          <Text style={styles.detailValue}>{purifyStatus.currentStreakLabel}</Text>
          <Text style={styles.detailMeta}>
            {purifyStatus.active
              ? `Elapsed ${purifyStatus.elapsedLabel}. Next milestone: ${purifyInsights.nextStage?.title ?? 'Completed'}`
              : purifyInsights.motivationLine}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  function renderPurifyMilestonesCard() {
    return (
      <LinearGradient colors={chartPalettes.purify[mode]} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All milestones</Text>
          <View style={styles.inlineBadge}>
            <Text style={styles.inlineBadgeText}>{`${purifyInsights.reachedCount || 0} stages`}</Text>
          </View>
        </View>

        <View style={styles.milestonesList}>
          {(purifyInsights.milestones || []).map((milestone) => {
            const reached = milestone.state === 'reached';
            const next = milestone.state === 'next';

            return (
              <View key={milestone.key} style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneDot,
                    reached ? styles.milestoneDotReached : null,
                    next ? styles.milestoneDotNext : null,
                  ]}
                >
                  <Ionicons
                    name={reached ? 'checkmark' : next ? 'flag-outline' : 'lock-closed-outline'}
                    size={14}
                    color={reached || next ? palette.white : palette.textSoft}
                  />
                </View>

                <View style={styles.milestoneCopy}>
                  <Text style={styles.milestoneTitle}>{milestone.label}</Text>
                  <Text style={styles.milestoneMeta}>{milestone.title}</Text>
                </View>

                <Text
                  style={[
                    styles.milestoneState,
                    reached ? styles.milestoneStateReached : null,
                    next ? styles.milestoneStateNext : null,
                  ]}
                >
                  {reached ? 'Reached' : next ? 'Next' : 'Locked'}
                </Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    );
  }

  function renderTabContent() {
    if (activeTab === 'focus') {
      return (
        <>
          {renderFocusOverviewCard()}
        </>
      );
    }

    if (activeTab === 'control') {
      return (
        <>
          {renderControlCard()}
          {renderUsageCard()}
        </>
      );
    }

    if (activeTab === 'purify') {
      return (
        <>
          {renderPurifyCard()}
          {renderPurifyMilestonesCard()}
        </>
      );
    }

    return (
      <>
        {renderFocusOverviewCard()}
        {renderControlCard()}
        {renderPurifyCard()}
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

