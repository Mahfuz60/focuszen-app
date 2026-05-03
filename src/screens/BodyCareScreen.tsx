import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useBodyCareStore, WATER_PRESETS_ML, computeTodayWater } from '../stores/useBodyCareStore';
import { spacing } from '../theme/tokens';
import * as Haptics from 'expo-haptics';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  createBodyCareStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/BodyCareScreen.styles';

const EYE_REST_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

export function BodyCareScreen() {
  const { mode } = useAppTheme();
  const navigation = useNavigation<any>();

  const waterGoalMl = useBodyCareStore((s) => s.waterGoalMl);
  const waterEntries = useBodyCareStore((s) => s.waterEntries);
  const eyeRestLogs = useBodyCareStore((s) => s.eyeRestLogs);
  const logWater = useBodyCareStore((s) => s.logWater);
  const logEyeRest = useBodyCareStore((s) => s.logEyeRest);
  const deleteWaterEntry = useBodyCareStore((s) => s.deleteWaterEntry);
  const setWaterGoal = useBodyCareStore((s) => s.setWaterGoal);

  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
    [mode]
  );
  const styles = useMemo(() => createBodyCareStyles(palette), [palette]);

  const [currentDay, setCurrentDay] = useState(new Date().toDateString());

  useEffect(() => {
    const timer = setInterval(() => {
      const todayStr = new Date().toDateString();
      if (todayStr !== currentDay) {
        setCurrentDay(todayStr);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 1000 * 60); // Check every minute
    return () => clearInterval(timer);
  }, [currentDay]);

  const totalWaterToday = useMemo(() => computeTodayWater(waterEntries), [waterEntries, currentDay]);
  const waterProgress = Math.min(totalWaterToday / waterGoalMl, 1);
  const progressPercent = Math.round(waterProgress * 100);

  const hydrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(hydrationAnim, {
      toValue: waterProgress,
      useNativeDriver: false,
      tension: 20,
      friction: 7,
    }).start();
  }, [waterProgress]);

  const handleLogWater = (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logWater(ml);
  };

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(waterGoalMl.toString());

  const handleUpdateGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      setWaterGoal(val);
      setIsEditingGoal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const isGoalReached = totalWaterToday >= waterGoalMl;

  useEffect(() => {
    if (isGoalReached) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isGoalReached]);

  const [eyeRestCountdown, setEyeRestCountdown] = useState(EYE_REST_INTERVAL_MS / 1000);
  const [eyeRestActive, setEyeRestActive] = useState(false);
  const [eyeRestTimer, setEyeRestTimer] = useState(20); // 20 second active timer
  const eyeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eyeActiveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayEyeRests = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return eyeRestLogs.filter((l) => new Date(l.completedAt) >= todayStart).length;
  }, [eyeRestLogs, currentDay]);

  const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'year'>('week');

  const chartData = useMemo(() => {
    const data = [];
    if (chartFilter === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        const dayTotal = waterEntries.filter(e => {
          const logDate = new Date(e.loggedAt);
          return logDate >= d && logDate < nextD;
        }).reduce((sum, e) => sum + e.amountMl, 0);
        data.push({ label: d.toLocaleDateString([], { weekday: 'short' })[0], value: dayTotal, fullDate: d.toDateString() });
      }
    } else if (chartFilter === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        const weekTotal = waterEntries.filter(e => {
          const logDate = new Date(e.loggedAt);
          const diff = (new Date().getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= (i * 7) && diff < ((i + 1) * 7);
        }).reduce((sum, e) => sum + e.amountMl, 0);
        data.push({ label: `W${4-i}`, value: weekTotal / 7, fullDate: '' }); // Average per day
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthTotal = waterEntries.filter(e => {
          const logDate = new Date(e.loggedAt);
          return logDate.getMonth() === d.getMonth() && logDate.getFullYear() === d.getFullYear();
        }).reduce((sum, e) => sum + e.amountMl, 0);
        data.push({ label: d.toLocaleDateString([], { month: 'short' })[0], value: monthTotal / 30, fullDate: '' });
      }
    }
    return data;
  }, [waterEntries, currentDay, chartFilter]);

  const startEyeRestCycle = useCallback(() => {
    if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
    let countdown = EYE_REST_INTERVAL_MS / 1000;
    setEyeRestCountdown(countdown);

    eyeIntervalRef.current = setInterval(() => {
      countdown -= 1;
      setEyeRestCountdown(countdown);
      if (countdown <= 0) {
        if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setEyeRestActive(true);
        setEyeRestTimer(20);
        let active = 20;
        eyeActiveRef.current = setInterval(() => {
          active -= 1;
          setEyeRestTimer(active);
          if (active <= 0) {
            if (eyeActiveRef.current) clearInterval(eyeActiveRef.current);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logEyeRest();
            setEyeRestActive(false);
            startEyeRestCycle();
          }
        }, 1000);
      }
    }, 1000);
  }, [logEyeRest]);

  const handleManualEyeRest = () => {
    if (!eyeRestActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
      setEyeRestActive(true);
      setEyeRestTimer(20);
      let active = 20;
      eyeActiveRef.current = setInterval(() => {
        active -= 1;
        setEyeRestTimer(active);
        if (active <= 0) {
          if (eyeActiveRef.current) clearInterval(eyeActiveRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logEyeRest();
          setEyeRestActive(false);
          startEyeRestCycle();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    startEyeRestCycle();
    return () => {
      if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
      if (eyeActiveRef.current) clearInterval(eyeActiveRef.current);
    };
  }, [startEyeRestCycle]);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatMl = (ml: number) => {
    if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`;
    return `${ml}ml`;
  };

  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={palette.backgroundTop} />
      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.primaryGlow}
        secondaryGlow={palette.secondaryGlow}
        accentGlow={palette.accentGlow}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Wellness</Text>
            <View style={styles.topIconButton}>
              <Ionicons name="settings-outline" size={20} color={palette.text} />
            </View>
          </View>

          {/* ── Hydration Card ── */}
          <View style={[styles.sectionCard, isGoalReached && styles.cardSuccess]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, isGoalReached && { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name={isGoalReached ? "checkmark-circle" : "water"} size={24} color={isGoalReached ? '#10b981' : palette.blue} />
              </View>
              <View style={styles.cardHeaderMain}>
                <Text style={styles.cardTitle}>Hydration</Text>
                {isEditingGoal ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                      style={styles.goalInput}
                      value={goalInput}
                      onChangeText={setGoalInput}
                      keyboardType="number-pad"
                      autoFocus
                      onBlur={handleUpdateGoal}
                      onSubmitEditing={handleUpdateGoal}
                    />
                    <Text style={styles.cardMeta}>ml goal</Text>
                  </View>
                ) : (
                  <View>
                    <Pressable onPress={() => { setIsEditingGoal(true); setGoalInput(waterGoalMl.toString()); }}>
                      <Text style={styles.cardMeta}>{formatMl(totalWaterToday)} of {formatMl(waterGoalMl)} goal</Text>
                    </Pressable>
                    {isGoalReached && (
                      <View style={styles.successBadge}>
                        <Ionicons name="trophy" size={12} color="#ffffff" />
                        <Text style={styles.successBadgeText}>Goal Reached!</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <Text style={[styles.cardPercent, isGoalReached && { color: '#10b981' }]}>{progressPercent}%</Text>
            </View>

            <View style={styles.waterTrack}>
              <Animated.View 
                style={[
                  styles.waterFill, 
                  { 
                    width: hydrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) 
                  }
                ]} 
              />
            </View>

            <View style={styles.waterPresets}>
              {WATER_PRESETS_ML.map((ml) => (
                <Pressable key={ml} onPress={() => handleLogWater(ml)} style={styles.waterChip}>
                  <Text style={styles.waterChipText}>+ {ml}ml</Text>
                </Pressable>
              ))}
            </View>

            {/* Recent History */}
            {waterEntries.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Recent Logs</Text>
                {waterEntries.slice(0, 3).map((entry) => (
                  <View key={entry.id} style={styles.logRow}>
                    <View style={styles.logIconWrap}>
                      <Ionicons name="water" size={16} color={palette.blue} />
                    </View>
                    <View style={styles.logInfo}>
                      <Text style={styles.logAmount}>+ {entry.amountMl}ml</Text>
                      <Text style={styles.logTime}>
                        {new Date(entry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Pressable 
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        deleteWaterEntry(entry.id);
                      }} 
                      style={styles.logDelete}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Eye Rest Card ── */}
          <Pressable 
            onPress={handleManualEyeRest}
            style={[styles.sectionCard, eyeRestActive && styles.sectionCardAlert]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: palette.greenSoft }]}>
                <Ionicons name="eye" size={24} color={palette.green} />
              </View>
              <View style={styles.cardHeaderMain}>
                <Text style={styles.cardTitle}>20-20-20 Eye Rest</Text>
                <Text style={styles.cardMeta}>{todayEyeRests} rests completed today</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.textSoft} style={styles.eyeChevron} />
            </View>
                  
            {eyeRestActive ? (
              <View style={styles.eyeActiveCard}>
                <Text style={styles.eyeActiveTitle}>Look 20 feet away</Text>
                <View style={styles.eyeTimerShell}>
                   <Svg width="100" height="100" viewBox="0 0 100 100">
                      <Circle
                        cx="50"
                        cy="50"
                        r="44"
                        stroke={palette.surfaceSoft}
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <Circle
                        cx="50"
                        cy="50"
                        r="44"
                        stroke={palette.green}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={276}
                        strokeDashoffset={276 * (1 - eyeRestTimer / 20)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                   </Svg>
                   <Text style={styles.eyeActiveTimer}>{eyeRestTimer}s</Text>
                </View>
                <Text style={styles.eyeActiveDesc}>Focus on something far away to relax your eyes</Text>
              </View>
            ) : (
              <View style={styles.eyeNextRow}>
                <Ionicons name="time-outline" size={16} color={palette.green} />
                <Text style={styles.eyeNextText}>Next reminder in</Text>
                <Text style={styles.eyeNextValue}>{formatCountdown(eyeRestCountdown)}</Text>
              </View>
            )}
          </Pressable>

          {/* ── Stand & Stretch Illustration Card ── */}
          <View style={styles.standCard}>
            <View style={styles.standContent}>
              <Text style={styles.standTitle}>Stand and stretch</Text>
              <Text style={styles.standDesc}>
                every 45 minutes for better circulation and focus.
              </Text>
            </View>
            <View style={styles.standImageWrap}>
               <View style={{ position: 'absolute', right: -20, bottom: -10, opacity: 0.2 }}>
                  <Ionicons name="body" size={180} color={palette.blue} />
               </View>
               <View style={{ flex: 1, backgroundColor: palette.blueSoft, borderTopLeftRadius: 100, borderBottomLeftRadius: 20 }} />
            </View>
          </View>

          {/* ── Activity Insights Chart ── */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
               <View>
                  <Text style={styles.chartTitle}>Activity Insights</Text>
                  <Text style={styles.chartSub}>Hydration tracking</Text>
               </View>
               <Ionicons name="stats-chart" size={18} color={palette.blue} />
            </View>

            <View style={styles.chartTabs}>
              {(['week', 'month', 'year'] as const).map((tab) => (
                <Pressable 
                  key={tab} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChartFilter(tab);
                  }}
                  style={[styles.chartTab, chartFilter === tab && styles.chartTabActive]}
                >
                  <Text style={[styles.chartTabText, chartFilter === tab && styles.chartTabTextActive]}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.chartBody}>
              <View style={styles.chartGrid}>
                <View style={styles.chartGridLine} />
                <View style={styles.chartGridLine} />
                <View style={styles.chartGridLine} />
              </View>
              <View style={styles.chartBars}>
                {chartData.map((day, idx) => {
                  const isToday = day.fullDate === currentDay;
                  // If month/year, use average goal or scaled value
                  const barHeight = Math.min((day.value / waterGoalMl) * 100, 100);
                  return (
                    <View key={idx} style={styles.chartBarWrap}>
                      <View 
                        style={[
                          styles.chartBar, 
                          { 
                            height: Math.max(barHeight, 6),
                            width: chartFilter === 'year' ? 10 : 14 
                          },
                          isToday && styles.chartBarActive
                        ]} 
                      />
                      <Text style={[styles.chartLabel, isToday && { color: palette.text, fontWeight: '900' }]}>
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── Today's Summary Grid ── */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                 <View style={[styles.summaryIcon, { backgroundColor: palette.blueSoft }]}>
                    <Ionicons name="water-outline" size={20} color={palette.blue} />
                 </View>
                 <Text style={styles.summaryValue}>{formatMl(totalWaterToday)}</Text>
                 <Text style={styles.summaryLabel}>Water Intake</Text>
              </View>
              <View style={styles.summaryCard}>
                 <View style={[styles.summaryIcon, { backgroundColor: palette.greenSoft }]}>
                    <Ionicons name="eye-outline" size={20} color={palette.green} />
                 </View>
                 <Text style={styles.summaryValue}>{todayEyeRests}</Text>
                 <Text style={styles.summaryLabel}>Eye Rests</Text>
              </View>
            </View>
          </View>

          {/* ── Motivation Card ── */}
          <View style={styles.motivationCard}>
             <View style={[styles.motivationIcon, { backgroundColor: palette.blueSoft }]}>
                <Ionicons name="heart" size={22} color={palette.blue} />
             </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.motivationTitle}>Keep going!</Text>
                <Text style={styles.motivationSub}>Small steps today, big changes tomorrow.</Text>
             </View>
             <Ionicons name="chevron-forward" size={18} color={palette.textSoft} style={{ opacity: 0.3 }} />
          </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
