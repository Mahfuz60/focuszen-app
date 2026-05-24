import React, { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Image,
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
import { useAlarmStore } from '../stores/useAlarmStore';
import { useBreatheStore } from '../stores/useBreatheStore';
import { useBodyCareStore, computeTodayWater } from '../stores/useBodyCareStore';
import { useControlStore } from '../stores/useControlStore';
import { useFocusStore } from '../stores/useFocusStore';
import { usePurifyStore } from '../stores/usePurifyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useStudyStore } from '../stores/useStudyStore';
import { useUsageStore } from '../stores/useUsageStore';
import { spacing } from '../theme/tokens';
import {
  createInsightsStyles as createStyles,
} from '../styles/InsightsScreen.styles';
import { ScreenPalette } from '../theme/screenPalettes';
import { AppControlTarget } from '../types/models';
import { buildControlInsightsOverview } from '../utils/controlInsightsOverview';
import { 
  getLatestInsightsAnchorDate, 
  getEarliestInsightsAnchorDate,
  getPeriodBounds, 
  shiftInsightsAnchorDate,
  buildBucketSeeds, 
  isDateWithinBounds, 
  formatPeriodLabel 
} from '../utils/insightsAnalytics';
import { buildPurifyFocusOverview } from '../utils/purifyFocusOverview';
import { buildPurifyInsights } from '../utils/purifyInsights';
import { buildPurifyStatus, getPurifyRingProgress } from '../utils/purifyProgress';



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
    return 'No Data';
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
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('insights'), [getPalette]);
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<InsightTab>('overview');
  const [insightRange, setInsightRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('week');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all');
  const [selectedWellnessMetric, setSelectedWellnessMetric] = useState<'naps' | 'water' | 'breathe'>('water');
  const [showFullActivity, setShowFullActivity] = useState(false);
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());

  const controls = useControlStore((state) => state.controls);
  const strictModeEnabled = useSettingsStore((state) => state.settings?.strictModeEnabled ?? false);
  const focusSessions = useFocusStore((state) => state.sessions);
  const purify = usePurifyStore((state) => state.purify);
  const refreshPurify = usePurifyStore((state) => state.refreshPurify);
  const purifyLanguage = useSettingsStore((state) => state.settings.purifyLanguage ?? 'en');
  const studySessions = useStudyStore((state) => state.sessions);
  const usageEntries = useUsageStore((state) => state.entries);
  const napSessions = useAlarmStore((state) => state.sessions);
  const breatheSessions = useBreatheStore((state) => state.sessions);
  const waterEntries = useBodyCareStore((state) => state.waterEntries);
  const waterGoal = useBodyCareStore((state) => state.waterGoalMl);
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

  const [anchorDate, setAnchorDate] = useState(() =>
    getLatestInsightsAnchorDate({
      focusSessions,
      studySessions,
      usageEntries,
    })
  );

  const earliestDate = useMemo(
    () =>
      getEarliestInsightsAnchorDate({
        focusSessions,
        studySessions,
        usageEntries,
      }),
    [focusSessions, studySessions, usageEntries]
  );

  const recentActivities = useMemo(() => {
    const range = insightRange;
    const bounds = getPeriodBounds(anchorDate, range, earliestDate);

    const activities: any[] = [
      ...focusSessions.map(s => ({ ...s, type: 'focus', timestamp: s.endedAt || s.startedAt })),
      ...napSessions.filter(s => s.completedAt).map(s => ({ ...s, type: 'nap', timestamp: s.completedAt })),
      ...breatheSessions.map(s => ({ ...s, type: 'breathe', timestamp: s.completedAt })),
      ...waterEntries.map(e => ({ ...e, type: 'water', timestamp: e.loggedAt })),
    ];

    return activities
      .filter(a => a.timestamp && isDateWithinBounds(new Date(a.timestamp), bounds))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [focusSessions, napSessions, breatheSessions, waterEntries, anchorDate, insightRange, earliestDate]);

  const wellnessDashboard = useMemo(() => {
    const range = insightRange;
    const bounds = getPeriodBounds(anchorDate, range, earliestDate);
    const buckets = buildBucketSeeds(range, bounds).map(bucket => {
      const bucketBounds = { start: bucket.start, end: bucket.end };
      
      const napsInBucket = napSessions.filter(s => s.completedAt && isDateWithinBounds(new Date(s.completedAt), bucketBounds));
      const breatheInBucket = breatheSessions.filter(s => isDateWithinBounds(new Date(s.completedAt), bucketBounds));
      const waterInBucket = waterEntries.filter(e => isDateWithinBounds(new Date(e.loggedAt), bucketBounds));

      return {
        key: bucket.key,
        label: bucket.label,
        shortLabel: bucket.shortLabel,
        naps: napsInBucket.reduce((acc, s) => acc + s.durationMinutes, 0),
        breathe: Math.floor(breatheInBucket.reduce((acc, s) => acc + s.durationSeconds, 0) / 60),
        water: waterInBucket.reduce((acc, e) => acc + e.amountMl, 0),
      };
    });

    const totalNaps = buckets.reduce((acc, b) => acc + b.naps, 0);
    const totalBreathe = buckets.reduce((acc, b) => acc + b.breathe, 0);
    const totalWater = buckets.reduce((acc, b) => acc + b.water, 0);

    return {
      buckets,
      totals: {
        naps: totalNaps,
        breathe: totalBreathe,
        water: totalWater,
      },
      rangeLabel: formatPeriodLabel(range, bounds),
    };
  }, [insightRange, anchorDate, napSessions, breatheSessions, waterEntries]);

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
    const rawMax = Math.max(...dataPoints.map((item) => item.value), 0);
    const maxVal = rawMax < 60 ? 60 : Math.ceil(rawMax / 15) * 15;
    
    const formatValue = (val: number) => {
      if (val >= 60) return `${Math.floor(val / 60)}h`;
      return `${Math.round(val)}m`;
    };

    const yAxisLabels = [
      formatValue(maxVal),
      formatValue(maxVal * 0.75),
      formatValue(maxVal * 0.5),
      formatValue(maxVal * 0.25),
      '0m',
    ];

    const width = 300;
    const height = 120;
    const padding = 10;
    const chartHeight = height - padding * 2;
    const stepX = dataPoints.length > 1 ? (width - padding * 2) / (dataPoints.length - 1) : 0;
    
    const points = dataPoints.map((item, i) => ({
      x: dataPoints.length > 1 ? padding + i * stepX : width / 2,
      y: height - padding - (Math.min(item.value, maxVal) / maxVal) * chartHeight,
    }));
 
    const linePath = points.reduce((path, p, i) => 
      i === 0 ? `M${p.x},${p.y}` : `${path} L${p.x},${p.y}`, '');
    
    const fillPath = points.length > 0 
      ? `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`
      : '';

    return (
      <LinearGradient
        colors={mode === 'dark' ? [`${palette.green}40`, `${palette.blue}40`] : [`${palette.green}15`, `${palette.blue}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCardGradient, { marginTop: spacing.lg }]}
      >
        <View style={[styles.sectionCardInner, { backgroundColor: palette.surface }]}>
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
              {yAxisLabels.map((l, i) => (
                <Text key={i} style={styles.chartYLabel}>{l}</Text>
              ))}
            </View>
   
            <View style={styles.chartArea}>
              <View style={styles.chartGrid}>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={styles.chartGridLine} />
                ))}
              </View>
              
              <Svg width="100%" height={height}>
                <Defs>
                  <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={palette.green} stopOpacity={0.25} />
                    <Stop offset="1" stopColor={palette.green} stopOpacity={0} />
                  </SvgLinearGradient>
                </Defs>
                <Path d={fillPath} fill="url(#chartFill)" />
                {/* Line Glow Effect */}
                <Path d={linePath} stroke={palette.green} strokeWidth={6} fill="none" opacity={0.15} strokeLinecap="round" strokeLinejoin="round" />
                <Path d={linePath} stroke={palette.green} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <React.Fragment key={i}>
                     <Circle cx={p.x} cy={p.y} r={6} fill={palette.green} opacity={0.2} />
                     <Circle cx={p.x} cy={p.y} r={4.5} fill={palette.green} stroke={mode === 'dark' ? '#111' : '#fff'} strokeWidth={2} />
                  </React.Fragment>
                ))}
              </Svg>
   
              <View style={styles.chartXLabels}>
                {dataPoints.map((item, i) => {
                  const isDay = insightRange === 'day';
                  const show = isDay ? i % 6 === 0 || i === dataPoints.length - 1 : true;
                  
                  return (
                    <Text 
                      key={`${item.label}-${i}`} 
                      style={[
                        styles.chartXLabel, 
                        !show && { opacity: 0 } 
                      ]}
                    >
                      {item.label}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  function renderSummaryPairs() {
    return (
      <View style={styles.summaryGrid}>
        <LinearGradient
          colors={mode === 'dark' ? [`${palette.green}40`, `${palette.blue}40`] : [`${palette.green}15`, `${palette.blue}15`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCardGradient}
        >
          <View style={[styles.summaryCardInner, { backgroundColor: palette.surface }]}>
            <View style={styles.summaryHeader}>
               <View style={styles.summaryIconWrap}>
                  <Ionicons name="leaf-outline" size={16} color={palette.green} />
               </View>
               <Text style={styles.summaryLabel}>Best Day</Text>
            </View>
            <Text style={styles.summaryValue}>{focusOverview.bestDay.value || 'None'}</Text>
            <Text style={styles.summarySub}>{focusOverview.bestDay.label || 'Keep pushing'}</Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={mode === 'dark' ? [`${palette.purple}40`, `${palette.blue}40`] : [`${palette.purple}15`, `${palette.blue}15`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCardGradient}
        >
          <View style={[styles.summaryCardInner, { backgroundColor: palette.surface }]}>
            <View style={styles.summaryHeader}>
               <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(217,70,239,0.05)' }]}>
                  <Ionicons name="sparkles" size={16} color={palette.purple} />
               </View>
               <Text style={styles.summaryLabel}>Top Time</Text>
            </View>
            <Text style={styles.summaryValue}>{topTimeRange || 'No Data'}</Text>
            <Text style={styles.summarySub}>Peak focus window</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  function renderControlSnapshot() {
    return (
      <LinearGradient
        colors={mode === 'dark' ? [`${palette.purple}40`, `${palette.blue}40`] : [`${palette.purple}15`, `${palette.blue}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCardGradient, { marginTop: spacing.md }]}
      >
        <View style={[styles.sectionCardInner, { backgroundColor: palette.surface }]}>
          <View style={styles.purifyHeader}>
            <Text style={styles.sectionTitle}>Control snapshot</Text>
            <Text style={[styles.sectionTitle, { color: palette.green }]}>
              {Math.round((Number(controlOverview.metrics.protected.value || 0) / Math.max(controls.length || 1, 1)) * 100)}%
            </Text>
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
      </LinearGradient>
    );
  }

  function renderPurifyOverhaul() {
    const nextMilestone = purifyInsights.milestones.find(m => m.state === 'next') || purifyInsights.milestones.find(m => m.state === 'locked');
    const nextMilestoneLabel = nextMilestone 
      ? `Next: ${nextMilestone.days} Days`
      : 'Fully Purified';
    const stageProgressText = purifyStatus.active 
      ? `Stage: ${purifyInsights.activeStage.title}`
      : 'Purify inactive';

    return (
      <LinearGradient
        colors={mode === 'dark' ? [`${palette.purple}40`, `${palette.blue}40`] : [`${palette.purple}15`, `${palette.blue}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCardGradient, { marginTop: spacing.md }]}
      >
        <View style={[styles.sectionCardInner, { backgroundColor: palette.surface }]}>
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
             <Text style={styles.summaryLabel}>Streak Progress Ring</Text>
             
             <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 16 }}>
               <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
                 <Svg width={140} height={140} viewBox="0 0 140 140" style={{ transform: [{ rotate: '-90deg' }] }}>
                   <Defs>
                     <SvgLinearGradient id="streakGrad" x1="0" y1="0" x2="1" y2="1">
                       <Stop offset="0" stopColor="#8b5cf6" />
                       <Stop offset="1" stopColor="#d946ef" />
                     </SvgLinearGradient>
                   </Defs>
                   {/* Background Circle */}
                   <Circle
                     cx="70"
                     cy="70"
                     r="55"
                     stroke={mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)'}
                     strokeWidth="8"
                     fill="none"
                   />
                   {/* Active Progress Circle */}
                   <Circle
                     cx="70"
                     cy="70"
                     r="55"
                     stroke="url(#streakGrad)"
                     strokeWidth="8"
                     fill="none"
                     strokeDasharray={`${2 * Math.PI * 55}`}
                     strokeDashoffset={`${2 * Math.PI * 55 * (1 - getPurifyRingProgress(purifyStatus.currentStreakDays))}`}
                     strokeLinecap="round"
                   />
                 </Svg>
                 <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                   <Text style={{ fontSize: 32, fontWeight: '900', color: palette.purple }}>
                     {purifyStatus.currentStreakDays}
                   </Text>
                   <Text style={{ fontSize: 9, fontWeight: '900', color: mode === 'dark' ? '#cbd5e1' : '#475569', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
                     Day Streak
                   </Text>
                 </View>
               </View>
             </View>

             <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, borderColor: mode === 'dark' ? '#334155' : '#cbd5e1' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' }} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: mode === 'dark' ? '#cbd5e1' : '#475569' }}>
                      {stageProgressText}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: palette.purple, textTransform: 'uppercase' }}>
                    {nextMilestoneLabel}
                  </Text>
                </View>
             </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  function renderWellnessCharts() {
    const metrics = [
      { id: 'water', label: 'Water', asset: require('../../assets/wellness.png'), color: palette.blue },
      { id: 'breathe', label: 'Breathe', asset: require('../../assets/breathe.png'), color: palette.purple },
      { id: 'naps', label: 'Naps', asset: require('../../assets/powerNap.png'), color: palette.green },
    ];

    const data = wellnessDashboard.buckets;
    const maxVal = Math.max(...data.map(b => (b as any)[selectedWellnessMetric]), 1);

    return (
      <LinearGradient
        colors={mode === 'dark' ? [`${palette.blue}40`, `${palette.purple}40`] : [`${palette.blue}15`, `${palette.purple}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCardGradient, { marginTop: spacing.md }]}
      >
        <View style={[styles.sectionCardInner, { backgroundColor: palette.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wellness Insights</Text>
            <View style={styles.weekChip}>
              {insightRange !== 'all' && (
                <Pressable 
                  onPress={() => setAnchorDate(shiftInsightsAnchorDate(anchorDate, insightRange, -1))} 
                  style={styles.navBtn}
                >
                  <Ionicons name="chevron-back" size={16} color={palette.text} />
                </Pressable>
              )}
              <Text style={styles.weekChipText}>{wellnessDashboard.rangeLabel}</Text>
              {insightRange !== 'all' && (
                <Pressable 
                  onPress={() => setAnchorDate(shiftInsightsAnchorDate(anchorDate, insightRange, 1))} 
                  style={styles.navBtn}
                >
                  <Ionicons name="chevron-forward" size={16} color={palette.text} />
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.metricSelector}>
            {metrics.map(m => {
              const active = selectedWellnessMetric === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setSelectedWellnessMetric(m.id as any)}
                  style={[styles.metricBtn, active && styles.metricBtnActive]}
                >
                  <Image source={m.asset} style={{ width: 18, height: 18, marginRight: 4, opacity: active ? 1 : 0.6 }} resizeMode="contain" />
                  <Text style={[styles.metricText, active && styles.metricTextActive]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.wellnessChartContainer}>
            <View style={styles.wellnessBars}>
              {data.map((bucket, i) => {
                const val = (bucket as any)[selectedWellnessMetric];
                const heightPercent = (val / maxVal) * 100;
                const showLabel = data.length <= 7 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;

                const formatBarValue = (v: number) => {
                  if (v === 0) return '';
                  if (selectedWellnessMetric === 'water') {
                    return v >= 1000 ? `${(v / 1000).toFixed(1)}L` : `${v}`;
                  }
                  return `${v}m`;
                };

                return (
                  <View key={bucket.key} style={styles.wellnessCol}>
                    <Text style={styles.wellnessBarValue} numberOfLines={1}>
                      {formatBarValue(val)}
                    </Text>
                    <View style={styles.barTrack}>
                      {heightPercent > 0 && (
                        <LinearGradient
                          colors={
                            selectedWellnessMetric === 'water'
                              ? ['#38bdf8', '#0284c7']
                              : selectedWellnessMetric === 'breathe'
                                ? ['#c084fc', '#7c3aed']
                                : ['#34d399', '#059669']
                          }
                          style={[styles.barFill, { height: `${heightPercent}%` }]}
                        />
                      )}
                    </View>
                    <Text 
                      style={[
                        styles.barLabel, 
                        { opacity: showLabel ? 1 : 0 }
                      ]}
                      numberOfLines={1}
                    >
                      {bucket.shortLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  function renderActivityFeed() {
    const displayActivities = recentActivities.slice(0, showFullActivity ? 10 : 5);
    
    return (
      <LinearGradient
        colors={mode === 'dark' ? [`${palette.green}40`, `${palette.purple}40`] : [`${palette.green}15`, `${palette.purple}15`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCardGradient, { marginTop: spacing.md }]}
      >
        <View style={[styles.sectionCardInner, { backgroundColor: palette.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Feed</Text>
          </View>
          <View style={styles.activityList}>
            {displayActivities.map((activity, i) => {
              const config = ({
                focus: { asset: require('../../assets/focus.png'), color: palette.green, title: 'Focus Session' },
                nap: { asset: require('../../assets/powerNap.png'), color: '#f59e0b', title: 'Power Nap' },
                breathe: { asset: require('../../assets/breathe.png'), color: '#8b5cf6', title: 'Breathe' },
                water: { asset: require('../../assets/wellness.png'), color: '#0ea5e9', title: 'Hydration' },
              } as Record<string, any>)[activity.type];

              const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <View key={`${activity.type}-${i}`} style={[styles.activityItem, i === displayActivities.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.activityIconBox, { backgroundColor: `${config.color}08` }]}>
                     <Image source={config.asset} style={{ width: 22, height: 22 }} resizeMode="contain" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{config.title}</Text>
                    <Text style={styles.activityMeta}>
                      {activity.type === 'focus' && `${activity.durationMinutes}m session`}
                      {activity.type === 'nap' && `${activity.durationMinutes}m nap`}
                      {activity.type === 'breathe' && `${Math.floor(activity.durationSeconds / 60)}m breathe`}
                      {activity.type === 'water' && `${activity.amountMl}ml logged`}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>{time}</Text>
                </View>
              );
            })}
          </View>
          
          {recentActivities.length > 5 && (
            <Pressable 
              onPress={() => setShowFullActivity(!showFullActivity)} 
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>
                {showFullActivity ? 'Show Less' : `See All (${recentActivities.length})`}
              </Text>
              <Ionicons 
                name={showFullActivity ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={palette.blue} 
              />
            </Pressable>
          )}
        </View>
      </LinearGradient>
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
        <View style={styles.periodToggle}>
          {(['day', 'week', 'month', 'year', 'all'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setInsightRange(r)}
              style={[styles.periodBtn, insightRange === r && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, insightRange === r && styles.periodTextActive]}>
                {r === 'day' ? 'Today' : r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {renderFocusOverviewCard()}
        {renderSummaryPairs()}
        {renderWellnessCharts()}
        {renderActivityFeed()}
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
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <Text style={styles.topTitle}>Insights</Text>

            <View style={{ width: 42 }} />
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
                  style={[styles.tabChip, active ? styles.tabChipActive : null, { alignItems: 'center' }]}
                >
                  <Text style={[styles.tabChipText, active ? styles.tabChipTextActive : null]}>
                    {label}
                  </Text>
                  {active && <View style={styles.activeTabGlow} />}
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
