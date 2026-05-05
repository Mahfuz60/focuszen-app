import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Path, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useBreatheStore, BREATHE_PATTERNS, BreathePattern, BreathePhase } from '../stores/useBreatheStore';
import { spacing } from '../theme/tokens';
import {
  createBreatheStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from "../styles/BreatheScreen.styles"

const customPhases: { key: BreathePhase; label: string }[] = [
  { key: 'inhale', label: 'Inhale' },
  { key: 'hold', label: 'Hold' },
  { key: 'exhale', label: 'Exhale' },
  { key: 'hold2', label: 'Hold 2' },
];

export function BreatheScreen() {
  const { mode } = useAppTheme();
  const navigation = useNavigation<any>();
  const addSession = useBreatheStore((s) => s.addSession);
  const totalCompleted = useBreatheStore((s) => s.totalSessionsCompleted);
  const customPattern = useBreatheStore((s) => s.customPattern);
  const setCustomPattern = useBreatheStore((s) => s.setCustomPattern);

  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
    [mode]
  );
  const styles = useMemo(() => createBreatheStyles(palette), [palette]);

  const [selectedPattern, setSelectedPattern] = useState<BreathePattern>('box');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathePhase>('inhale');
  const [phaseCountdown, setPhaseCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [customDraft, setCustomDraft] = useState(customPattern);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<BreathePhase>('inhale');
  const countdownRef = useRef(0);
  const cycleRef = useRef(0);
  const startRef = useRef<string | null>(null);

  const pattern = selectedPattern === 'custom' ? customPattern : BREATHE_PATTERNS[selectedPattern];
  const customDraftChanged = customDraft.inhale !== customPattern.inhale
    || customDraft.hold !== customPattern.hold
    || customDraft.exhale !== customPattern.exhale
    || customDraft.hold2 !== customPattern.hold2;

  const phaseLabels: Record<BreathePhase, string> = {
    inhale: 'Inhale',
    hold: 'Hold',
    exhale: 'Exhale',
    hold2: 'Hold',
  };

  const phaseDurations: BreathePhase[] = useMemo(() => {
    const phases: BreathePhase[] = ['inhale'];
    if (pattern.hold > 0) phases.push('hold');
    phases.push('exhale');
    if (pattern.hold2 > 0) phases.push('hold2');
    return phases;
  }, [pattern]);

  const getDuration = useCallback(
    (p: BreathePhase) => {
      if (p === 'inhale') return pattern.inhale;
      if (p === 'hold') return pattern.hold;
      if (p === 'exhale') return pattern.exhale;
      return pattern.hold2;
    },
    [pattern]
  );

  useEffect(() => {
    setCustomDraft(customPattern);
  }, [customPattern]);

  const updateCustomDuration = useCallback(
    (key: BreathePhase, delta: number) => {
      setCustomDraft((draft) => {
        const min = key === 'hold' || key === 'hold2' ? 0 : 1;
        const next = Math.max(min, Math.min(30, draft[key] + delta));
        return { ...draft, [key]: next };
      });
    },
    []
  );

  const animateForPhase = useCallback(
    (p: BreathePhase) => {
      const dur = getDuration(p) * 1000;
      if (p === 'inhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: dur, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: dur, useNativeDriver: true }),
        ]).start();
      } else if (p === 'exhale') {
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 0.6, duration: dur, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: dur, useNativeDriver: true }),
        ]).start();
      }
      
      // Infinite rotation while running
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    },
    [getDuration, scaleAnim, opacityAnim, rotateAnim]
  );

  const stopSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase('inhale');
    setPhaseCountdown(0);
    setCycleCount(0);
    scaleAnim.setValue(0.6);
    opacityAnim.setValue(0.5);

    if (startRef.current && cycleRef.current > 0) {
      addSession({
        id: `breathe-${Date.now()}`,
        pattern: selectedPattern,
        durationSeconds: Math.floor((Date.now() - new Date(startRef.current).getTime()) / 1000),
        completedAt: new Date().toISOString(),
      });
    }
    startRef.current = null;
  }, [addSession, selectedPattern, scaleAnim, opacityAnim]);

  const startSession = useCallback(() => {
    const now = new Date().toISOString();
    startRef.current = now;
    setSessionStart(now);
    cycleRef.current = 0;
    phaseRef.current = 'inhale';
    countdownRef.current = getDuration('inhale');
    setPhase('inhale');
    setPhaseCountdown(getDuration('inhale'));
    setCycleCount(0);
    setIsRunning(true);
    animateForPhase('inhale');

    timerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      setPhaseCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        const currentPhase = phaseRef.current;
        const idx = phaseDurations.indexOf(currentPhase);
        const nextIdx = (idx + 1) % phaseDurations.length;
        const nextPhase = phaseDurations[nextIdx];

        if (nextIdx === 0) {
          cycleRef.current += 1;
          setCycleCount(cycleRef.current);
        }

        phaseRef.current = nextPhase;
        countdownRef.current = getDuration(nextPhase);
        setPhase(nextPhase);
        setPhaseCountdown(countdownRef.current);
        animateForPhase(nextPhase);
      }
    }, 1000);
  }, [getDuration, phaseDurations, animateForPhase]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

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
            <Pressable onPress={() => { stopSession(); navigation.goBack(); }} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Breathe</Text>
            <View style={styles.topIconButton}>
              <Ionicons name="stats-chart-outline" size={20} color={palette.textSoft} />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Feather name="clock" size={16} color={palette.accent} />
              <Text style={styles.statText}>{totalCompleted} sessions</Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="refresh-cw" size={16} color={palette.accent} />
              <Text style={styles.statText}>{cycleCount} cycles</Text>
            </View>
          </View>

          {/* Breathing ring */}
          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              {/* Decorative Leaves */}
              <View style={styles.leafContainer} pointerEvents="none">
                <Ionicons name="leaf" size={24} color="#4ade80" style={[styles.leaf, { top: -20, left: 40, transform: [{ rotate: '-45deg' }] }]} />
                <Ionicons name="leaf" size={20} color="#a78bfa" style={[styles.leaf, { bottom: 20, left: -10, transform: [{ rotate: '30deg' }] }]} />
                <Ionicons name="leaf" size={22} color="#4ade80" style={[styles.leaf, { top: 40, right: -20, transform: [{ rotate: '120deg' }] }]} />
              </View>

              {/* Decorative SVG Glow Ring */}
              <Svg width={280} height={280} style={{ position: 'absolute' }}>
                <Defs>
                  <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={palette.accent} stopOpacity={0.5} />
                    <Stop offset="1" stopColor="#7c3aed" stopOpacity={0.28} />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx={140} cy={140} r={133}
                  stroke="url(#ringGrad)"
                  strokeWidth={2}
                  fill="none"
                  opacity={0.9}
                />
                <Circle
                  cx={140} cy={140} r={125}
                  stroke={palette.accent}
                  strokeWidth={1.2}
                  fill="none"
                  opacity={0.28}
                  strokeDasharray="5 8"
                />
              </Svg>

              <Animated.View
                style={[
                  styles.ringInner,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              />

              {/* Progress Dot */}
              <Animated.View style={[styles.progressDotOrbit, { transform: [{ rotate: rotation }] }]}>
                <Svg width={20} height={20} style={styles.progressDot}>
                  <Circle cx={10} cy={10} r={8} fill={palette.ringDot} />
                </Svg>
              </Animated.View>
              
              <View style={styles.ringCore}>
                {!isRunning && (
                  <Svg width={50} height={50} viewBox="0 0 24 24" style={styles.lungsIcon}>
                    <Path
                      d="M11,4.24V10.24M13,4.24V10.24M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                      fill="none"
                      stroke={palette.accent}
                      strokeWidth="1.5"
                      opacity={0.3}
                    />
                    <Path
                      d="M12,4C9,4 6.5,5.5 5,8C3.5,10.5 3.5,13.5 5,16C6.5,18.5 9,20 12,20C15,20 17.5,18.5 19,16C20.5,13.5 20.5,10.5 19,8C17.5,5.5 15,4 12,4M12,18C10,18 8.5,17 7.5,15.5C6.5,14 6.5,12 7.5,10.5C8.5,9 10,8 12,8C14,8 15.5,9 16.5,10.5C17.5,12 17.5,14 16.5,15.5C15.5,17 14,18 12,18Z"
                      fill={palette.accent}
                    />
                  </Svg>
                )}
                <Text style={styles.phaseLabel}>
                  {isRunning ? phaseLabels[phase] : 'Ready'}
                </Text>
                {!isRunning && (
                  <Text style={styles.phaseSub}>Take a deep breath and relax</Text>
                )}
                {isRunning && (
                  <View style={{ width: 120, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width="120" height="100" viewBox="0 0 120 100">
                      <Defs>
                        <SvgLinearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={palette.accent} stopOpacity={1} />
                          <Stop offset="1" stopColor="#7c3aed" stopOpacity={1} />
                        </SvgLinearGradient>
                      </Defs>
                      <SvgText
                        fill="url(#timeGrad)"
                        fontSize="76"
                        fontWeight="900"
                        x="60"
                        y="78"
                        textAnchor="middle"
                      >
                        {String(phaseCountdown)}
                      </SvgText>
                    </Svg>
                  </View>
                )}
              </View>

              {/* Floating Action Button */}
              <Pressable
                onPress={isRunning ? stopSession : startSession}
                style={[styles.floatingAction, isRunning && styles.floatingActionRunning]}
              >
                <Ionicons 
                  name={isRunning ? "power" : "play"} 
                  size={32} 
                  color="#ffffff" 
                />
              </Pressable>
            </View>
          </View>

          <View style={[styles.readyTechnique, {
            borderColor: mode === 'dark' ? `${palette.accent}40` : `${palette.accent}15`,
            shadowColor: palette.accent,
            shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
            borderWidth: 1.5,
          }]}>
            <View style={styles.readyTechniqueHeader}>
              <Feather name="wind" size={16} color={palette.accent} />
              <Text style={styles.readyTechniqueLabel}>{pattern.label}</Text>
            </View>
            <Text style={styles.readyTechniqueRhythm}>
              {pattern.inhale}-{pattern.hold}-{pattern.exhale}{pattern.hold2 > 0 ? `-${pattern.hold2}` : ''}
            </Text>
            <Text style={styles.readyTechniqueDesc}>{pattern.description}</Text>
          </View>
 
          {/* Pattern selector */}
          {!isRunning && (
            <View style={styles.patternsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionLabel}>TECHNIQUE</Text>
              </View>
 
              <View style={styles.patternsGrid}>
                {Object.entries(BREATHE_PATTERNS).map(([key, p]) => {
                  const displayPattern = key === 'custom' && selectedPattern === 'custom' ? customDraft : p;
                  const icons: Record<string, any> = {
                    box: { icon: 'wind', colors: ['#38bdf8', '#818cf8'] },
                    '478': { icon: 'activity', colors: ['#34d399', '#3b82f6'] },
                    sigh: { icon: 'heart', colors: ['#f472b6', '#7c3aed'] },
                    custom: { icon: 'sliders', colors: ['#fbbf24', '#f87171'] },
                  };
                  const config = icons[key] || icons.box;
                  
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        setSelectedPattern(key as BreathePattern);
                        setIsCustomEditorOpen(key === 'custom');
                      }}
                      style={[styles.patternCard, selectedPattern === key && styles.patternCardActive, {
                        borderColor: selectedPattern === key 
                          ? (mode === 'dark' ? `${config.colors[0]}50` : `${config.colors[0]}30`)
                          : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'),
                        shadowColor: config.colors[0],
                        shadowOpacity: selectedPattern === key ? (mode === 'dark' ? 0.3 : 0.1) : 0,
                        shadowRadius: 15,
                        elevation: selectedPattern === key ? 6 : 0,
                        borderWidth: selectedPattern === key ? 1.5 : 1,
                        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
                      }]}
                    >
                      {/* Left Side Accent Glow */}
                      <LinearGradient
                        colors={[config.colors[0] + '40', 'rgba(0,0,0,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.patternSideGlow}
                      />
 
                      <LinearGradient
                        colors={config.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.patternIconWrap}
                      >
                        <Feather name={config.icon} size={28} color="#ffffff" />
                      </LinearGradient>
                      
                      <View style={styles.patternInfo}>
                        <Text style={[styles.patternName, selectedPattern === key && styles.patternNameActive]}>
                          {displayPattern.label}
                        </Text>
                        <Text style={styles.patternRhythm}>
                          {displayPattern.inhale}-{displayPattern.hold}-{displayPattern.exhale}{displayPattern.hold2 > 0 ? `-${displayPattern.hold2}` : ''}
                        </Text>
                        {selectedPattern === key && (
                          <Text style={styles.patternDesc}>{displayPattern.description}</Text>
                        )}
                        {selectedPattern === key && key === 'custom' && isCustomEditorOpen && (
                          <View style={styles.customEditor}>
                            {customPhases.map((item) => (
                              <View key={item.key} style={styles.customRow}>
                                <Text style={styles.customLabel}>{item.label}</Text>
                                <View style={styles.customStepper}>
                                  <Pressable onPress={() => updateCustomDuration(item.key, -1)} style={styles.customStepButton}>
                                    <Feather name="minus" size={16} color={palette.text} />
                                  </Pressable>
                                  <Text style={styles.customValue}>{customDraft[item.key]}s</Text>
                                  <Pressable onPress={() => updateCustomDuration(item.key, 1)} style={styles.customStepButton}>
                                    <Feather name="plus" size={16} color={palette.text} />
                                  </Pressable>
                                </View>
                              </View>
                            ))}
                            <Pressable
                              disabled={!customDraftChanged}
                              onPress={() => {
                                setCustomPattern(customDraft);
                                setIsCustomEditorOpen(false);
                              }}
                              style={[styles.customApply, !customDraftChanged && styles.customApplyDisabled]}
                            >
                              <Text style={styles.customApplyText}>Apply</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                      <Feather name="chevron-right" size={22} color={palette.textSoft} />
                    </Pressable>
                  );
                })}
              </View>
 
              {/* Tip Card */}
              <View style={[styles.tipCard, {
                borderColor: mode === 'dark' ? `${palette.accent}30` : `${palette.accent}12`,
                shadowColor: palette.accent,
                shadowOpacity: mode === 'dark' ? 0.2 : 0.05,
                shadowRadius: 15,
                elevation: 4,
                borderWidth: 1,
                backgroundColor: mode === 'dark' ? 'rgba(124,58,237,0.05)' : '#ffffff',
              }]}>
                <Ionicons name="information-circle-outline" size={24} color={palette.accent} />
                <Text style={styles.tipText}>
                  {pattern.description}
                </Text>
              </View>
            </View>
          )}

       
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
