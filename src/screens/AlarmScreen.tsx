import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAlarmStore, NAP_PRESETS, NapPreset } from '../stores/useAlarmStore';
import { spacing } from '../theme/tokens';
import {
  createAlarmStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/AlarmScreen.styles';

export function AlarmScreen() {
  const { mode } = useAppTheme();
  const navigation = useNavigation<any>();
  const addSession = useAlarmStore((s) => s.addSession);
  const completeSession = useAlarmStore((s) => s.completeSession);
  const totalNaps = useAlarmStore((s) => s.totalNapsTaken);

  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
    [mode]
  );
  const styles = useMemo(() => createAlarmStyles(palette), [palette]);

  const [selectedPreset, setSelectedPreset] = useState<NapPreset>('20min');
  const [customMinutes, setCustomMinutes] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [alarmFiring, setAlarmFiring] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);
  const totalSecondsRef = useRef(0);

  const getDurationMinutes = useCallback(() => {
    if (selectedPreset === 'custom') return Math.max(1, parseInt(customMinutes, 10) || 20);
    return NAP_PRESETS[selectedPreset].minutes;
  }, [selectedPreset, customMinutes]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const fireAlarm = useCallback(() => {
    setAlarmFiring(true);
    Vibration.vibrate([0, 500, 200, 500, 200, 1000], true);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    pulse.start();
  }, [pulseAnim]);

  const stopAlarm = useCallback(() => {
    Vibration.cancel();
    setAlarmFiring(false);
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const stopTimer = useCallback((completed: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    progressAnim.setValue(0);
    stopAlarm();

    if (completed && sessionId) {
      completeSession(sessionId);
    }
    setSessionId(null);
    setRemainingSeconds(0);
  }, [sessionId, progressAnim, completeSession, stopAlarm]);

  const startTimer = useCallback(() => {
    const minutes = getDurationMinutes();
    const totalSecs = minutes * 60;
    totalSecondsRef.current = totalSecs;
    remainingRef.current = totalSecs;

    const id = `nap-${Date.now()}`;
    addSession({
      id,
      preset: selectedPreset,
      durationMinutes: minutes,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    setSessionId(id);
    setIsRunning(true);
    setRemainingSeconds(totalSecs);
    setAlarmFiring(false);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: totalSecs * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setRemainingSeconds(remainingRef.current);

      if (remainingRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);
        fireAlarm();
      }
    }, 1000);
  }, [getDurationMinutes, addSession, selectedPreset, progressAnim, fireAlarm]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Vibration.cancel();
    };
  }, []);

  const preset = NAP_PRESETS[selectedPreset];
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

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
            <Pressable onPress={() => { stopTimer(false); navigation.goBack(); }} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Rise Alert</Text>
            <View style={styles.topIconButton}>
              <Text style={styles.napCount}>{totalNaps} naps</Text>
            </View>
          </View>

          {/* Timer display */}
          <View style={styles.timerSection}>
            <Animated.View style={[styles.timerRing, { transform: [{ scale: alarmFiring ? pulseAnim : 1 }] }]}>
              <View style={[styles.timerInner, alarmFiring && { borderColor: palette.alarm }]}>
                <Text style={styles.timerEmoji}>{preset.emoji}</Text>
                <Text style={[styles.timerDisplay, alarmFiring && { color: palette.alarm }]}>
                  {isRunning || alarmFiring ? formatTime(remainingSeconds) : `${getDurationMinutes()}:00`}
                </Text>
                <Text style={styles.timerLabel}>
                  {alarmFiring ? 'Wake up!' : isRunning ? 'Napping...' : 'Set timer'}
                </Text>
              </View>
            </Animated.View>

            {/* Progress bar */}
            {isRunning && (
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
            )}
          </View>

          {/* Preset selector */}
          {!isRunning && !alarmFiring && (
            <View style={styles.presetsSection}>
              <Text style={styles.sectionLabel}>DURATION</Text>
              <View style={styles.presetsGrid}>
                {(Object.entries(NAP_PRESETS) as [NapPreset, typeof NAP_PRESETS[NapPreset]][]).map(([key, p]) => (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedPreset(key)}
                    style={[styles.presetCard, selectedPreset === key && styles.presetCardActive]}
                  >
                    <Text style={styles.presetEmoji}>{p.emoji}</Text>
                    <Text style={[styles.presetLabel, selectedPreset === key && styles.presetLabelActive]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>

              {selectedPreset === 'custom' && (
                <View style={styles.customRow}>
                  <TextInput
                    style={styles.customInput}
                    value={customMinutes}
                    onChangeText={setCustomMinutes}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholderTextColor={palette.textSoft}
                  />
                  <Text style={styles.customUnit}>minutes</Text>
                </View>
              )}

              <Text style={styles.benefitText}>{preset.benefit}</Text>
            </View>
          )}

          {/* CTA */}
          {alarmFiring ? (
            <Pressable onPress={stopAlarm} style={styles.dismissButton}>
              <Ionicons name="hand-right-outline" size={22} color={palette.backgroundTop} />
              <Text style={styles.dismissText}>Dismiss Alarm</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={isRunning ? () => stopTimer(false) : startTimer}
              style={[styles.ctaButton, isRunning && styles.ctaButtonStop]}
            >
              <Ionicons name={isRunning ? 'stop-outline' : 'moon-outline'} size={22} color={isRunning ? palette.red : palette.backgroundTop} />
              <Text style={[styles.ctaText, isRunning && styles.ctaTextStop]}>
                {isRunning ? 'Cancel nap' : 'Start nap timer'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
