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
import { useVitalsStore, WATER_PRESETS_ML, computeTodayWater } from '../stores/useVitalsStore';
import { spacing } from '../theme/tokens';
import {
  createVitalsStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/VitalsScreen.styles';

const EYE_REST_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

export function VitalsScreen() {
  const { mode } = useAppTheme();
  const navigation = useNavigation<any>();

  const waterGoalMl = useVitalsStore((s) => s.waterGoalMl);
  const waterEntries = useVitalsStore((s) => s.waterEntries);
  const eyeRestLogs = useVitalsStore((s) => s.eyeRestLogs);
  const logWater = useVitalsStore((s) => s.logWater);
  const logEyeRest = useVitalsStore((s) => s.logEyeRest);

  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
    [mode]
  );
  const styles = useMemo(() => createVitalsStyles(palette), [palette]);

  const totalWaterToday = useMemo(() => computeTodayWater(waterEntries), [waterEntries]);
  const waterProgress = Math.min(totalWaterToday / waterGoalMl, 1);
  const progressPercent = Math.round(waterProgress * 100);

  const [eyeRestCountdown, setEyeRestCountdown] = useState(EYE_REST_INTERVAL_MS / 1000);
  const [eyeRestActive, setEyeRestActive] = useState(false);
  const [eyeRestTimer, setEyeRestTimer] = useState(20); // 20 second active timer
  const eyeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eyeActiveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayEyeRests = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return eyeRestLogs.filter((l) => new Date(l.completedAt) >= todayStart).length;
  }, [eyeRestLogs]);

  const startEyeRestCycle = useCallback(() => {
    if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
    let countdown = EYE_REST_INTERVAL_MS / 1000;
    setEyeRestCountdown(countdown);

    eyeIntervalRef.current = setInterval(() => {
      countdown -= 1;
      setEyeRestCountdown(countdown);
      if (countdown <= 0) {
        if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
        setEyeRestActive(true);
        setEyeRestTimer(20);
        let active = 20;
        eyeActiveRef.current = setInterval(() => {
          active -= 1;
          setEyeRestTimer(active);
          if (active <= 0) {
            if (eyeActiveRef.current) clearInterval(eyeActiveRef.current);
            logEyeRest();
            setEyeRestActive(false);
            startEyeRestCycle();
          }
        }, 1000);
      }
    }, 1000);
  }, [logEyeRest]);

  useEffect(() => {
    startEyeRestCycle();
    return () => {
      if (eyeIntervalRef.current) clearInterval(eyeIntervalRef.current);
      if (eyeActiveRef.current) clearInterval(eyeActiveRef.current);
    };
  }, []);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
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
            <Text style={styles.topTitle}>Vitals</Text>
            <View style={styles.topIconButton} />
          </View>

          {/* Water section */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="water-outline" size={22} color={palette.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Hydration</Text>
                <Text style={styles.cardMeta}>{formatMl(totalWaterToday)} of {formatMl(waterGoalMl)} goal</Text>
              </View>
              <Text style={styles.cardPercent}>{progressPercent}%</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.waterTrack}>
              <View style={[styles.waterFill, { width: `${progressPercent}%` }]} />
            </View>

            {/* Quick log */}
            <View style={styles.waterPresets}>
              {WATER_PRESETS_ML.map((ml) => (
                <Pressable key={ml} onPress={() => logWater(ml)} style={styles.waterChip}>
                  <Ionicons name="add" size={14} color={palette.blue} />
                  <Text style={styles.waterChipText}>{ml}ml</Text>
                </Pressable>
              ))}
            </View>

            {/* Today's log */}
            {waterEntries.slice(0, 3).filter(e => {
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              return new Date(e.loggedAt) >= todayStart;
            }).map((entry) => (
              <View key={entry.id} style={styles.logRow}>
                <Ionicons name="water" size={14} color={palette.blue} />
                <Text style={styles.logText}>+{entry.amountMl}ml</Text>
                <Text style={styles.logTime}>
                  {new Date(entry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>

          {/* Eye rest section */}
          <View style={[styles.sectionCard, eyeRestActive && styles.sectionCardAlert]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: palette.greenSoft }]}>
                <Ionicons name="eye-outline" size={22} color={palette.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>20-20-20 Eye Rest</Text>
                <Text style={styles.cardMeta}>{todayEyeRests} rests completed today</Text>
              </View>
            </View>

            {eyeRestActive ? (
              <View style={styles.eyeActiveCard}>
                <Text style={styles.eyeActiveTitle}>Look 20 feet away</Text>
                <Text style={styles.eyeActiveTimer}>{eyeRestTimer}s</Text>
                <Text style={styles.eyeActiveDesc}>Focus on something far away to relax your eyes</Text>
              </View>
            ) : (
              <View style={styles.eyeCountdownRow}>
                <Ionicons name="timer-outline" size={16} color={palette.textSoft} />
                <Text style={styles.eyeCountdownText}>
                  Next reminder in {formatCountdown(eyeRestCountdown)}
                </Text>
              </View>
            )}
          </View>

          {/* Stand reminder note */}
          <View style={styles.tipCard}>
            <Ionicons name="body-outline" size={18} color={palette.accent} />
            <Text style={styles.tipText}>
              Stand and stretch every 45 minutes for better circulation and focus.
            </Text>
          </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
