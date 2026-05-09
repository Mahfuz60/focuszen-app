import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { GradientBorderCard } from '../components/GradientBorderCard';
import { useAppTheme } from '../hooks/useAppTheme';
import { 
  useBodyCareStore, 
  EyeRestLog
} from '../stores/useBodyCareStore';
import {
  createEyeWellnessStyles,
} from '../styles/EyeWellnessScreen.styles';
import { ScreenPalette } from '../theme/screenPalettes';

const EYE_EXERCISES: { id: EyeRestLog['type']; title: string; desc: string; duration: string; icon: string; color: string }[] = [
  { id: '20-20-20', title: '20-20-20 Rule', desc: 'Look 20ft away for 20s', duration: '20s', icon: 'eye', color: '#10b981' },
  { id: 'rapid-blink', title: 'Rapid Blink', desc: 'Re-moisten eyes quickly', duration: '15s', icon: 'flash', color: '#fbbf24' },
  { id: 'palming', title: 'Palming', desc: 'Relax eyes in darkness', duration: '30s', icon: 'hand-left', color: '#a78bfa' },
  { id: 'figure-8', title: 'Figure-8 Focus', desc: 'Trace infinity with eyes', duration: '30s', icon: 'infinite', color: '#38bdf8' },
  { id: 'near-far', title: 'Near-Far Focus', desc: 'Alternate depth focus', duration: '30s', icon: 'expand', color: '#ef4444' },
];

function EyeIcon({ color }: { color: string }) {
  return (
    <Svg width="120" height="80" viewBox="0 0 120 80">
      <Path
        d="M10,40 Q60,0 110,40 Q60,80 10,40 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <Circle cx="60" cy="40" r="22" stroke={color} strokeWidth="3" fill="none" />
      <Circle cx="60" cy="40" r="12" fill={color} />
      <Circle cx="64" cy="36" r="3" fill="#ffffff" />
    </Svg>
  );
}

export function EyeWellnessScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('eyeWellness'), [getPalette]);
  const styles = useMemo(() => createEyeWellnessStyles(palette), [palette]);
  const navigation = useNavigation<any>();

  const eyeRestLogs = useBodyCareStore((s) => s.eyeRestLogs);
  const logEyeRest = useBodyCareStore((s) => s.logEyeRest);

  const [activeExercise, setActiveExercise] = useState<typeof EYE_EXERCISES[0] | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Next break logic (20 min interval)
  const [nextBreakSeconds, setNextBreakSeconds] = useState(1200); // 20 min
  useEffect(() => {
    const int = setInterval(() => {
      setNextBreakSeconds((prev) => (prev <= 0 ? 1200 : prev - 1));
    }, 1000);
    return () => clearInterval(int);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startExercise = (ex: typeof EYE_EXERCISES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setActiveExercise(ex);
    const duration = parseInt(ex.duration);
    setExerciseTimer(duration);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExerciseTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logEyeRest(ex.id);
          setActiveExercise(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const todayLogs = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    return (eyeRestLogs || []).filter(l => new Date(l.completedAt) >= todayStart);
  }, [eyeRestLogs]);

  const totalMinutes = useMemo(() => {
    return todayLogs.reduce((sum, log) => {
      const ex = EYE_EXERCISES.find(e => e.id === log.type);
      return sum + (ex ? parseInt(ex.duration) / 60 : 0);
    }, 0).toFixed(0);
  }, [todayLogs]);

  const backdropColors = useMemo(() => 
    [palette.background, mode === 'dark' ? '#080d1a' : '#f0f9ff'] as const, 
  [palette.background, mode]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <AnimatedThemeBackdrop
        colors={backdropColors}
        mode={mode}
        primaryGlow={palette.primaryGlow}
        secondaryGlow={palette.primaryGlow}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
                <Ionicons name="arrow-back" size={24} color={palette.text} />
              </Pressable>
              <View>
                <Text style={styles.title}>Eye Care</Text>
                <Text style={styles.subtitle}>
                  Take care of your eyes, <Text style={styles.subtitleAccent}>every day.</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Hero Timer Area */}
          <View style={styles.heroArea}>
             <View style={styles.timerRing}>
                <Svg width="280" height="280" viewBox="0 0 100 100">
                  <Circle cx="50" cy="50" r="45" stroke={palette.stroke} strokeWidth="1" fill="none" />
                  <Circle
                    cx="50" cy="50" r="45"
                    stroke={palette.accentGreen}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={283}
                    strokeDashoffset={283 * (1 - nextBreakSeconds / 1200)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Glowing dots or effects can be added here */}
                </Svg>
                <View style={styles.timerContent}>
                   <Text style={styles.timerLabel}>Next break in</Text>
                   <Text style={styles.timerValue}>{formatTime(nextBreakSeconds)}</Text>
                   <Text style={styles.timerUnit}>min</Text>
                   <View style={styles.eyeIconContainer}>
                      <EyeIcon color={palette.accentGreen} />
                   </View>
                </View>
             </View>

             <View style={styles.startBtnWrap}>
                <Pressable onPress={() => startExercise(EYE_EXERCISES[0])} style={styles.startBtn}>
                   <Ionicons name="play" size={40} color="#000" style={{ marginLeft: 6 }} />
                   <Text style={styles.startBtnText}>START</Text>
                </Pressable>
                <Text style={styles.annotationText}>Start your eye care{"\n"}session now</Text>
             </View>
          </View>

          {/* Stats Bar */}
          <GradientBorderCard
            colors={['rgba(56, 189, 248, 0.45)', 'rgba(148, 163, 184, 0.1)']}
            style={{ marginVertical: 16 }}
            innerStyle={styles.statsBar}
          >
             <View style={styles.statItem}>
                <View style={styles.statIcon}>
                   <Ionicons name="checkmark-circle-outline" size={20} color={palette.accentGreen} />
                </View>
                <Text style={styles.statVal}>{todayLogs.length}</Text>
                <Text style={styles.statLab}>Completed</Text>
             </View>
             <View style={styles.statItem}>
                <View style={styles.statIcon}>
                   <MaterialCommunityIcons name="target" size={20} color={palette.accentYellow} />
                </View>
                <Text style={styles.statVal}>10</Text>
                <Text style={styles.statLab}>Daily Goal</Text>
             </View>
             <View style={styles.statItem}>
                <View style={styles.statIcon}>
                   <Ionicons name="flame-outline" size={20} color="#ef4444" />
                </View>
                <Text style={styles.statVal}>4</Text>
                <Text style={styles.statLab}>Day Streak</Text>
             </View>
             <View style={styles.statItem}>
                <View style={styles.statIcon}>
                   <Ionicons name="time-outline" size={20} color={palette.accentPurple} />
                </View>
                <Text style={styles.statVal}>{totalMinutes}</Text>
                <Text style={styles.statLab}>Total min</Text>
             </View>
          </GradientBorderCard>


          {/* Recommended Exercises */}
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Recommended Exercises</Text>
          </View>
          <GradientBorderCard colors={['rgba(56, 189, 248, 0.35)', 'rgba(148, 163, 184, 0.1)']} innerStyle={styles.listCard}>
             {EYE_EXERCISES.map((ex, idx) => (
               <Pressable 
                 key={ex.id} 
                 onPress={() => startExercise(ex)}
                 style={[styles.listItem, idx === EYE_EXERCISES.length - 1 && styles.listItemNoBorder]}
               >
                  <View style={[styles.listIconWrap, { backgroundColor: `${ex.color}20` }]}>
                     <Ionicons name={ex.icon as any} size={24} color={ex.color} />
                  </View>
                  <View style={styles.listContent}>
                     <Text style={styles.listTitle}>{ex.title}</Text>
                     <Text style={styles.listSub}>{ex.desc}</Text>
                  </View>
                  <View style={styles.listBadge}>
                     <Text style={styles.listBadgeText}>{ex.duration}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.textDim} />
               </Pressable>
             ))}
          </GradientBorderCard>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Recent Activity</Text>
             <Pressable onPress={() => setShowActivityModal(true)}>
                <Text style={styles.viewAll}>View all {'>'}</Text>
             </Pressable>
          </View>
          <GradientBorderCard colors={['rgba(16, 185, 129, 0.4)', 'rgba(148, 163, 184, 0.1)']} innerStyle={styles.activityCard}>
             {todayLogs.length === 0 ? (
                <Text style={{ textAlign: 'center', color: palette.textDim, padding: 20 }}>No activity yet today</Text>
             ) : (
                todayLogs.slice(0, 3).map((log, idx) => {
                  const ex = EYE_EXERCISES.find(e => e.id === log.type) || EYE_EXERCISES[0];
                  return (
                    <View key={log.id} style={[styles.activityItem, idx === Math.min(todayLogs.length, 3) - 1 && styles.listItemNoBorder]}>
                       <View style={[styles.listIconWrap, { backgroundColor: `${ex.color}20` }]}>
                          <Ionicons name={ex.icon as any} size={22} color={ex.color} />
                       </View>
                       <View style={styles.listContent}>
                          <Text style={styles.listTitle}>{ex.title}</Text>
                          <Text style={styles.listSub}>Today, {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                       </View>
                       <View style={styles.listBadge}>
                          <Text style={styles.listBadgeText}>{ex.duration}</Text>
                       </View>
                       <View style={styles.activityStatus}>
                          <Ionicons name="checkmark-circle" size={24} color={palette.accentGreen} />
                       </View>
                    </View>
                  );
                })
             )}
          </GradientBorderCard>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Full Screen Timer Overlay */}
        {activeExercise && (
          <View style={styles.timerOverlay}>
            <AnimatedThemeBackdrop
              colors={backdropColors}
              mode={mode}
              primaryGlow={palette.primaryGlow}
              secondaryGlow={palette.accentBlue + '20'}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.timerBigRing}>
                  <Svg width="300" height="300" viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r="48" stroke={palette.stroke} strokeWidth="1" fill="none" />
                    <Circle
                      cx="50" cy="50" r="48"
                      stroke={activeExercise.color}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={301}
                      strokeDashoffset={301 * (1 - exerciseTimer / parseInt(activeExercise.duration))}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </Svg>
                  <View style={{ position: 'absolute' }}>
                    <Text style={styles.timerBigVal}>{exerciseTimer}</Text>
                  </View>
                </View>
                <Text style={styles.timerInstruction}>{activeExercise.title}</Text>
                <Text style={styles.timerDesc}>{activeExercise.desc}</Text>
                
                <Pressable 
                  onPress={() => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setActiveExercise(null);
                  }}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Cancel Session</Text>
                </Pressable>
              </View>
            </AnimatedThemeBackdrop>
          </View>
        )}
      </AnimatedThemeBackdrop>
      
      {/* Activity Logs Modal */}
      {showActivityModal && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 2000 }]}>
           <Pressable style={styles.modalOverlay} onPress={() => setShowActivityModal(false)}>
              <AnimatedThemeBackdrop colors={backdropColors} mode={mode} primaryGlow={palette.primaryGlow} secondaryGlow={palette.primaryGlow}>
                 <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                       <Text style={styles.modalTitle}>Activity History</Text>
                       <Pressable onPress={() => setShowActivityModal(false)} style={styles.closeIconButton}>
                          <Ionicons name="close" size={24} color={palette.text} />
                       </Pressable>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                       {eyeRestLogs.length === 0 ? (
                          <Text style={{ color: palette.textDim, textAlign: 'center', marginVertical: 40 }}>No activity logged yet.</Text>
                       ) : (
                          [...eyeRestLogs].reverse().map((log, idx) => {
                             const ex = EYE_EXERCISES.find(e => e.id === log.type) || EYE_EXERCISES[0];
                             return (
                                <View key={log.id} style={[styles.activityItem, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                                   <View style={[styles.listIconWrap, { backgroundColor: `${ex.color}20` }]}>
                                      <Ionicons name={ex.icon as any} size={22} color={ex.color} />
                                   </View>
                                   <View style={styles.listContent}>
                                      <Text style={styles.listTitle}>{ex.title}</Text>
                                      <Text style={styles.listSub}>{new Date(log.completedAt).toLocaleString()}</Text>
                                   </View>
                                   <Ionicons name="checkmark-done" size={20} color={palette.accentGreen} />
                                </View>
                             );
                          })
                       )}
                       <View style={{ height: 40 }} />
                    </ScrollView>
                 </View>
              </AnimatedThemeBackdrop>
           </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
