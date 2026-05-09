import React, { useMemo } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useFocusStore } from '../stores/useFocusStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { useProfileStore } from '../stores/useProfileStore';
import { useStudyStore } from '../stores/useStudyStore';
import { useUsageStore } from '../stores/useUsageStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { GradientBorderCard } from '../components/GradientBorderCard';
import { spacing } from '../theme/tokens';
import {
  createHomeStyles as createStyles,
  brandZenStyle,
  brandTextStyle,
  greetingNameStyle,
  greetingTextStyle,
  upNextArrowStyle,
  extraStyles,
} from '../styles/HomeScreen.styles';
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
  const [usageTimeframe, setUsageTimeframe] = React.useState<'today' | 'week' | 'month' | 'year'>('today');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('home'), [getPalette]);
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const systemScheme = useColorScheme();
  const settings = useSettingsStore((state) => state.settings);
  const profile = useProfileStore((state) => state.profile);
  const focusSessions = useFocusStore((state) => state.sessions);
  const activeSession = useFocusStore((state) => state.activeSession);
  const selectedPreset = useFocusStore((state) => state.selectedPreset);
  const startSession = useFocusStore((state) => state.startSession);
  const studySessions = useStudyStore((state) => state.sessions);
  const usageEntries = useUsageStore((state) => state.entries);
  const suggestions = useGoalsStore((state) => state.suggestions);
  const dailyLimitMinutes = useUsageStore((state) => state.dailyLimitMinutes);
  const streak = useGoalsStore((state) => state.streak);
  const tasks = usePlannerStore((state) => state.tasks);
  const selectedDate = usePlannerStore((state) => state.selectedDate);

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

  const featuredFocusTask = dashboard.featuredFocusTask;
  const nextTask = dashboard.nextTask;

  const focusCardTime = activeSession
    ? formatCountdown(activeSession.remainingSeconds)
    : formatFocusSlot(featuredFocusTask?.focusPresetMinutes ?? selectedPreset);
  const focusCardMeta = activeSession
    ? `Live • Starts: ${dashboard.activeSessionTask?.startTime ?? featuredFocusTask?.startTime ?? '--:--'}`
    : featuredFocusTask
      ? 'Ready to begin'
      : 'Start with your next block';
  const usageDetails = React.useMemo(() => {
    const now = new Date();
    const timeframeStart = new Date(now);
    
    if (usageTimeframe === 'week') timeframeStart.setDate(now.getDate() - 7);
    else if (usageTimeframe === 'month') timeframeStart.setMonth(now.getMonth() - 1);
    else if (usageTimeframe === 'year') timeframeStart.setFullYear(now.getFullYear() - 1);
    else timeframeStart.setHours(0, 0, 0, 0);

    const filteredEntries = usageEntries.filter(entry => new Date(entry.date) >= timeframeStart);
    const socialMins = filteredEntries.reduce((total, e) => total + e.minutesUsed, 0);
    
    // For focus and study, we'd ideally filter those stores too, 
    // but for now let's use the current day's summary as a base or scale it realistically
    const focusMins = focusSessions
      .filter(s => s.endedAt && new Date(s.endedAt) >= timeframeStart)
      .reduce((total, s) => total + s.completedMinutes, 0);
    
    const studyMins = studySessions
      .filter(s => s.endedAt && new Date(s.endedAt) >= timeframeStart)
      .reduce((total, s) => total + s.durationMinutes, 0);

    return [
      { key: 'focus', label: 'Focus', icon: 'bulb', value: focusMins, color: '#3b82f6' },
      { key: 'study', label: 'Study', icon: 'book', value: studyMins, color: '#f59e0b' },
      { key: 'social', label: 'Social apps', icon: 'people', value: socialMins, color: '#84cc16' },
      { key: 'other', label: 'Other apps', icon: 'grid', value: 0, color: '#8b5cf6' },
    ];
  }, [usageTimeframe, usageEntries, focusSessions, studySessions, mode]);

  const usageChartTotal = usageDetails.reduce((total, item) => total + item.value, 0);
  
  const usageDeltaInfo = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(today);

    const getMins = (start: Date, end: Date) => {
      const u = usageEntries.filter(e => {
        const d = new Date(e.date);
        return d >= start && d < end;
      }).reduce((t, e) => t + e.minutesUsed, 0);
      
      const f = focusSessions.filter(s => {
        const d = s.endedAt ? new Date(s.endedAt) : null;
        return d && d >= start && d < end;
      }).reduce((t, s) => t + s.completedMinutes, 0);

      const st = studySessions.filter(s => {
        const d = s.endedAt ? new Date(s.endedAt) : null;
        return d && d >= start && d < end;
      }).reduce((t, s) => t + s.durationMinutes, 0);

      return u + f + st;
    };

    const todayVal = getMins(today, new Date());
    const yesterdayVal = getMins(yesterday, yesterdayEnd);
    
    if (yesterdayVal === 0) return { percent: todayVal > 0 ? 100 : 0, isUp: todayVal > 0 };
    
    const diff = todayVal - yesterdayVal;
    const percent = Math.abs((diff / yesterdayVal) * 100);
    return { percent: Math.round(percent), isUp: diff >= 0 };
  }, [usageEntries, focusSessions, studySessions]);

  const chartRadius = 60;
  const usageChartCircumference = 2 * Math.PI * chartRadius;
  
  const usageChartSegments = useMemo(() => {
    const MIN_VISUAL_PERCENT = 0.05; // 5% minimum visual slice
    const zeroCount = usageDetails.filter(d => d.value === 0).length;
    const totalMinVisual = zeroCount * MIN_VISUAL_PERCENT;
    
    // Calculate visual percents
    const segments = usageDetails.map((item) => {
      let visualPercent = 0;
      if (usageChartTotal === 0) {
        visualPercent = 1 / usageDetails.length;
      } else {
        if (item.value === 0) {
          visualPercent = MIN_VISUAL_PERCENT;
        } else {
          // Scale down the items with data to make room for the 5% minimums
          visualPercent = (item.value / usageChartTotal) * (1 - totalMinVisual);
        }
      }
      return { ...item, visualPercent, actualPercent: usageChartTotal > 0 ? item.value / usageChartTotal : 0 };
    });

    let currentOffset = 0;
    return segments.map(seg => {
      const s = {
        ...seg,
        dashOffset: -currentOffset,
      };
      currentOffset += (seg.visualPercent * usageChartCircumference);
      return s;
    });
  }, [usageDetails, usageChartCircumference]);
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
    { key: 'breathe', label: 'Breathe', sub: 'Guided breathing', image: require('../../assets/breathe.png'), target: 'Breathe', color: '#4f46e5' },
    { key: 'alarm', label: 'Power Nap', sub: 'Energy timer', image: require('../../assets/powerNap.png'), target: 'Alarm', color: '#f59e0b' },
    { key: 'hydration', label: 'Hydration', sub: 'Water & Drinks', image: require('../../assets/wellness.png'), target: 'Hydration', color: '#0ea5e9' },
    { key: 'eyewellness', label: 'Eye Care', sub: 'Rest & Exercises', image: require('../../assets/restEye.png'), target: 'EyeWellness', color: '#10b981' },
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
            <View>
              <Text style={[styles.brandText, brandTextStyle(mode, palette)]}>
                Focus<Text style={brandZenStyle(mode, palette)}>Zen</Text>
              </Text>
             
            </View>
            <View>
              <Pressable
                onPress={() => navigation.navigate('Insights')}
                style={styles.headerIconButton}
              >
                <Ionicons name="settings-outline" size={20} color={palette.text} />
              </Pressable>
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
              <View style={[styles.streakRing, {
                borderColor: mode === 'dark' ? `${palette.green}40` : `${palette.green}20`,
                shadowColor: palette.green,
                shadowOpacity: mode === 'dark' ? 0.35 : 0.1,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 10,
                backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.96)' : '#ffffff',
                borderWidth: 1.5,
                borderRadius: 70,
              }]}>
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

          <Pressable
            onPress={handlePrimaryAction}
            style={[styles.focusCard, {
              backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#fff',
              marginTop: spacing.lg,
            }]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.focusEyebrowRow}>
                  <Ionicons name="flash" size={14} color={palette.green} />
                  <Text style={styles.focusEyebrow}>TODAY'S FOCUS</Text>
                </View>
              </View>

              <Text style={styles.focusTitle}>Deep work session</Text>

              <View style={styles.focusFooter}>
                <View style={styles.focusTimerRow}>
                  <Ionicons name="timer-outline" size={18} color={palette.green} />
                  <Text style={styles.focusTimer}>{focusCardTime}</Text>
                </View>
                <Text style={[styles.focusMeta, { marginLeft: spacing.md }]}>
                  {focusCardMeta}
                </Text>
              </View>
            </View>

            <View style={[styles.playGlowOuter, { backgroundColor: palette.greenSoft }]}>
              <View style={styles.playGlowInner}>
                <Ionicons
                  name={activeSession ? 'pause' : 'play'}
                  size={24}
                  color="#fff"
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
                style={styles.qaCardWrapper}
              >
                <GradientBorderCard 
                  colors={[action.color + '40', 'rgba(148, 163, 184, 0.1)']} 
                  borderRadius={24}
                  innerStyle={[styles.qaCard, { backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#fff' }]}
                >
                  <View style={styles.qaIconContainer}>
                    <View style={styles.qaIconWrap}>
                      {action.key === 'focus' ? (
                        <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(16, 185, 129, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }}>
                            <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
                          </View>
                        </View>
                      ) : (
                        <View style={[styles.qaIconWrap, { backgroundColor: `${action.color}15` }]}>
                           <Image source={action.image} style={styles.qaImage} />
                        </View>
                      )}
                    </View>
                    <View style={styles.qaArrowHint}>
                      <Feather name="arrow-up-right" size={14} color={action.color} />
                    </View>
                  </View>
                  
                  <View style={styles.qaInfo}>
                    <Text style={styles.qaLabel}>{action.label}</Text>
                    <Text style={styles.qaSub}>{action.sub}</Text>
                  </View>
                </GradientBorderCard>
              </Pressable>
            ))}
          </View>

          <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <Pressable onPress={() => navigation.navigate('Insights')}>
              <Text style={styles.seeAllText}>See Full</Text>
            </Pressable>
          </View>

          <View style={{ zIndex: 100 }}>
            <GradientBorderCard
              colors={['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.1)']}
              borderRadius={28}
              innerStyle={[styles.usageMasterCard, { backgroundColor: mode === 'dark' ? 'rgba(10, 16, 26, 0.98)' : '#fff' }]}
            >
              <View style={styles.usageHeroRow}>
                <View>
                  <View style={styles.usageLabelRow}>
                    <Ionicons name="time" size={16} color="#3b82f6" />
                    <Text style={styles.usageHeroLabel}>DAILY USAGE</Text>
                  </View>
                  <Text style={styles.usageTotalHero}>
                    {usageChartTotal < 60 ? usageChartTotal : Math.floor(usageChartTotal / 60)}
                    <Text style={styles.usageTotalSuffix}>{usageChartTotal < 60 ? 'm' : 'h'}</Text>
                  </Text>
                  <View style={styles.usageDeltaRow}>
                    <Ionicons 
                      name={usageDeltaInfo.isUp ? "trending-up" : "trending-down"} 
                      size={14} 
                      color={usageDeltaInfo.isUp ? "#10b981" : "#ef4444"} 
                    />
                    <Text style={[styles.usageDeltaText, { color: usageDeltaInfo.isUp ? "#10b981" : "#ef4444" }]}>
                      {usageDeltaInfo.percent}% vs yesterday
                    </Text>
                  </View>
                </View>

                <View style={styles.usageActionWrap}>
                  <Pressable 
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={styles.usageChartBtn}
                  >
                    <Ionicons name="stats-chart" size={20} color={palette.text} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.usageProgressContainer}>
                <View style={styles.usageProgressTrack}>
                  <View style={[styles.usageProgressFill, { width: `${Math.min((usageChartTotal / dailyLimitMinutes) * 100, 100)}%` as any }]} />
                </View>
                <View style={styles.usageProgressLabels}>
                  <Text style={styles.usageProgressSub}>Limit: {Math.floor(dailyLimitMinutes / 60)}h</Text>
                  <Text style={styles.usageProgressPercent}>{Math.round((usageChartTotal / dailyLimitMinutes) * 100)}%</Text>
                </View>
              </View>
            </GradientBorderCard>

            {isDropdownOpen && (
              <View style={[styles.usageDropdownWrap, { top: 60, right: 24 }]}>
                {['today', 'week', 'month', 'year'].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setUsageTimeframe(t as any);
                      setIsDropdownOpen(false);
                    }}
                    style={[
                      styles.usageDropdownItem,
                      usageTimeframe === t && styles.usageDropdownItemActive
                    ]}
                  >
                    <Text style={[
                      styles.usageDropdownText,
                      usageTimeframe === t && styles.usageDropdownTextActive
                    ]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable 
            onPress={() => navigation.navigate('Insights')}
            style={[styles.usageDetailsCard, {
              borderColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.65)' : 'rgba(59, 130, 246, 0.35)',
              shadowColor: '#3b82f6',
              shadowOpacity: mode === 'dark' ? 0.5 : 0.2,
              shadowRadius: 35,
              shadowOffset: { width: 0, height: 12 },
              elevation: 15,
              backgroundColor: mode === 'dark' ? 'rgba(10, 16, 26, 0.99)' : '#ffffff',
              borderWidth: 2,
            }]}
          >
            <View style={styles.usageList}>
              {usageDetails.map((item, index) => {
                const itemPercent = usageChartTotal > 0 ? item.value / usageChartTotal : 0;
                return (
                  <View 
                    key={item.key} 
                    style={[
                      styles.usageListItem,
                      index === usageDetails.length - 1 && styles.usageListItemNoBorder
                    ]}
                  >
                    <View style={styles.usageListLeft}>
                      <View style={styles.usageIconWrap}>
                        <Svg width={46} height={46} viewBox="0 0 46 46" style={{ position: 'absolute' }}>
                          <Circle 
                            cx="23" cy="23" r="21" 
                            stroke={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} 
                            strokeWidth={3} 
                            fill="none" 
                          />
                          {itemPercent > 0 && (
                            <Circle 
                              cx="23" cy="23" r="21" 
                              stroke={item.color} 
                              strokeWidth={3} 
                              fill="none" 
                              strokeDasharray={`${2 * Math.PI * 21}`}
                              strokeDashoffset={`${2 * Math.PI * 21 * (1 - itemPercent)}`}
                              strokeLinecap="round"
                              transform="rotate(-90 23 23)"
                            />
                          )}
                        </Svg>
                        <View style={[styles.usageIconInner, { backgroundColor: `${item.color}${mode === 'dark' ? '20' : '15'}` }]}>
                          <Ionicons name={item.icon as any} size={18} color={item.color} />
                        </View>
                      </View>
                      <View>
                        <Text style={styles.usageListName}>{item.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.usageListTime}>{item.value}m</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: item.color }}>
                            {Math.round(itemPercent * 100)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.usageListDivider} />

            <View style={styles.usageChartContainer}>
              <Svg width={200} height={200} viewBox="0 0 200 200">
                {usageChartSegments.map((segment) => {
                  const strokeW = 24;
                  const gap = 6;
                  const segmentLen = (segment.visualPercent * usageChartCircumference);
                  const dashLen = Math.max(0.1, segmentLen - strokeW - gap);
                  const dashOffset = segment.dashOffset - (strokeW / 2) - (gap / 2);
                  const startAngle = ((-segment.dashOffset) / usageChartCircumference) * 360 - 90;
                  const sweepAngle = segment.visualPercent * 360;
                  const midAngle = startAngle + (sweepAngle / 2);
                  const rad = midAngle * (Math.PI / 180);
                  const lineInner = chartRadius + 10;
                  const lineOuter = chartRadius + 18;
                  const x1 = 100 + lineInner * Math.cos(rad);
                  const y1 = 100 + lineInner * Math.sin(rad);
                  const x2 = 100 + lineOuter * Math.cos(rad);
                  const y2 = 100 + lineOuter * Math.sin(rad);
                  const labelDist = lineOuter + 22;
                  const labelX = 100 + labelDist * Math.cos(rad);
                  const labelY = 100 + labelDist * Math.sin(rad);

                  return (
                    <React.Fragment key={`seg-${segment.key}`}>
                      <Circle
                        cx={100} cy={100} r={chartRadius}
                        stroke={segment.color} strokeWidth={strokeW}
                        strokeDasharray={`${dashLen} ${usageChartCircumference}`}
                        strokeDashoffset={dashOffset}
                        fill="none" strokeLinecap="round"
                        opacity={segment.actualPercent > 0 ? 1 : (mode === 'dark' ? 0.25 : 0.2)}
                        transform="rotate(-90 100 100)"
                      />
                      <Path
                        d={`M ${x1} ${y1} L ${x2} ${y2}`}
                        stroke={segment.color} strokeWidth={1}
                        opacity={segment.actualPercent > 0 ? 0.7 : 0.3}
                        fill="none"
                      />
                    </React.Fragment>
                  );
                })}
              </Svg>

              {/* Segment Labels */}
              {usageChartSegments.map((segment) => {
                const midAngle = ((-segment.dashOffset) / usageChartCircumference) * 360 - 90 + (segment.visualPercent * 360 / 2);
                const rad = midAngle * (Math.PI / 180);
                const labelDist = chartRadius + 40;
                const labelX = 100 + labelDist * Math.cos(rad);
                const labelY = 100 + labelDist * Math.sin(rad);

                return (
                  <View
                    key={`label-${segment.key}`}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 40,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: labelX - 100, // Relative to SVG center (100,100)
                      marginTop: labelY - 100,  // Relative to SVG center (100,100)
                      zIndex: 10,
                    }}
                  >
                    <Text style={{ 
                      fontSize: 11, 
                      fontWeight: '800', 
                      color: segment.color,
                      backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}>
                      {Math.round(segment.actualPercent * 100)}%
                    </Text>
                  </View>
                );
              })}

              <View style={styles.usageCenterContainer}>
                <Text style={styles.usageCenterValue}>
                  {usageChartTotal < 60 ? usageChartTotal : Math.floor(usageChartTotal / 60)}
                  <Text style={styles.usageCenterValueSuffix}>{usageChartTotal < 60 ? 'm' : 'h'}</Text>
                </Text>
                <Text style={styles.usageCenterLabel}>Total</Text>
              </View>
            </View>
          </Pressable>



          

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Up next</Text>
            <Pressable onPress={() => navigation.navigate('DailyPlanner')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.navigate('DailyPlanner')}
            style={[styles.upNextCard, {
              borderColor: mode === 'dark' ? `${palette.green}35` : `${palette.green}15`,
              shadowColor: palette.green,
              shadowOpacity: mode === 'dark' ? 0.25 : 0.08,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
              backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
              borderWidth: 1,
            }]}
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
