import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAlarmStore, NAP_PRESETS, NapPreset } from '../stores/useAlarmStore';
import { spacing } from '../theme/tokens';
import {
  createAlarmStyles,
} from '../styles/AlarmScreen.styles';
import { ScreenPalette } from '../theme/screenPalettes';

export function AlarmScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('alarm'), [getPalette]);
  const styles = useMemo(() => createAlarmStyles(palette), [palette]);
  const navigation = useNavigation<any>();

  const addSession = useAlarmStore((s) => s.addSession);
  const completeSession = useAlarmStore((s) => s.completeSession);
  const cancelActiveSession = useAlarmStore((s) => s.cancelActiveSession);
  const activeSessionId = useAlarmStore((s) => s.activeSessionId);
  const isAlarmFiring = useAlarmStore((s) => s.isAlarmFiring);
  const setAlarmFiring = useAlarmStore((s) => s.setAlarmFiring);
  const sessions = useAlarmStore((s) => s.sessions);
  const totalNaps = useAlarmStore((s) => s.totalNapsTaken);

  const [selectedPreset, setSelectedPreset] = useState<NapPreset>('20min');
  const [customMinutes, setCustomMinutes] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId && !s.completedAt),
    [sessions, activeSessionId]
  );

  const getDurationMinutes = useCallback(() => {
    if (selectedPreset === 'custom') return Math.max(1, parseInt(customMinutes, 10) || 20);
    return NAP_PRESETS[selectedPreset].minutes;
  }, [selectedPreset, customMinutes]);

  const updateCustomMinutes = useCallback((value: string) => {
    setCustomMinutes(value.replace(/\D/g, '').slice(0, 3));
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const fireAlarm = useCallback(() => {
    setAlarmFiring(true);
    setIsRunning(false);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    pulse.start();
  }, [pulseAnim, setAlarmFiring]);

  const stopAlarm = useCallback(() => {
    setAlarmFiring(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim, setAlarmFiring]);

  const stopTimer = useCallback((completed: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    stopAlarm();

    if (activeSessionId) {
      if (completed) {
        completeSession(activeSessionId);
      } else {
        cancelActiveSession();
      }
    }
    setRemainingSeconds(0);
  }, [activeSessionId, progressAnim, completeSession, cancelActiveSession, stopAlarm]);

  const startTimer = useCallback(() => {
    const minutes = getDurationMinutes();
    
    const id = `nap-${Date.now()}`;
    addSession({
      id,
      preset: selectedPreset,
      durationMinutes: minutes,
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
    
    setAlarmFiring(false);
    // Timer setup happens in useEffect via store change
  }, [getDurationMinutes, addSession, selectedPreset, setAlarmFiring]);

  useEffect(() => {
    if (activeSession) {
      const start = new Date(activeSession.startedAt).getTime();
      const duration = activeSession.durationMinutes * 60 * 1000;
      const now = Date.now();
      const elapsed = now - start;
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));

      if (remaining <= 0) {
        if (!isAlarmFiring) fireAlarm();
        setRemainingSeconds(0);
        progressAnim.setValue(1);
      } else {
        setIsRunning(true);
        setRemainingSeconds(remaining);
        remainingRef.current = remaining;
        
        const totalDuration = activeSession.durationMinutes * 60;
        const progress = 1 - (remaining / totalDuration);
        progressAnim.setValue(progress);
        
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: remaining * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          remainingRef.current -= 1;
          setRemainingSeconds(remainingRef.current);

          if (remainingRef.current <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            fireAlarm();
          }
        }, 1000);
      }
    } else {
      setIsRunning(false);
      setRemainingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      if (isAlarmFiring) stopAlarm();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, fireAlarm, progressAnim, stopAlarm, isAlarmFiring]);

  const preset = NAP_PRESETS[selectedPreset];
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

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
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => { stopTimer(false); navigation.goBack(); }} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Power Nap</Text>
            <Pressable onPress={() => navigation.navigate('Insights')} style={styles.topIconButton}>
              <Ionicons name="settings-outline" size={20} color={palette.text} />
            </Pressable>
          </View>

          {/* Timer display */}
          <View style={styles.timerSection}>
            <Animated.View style={[styles.timerRing, { 
              transform: [{ scale: isAlarmFiring ? pulseAnim : 1 }],
              borderColor: isAlarmFiring ? palette.alarm : (mode === 'dark' ? `${palette.screenGlow}50` : `${palette.screenGlow}20`),
              shadowColor: isAlarmFiring ? palette.alarm : palette.screenGlow,
              shadowOpacity: (isRunning || isAlarmFiring) ? (mode === 'dark' ? 0.4 : 0.15) : 0,
              elevation: (isRunning || isAlarmFiring) ? 12 : 0,
            }]}>
              <View style={[styles.timerInner, isAlarmFiring && { borderColor: palette.alarm }]}>
                <Text style={styles.timerEmoji}>{preset.emoji}</Text>
                <Text style={[styles.timerDisplay, isAlarmFiring && { color: palette.alarm }]}>
                  {isRunning || isAlarmFiring ? formatTime(remainingSeconds) : formatTime(getDurationMinutes() * 60)}
                </Text>
                <Text style={styles.timerLabel}>
                  {isAlarmFiring ? 'Wake up!' : isRunning ? 'Napping...' : 'Set timer'}
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
          {!isRunning && !isAlarmFiring && (
            <View style={styles.presetsSection}>
              <Text style={styles.sectionLabel}>DURATION</Text>
              <View style={styles.presetsGrid}>
                {(Object.entries(NAP_PRESETS) as [NapPreset, typeof NAP_PRESETS[NapPreset]][]).map(([key, p]) => (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedPreset(key)}
                    style={[styles.presetCard, selectedPreset === key && styles.presetCardActive, {
                      borderColor: selectedPreset === key 
                        ? (mode === 'dark' ? `${palette.accent}50` : `${palette.accent}30`)
                        : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'),
                      shadowColor: palette.accent,
                      shadowOpacity: selectedPreset === key ? (mode === 'dark' ? 0.3 : 0.1) : 0,
                      shadowRadius: 15,
                      elevation: selectedPreset === key ? 6 : 0,
                      borderWidth: selectedPreset === key ? 1.5 : 1,
                      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
                    }]}
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
                    onChangeText={updateCustomMinutes}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="20"
                    placeholderTextColor={palette.textSoft}
                  />
                  <Text style={styles.customUnit}>minutes</Text>
                </View>
              )}

              <Text style={styles.benefitText}>{preset.benefit}</Text>
            </View>
          )}

          {/* CTA */}
          {isAlarmFiring ? (
            <Pressable onPress={() => stopTimer(true)} style={styles.dismissButton}>
              <Ionicons name="hand-right-outline" size={22} color="#ffffff" />
              <Text style={styles.dismissText}>Dismiss Alarm</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={isRunning ? () => stopTimer(false) : startTimer}
              style={[styles.ctaButton, isRunning && styles.ctaButtonStop]}
            >
              <Ionicons name={isRunning ? 'stop-outline' : 'moon-outline'} size={22} color={isRunning ? palette.red : '#ffffff'} />
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
