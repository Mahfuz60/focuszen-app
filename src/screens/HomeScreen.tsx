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
import Svg, { Circle, Path } from 'react-native-svg';
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
  const [usageTimeframe, setUsageTimeframe] = React.useState<'today' | 'week' | 'month' | 'year'>('today');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
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
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);

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
    { key: 'breathe', label: 'Breathe', sub: 'Guided breathing', image: require('../../assets/breathe.png'), target: 'Breathe', color: '#4f46e5', progressLabel: 'Session progress', progressText: '60%', progressPercent: 60, btnIcon: 'play', btnLabel: 'Start Session' },
    { key: 'alarm', label: 'Power Nap', sub: 'Energy timer', image: require('../../assets/powerNap.png'), target: 'Alarm', color: '#f59e0b', progressLabel: 'Suggested time', progressText: '20 min', progressPercent: 50, btnIcon: 'timer-outline', btnLabel: 'Set Timer', isSlider: true },
    { key: 'bodycare', label: 'Wellness', sub: 'Health & Hydration', image: require('../../assets/wellness.png'), target: 'BodyCare', color: '#22c55e', progressLabel: 'Daily goal', progressText: '75%', progressPercent: 75, btnIcon: 'water-outline', btnLabel: 'Log Water' },
    { key: 'plan', label: 'Planner', sub: 'Daily tasks', image: require('../../assets/planner.png'), target: 'DailyPlanner', color: '#a855f7', progressLabel: 'Tasks completed', progressText: '6 / 8', progressPercent: 75, btnIcon: 'list', btnLabel: 'View Tasks' },
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

                <View style={styles.qaActionArea}>
                  <View style={styles.qaProgressHeader}>
                    <Text style={styles.qaProgressLabel}>{action.progressLabel}</Text>
                    <Text style={[styles.qaProgressText, { color: action.color }]}>{action.progressText}</Text>
                  </View>

                  <View style={styles.qaProgressTrack}>
                    <View style={[styles.qaProgressFill, { backgroundColor: action.color, width: `${action.progressPercent}%` as any }]} />
                    {(action as any).isSlider && (
                      <View style={[styles.qaSliderThumb, { left: `${action.progressPercent}%` as any }]} />
                    )}
                  </View>

                  {(action as any).isSlider && (
                    <View style={styles.qaSliderLabels}>
                      <Text style={styles.qaSliderLabelText}>10 min</Text>
                      <Text style={styles.qaSliderLabelText}>20 min</Text>
                      <Text style={styles.qaSliderLabelText}>30 min</Text>
                    </View>
                  )}

                  <Pressable style={[styles.qaActionBtn, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.btnIcon as any} size={16} color={action.color} />
                    <Text style={[styles.qaActionBtnText, { color: action.color }]}>{action.btnLabel}</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={[styles.usageSectionTop, { marginTop: spacing.sm }]}>
            <Text style={styles.usageTopLabel}>In-App Usage</Text>
            <View style={styles.usageHeaderRow}>
               <View>
                 <Text style={styles.usageTotalHero}>
                   {usageChartTotal < 60 ? usageChartTotal : Math.floor(usageChartTotal / 60)}
                   <Text style={styles.usageTotalSuffix}>{usageChartTotal < 60 ? 'm' : 'h'}</Text>
                 </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 }}>
                     <Ionicons 
                       name={usageDeltaInfo.isUp ? "trending-up" : "trending-down"} 
                       size={16} 
                       color={usageDeltaInfo.isUp ? "#10b981" : "#ef4444"} 
                     />
                     <Text style={[styles.usageDelta, { color: usageDeltaInfo.isUp ? "#10b981" : "#ef4444" }]}>
                       {usageDeltaInfo.percent}% vs yesterday
                     </Text>
                  </View>
               </View>

               <View>
                 <Pressable 
                   onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                   style={styles.usageChartBtn}
                 >
                   <Ionicons name="stats-chart" size={24} color={palette.text} />
                 </Pressable>
                 
                 {isDropdownOpen && (
                   <View style={styles.usageDropdownWrap}>
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
            </View>
          </View>

          <View style={styles.usageDetailsCard}>
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
                        <Text style={styles.usageListTime}>{item.value}m</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.usageListDivider} />

              <View style={styles.usageChartContainer}>
                <Svg width={200} height={200} viewBox="0 0 200 200">
                  {usageChartSegments.map((segment, idx) => {
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
                    const isRight = Math.cos(rad) > 0;
                    
                    const x1 = 100 + lineInner * Math.cos(rad);
                    const y1 = 100 + lineInner * Math.sin(rad);
                    const x2 = 100 + lineOuter * Math.cos(rad);
                    const y2 = 100 + lineOuter * Math.sin(rad);

                    // Label offset
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
                        <Text
                          style={[
                            styles.usagePercentLabel,
                            { 
                              color: segment.color, 
                              opacity: segment.actualPercent > 0 ? 1 : 0.6,
                              left: labelX - 30,
                              top: labelY - 10,
                              width: 60,
                              textAlign: 'center',
                            }
                          ]}
                        >
                          {(segment.actualPercent * 100).toFixed(1)}%
                        </Text>
                      </React.Fragment>
                    );
                  })}
                </Svg>

                <View style={styles.usageCenterContainer}>
                  <Text style={styles.usageCenterValue}>
                    {usageChartTotal < 60 ? usageChartTotal : Math.floor(usageChartTotal / 60)}
                    <Text style={styles.usageCenterValueSuffix}>{usageChartTotal < 60 ? 'm' : 'h'}</Text>
                  </Text>
                  <Text style={styles.usageCenterLabel}>Total</Text>
                </View>
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
