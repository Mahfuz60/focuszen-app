import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { 
  useBodyCareStore, 
  WATER_PRESETS_ML, 
  DRINK_TYPES, 
  computeTodayWater,
  DrinkType,
  EyeRestLog
} from '../stores/useBodyCareStore';
import { spacing } from '../theme/tokens';
import {
  createBodyCareStyles,
} from '../styles/BodyCareScreen.styles';
import { ScreenPalette } from '../theme/screenPalettes';

const { width } = Dimensions.get('window');

const EYE_EXERCISES: { id: EyeRestLog['type']; title: string; desc: string; duration: string; icon: string }[] = [
  { id: '20-20-20', title: '20-20-20 Rule', desc: 'Look 20ft away for 20s', duration: '20s', icon: 'eye' },
  { id: 'rapid-blink', title: 'Rapid Blink', desc: 'Re-moisten eyes quickly', duration: '15s', icon: 'flash' },
  { id: 'palming', title: 'Palming', desc: 'Relax eyes in darkness', duration: '30s', icon: 'hand-left' },
  { id: 'figure-8', title: 'Figure-8 Focus', desc: 'Trace infinity with eyes', duration: '30s', icon: 'infinite' },
  { id: 'near-far', title: 'Near-Far Focus', desc: 'Alternate depth focus', duration: '30s', icon: 'expand' },
];

function WaterMascot({ color }: { color: string }) {
  return (
    <Svg width="50" height="50" viewBox="0 0 24 24">
      <Path
        d="M12,2C12,2 6,8.5 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.5 12,2 12,2Z"
        fill={color}
      />
      <Circle cx="9.5" cy="12" r="1" fill="#ffffff" />
      <Circle cx="14.5" cy="12" r="1" fill="#ffffff" />
      <Path d="M10,14.5 Q12,16 14,14.5" stroke="#ffffff" strokeWidth="1" fill="none" />
    </Svg>
  );
}

export function BodyCareScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('bodyCare'), [getPalette]);
  const styles = useMemo(() => createBodyCareStyles(palette, mode), [palette, mode]);
  const navigation = useNavigation<any>();

  const waterGoalMl = useBodyCareStore((s) => s.waterGoalMl);
  const waterEntries = useBodyCareStore((s) => s.waterEntries);
  const logWater = useBodyCareStore((s) => s.logWater);
  const logEyeRest = useBodyCareStore((s) => s.logEyeRest);

  const [currentDay, setCurrentDay] = useState(new Date().toDateString());
  const todayEntries = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return (waterEntries || []).filter((e) => e && e.loggedAt && new Date(e.loggedAt) >= todayStart);
  }, [waterEntries, currentDay]);

  const drinkBreakdown = useMemo(() => {
    const counts: Record<DrinkType, number> = {
      Water: 0, Coffee: 0, Tea: 0, Juice: 0, Milk: 0
    } as any;
    todayEntries.forEach(e => {
      if (e && e.type) {
        const key = (e.type.charAt(0).toUpperCase() + e.type.slice(1)) as DrinkType;
        counts[key] = (counts[key] || 0) + e.amountMl;
      }
    });
    return counts;
  }, [todayEntries]);

  const totalWaterToday = useMemo(() => Object.values(drinkBreakdown).reduce((a, b) => a + b, 0), [drinkBreakdown]);
  const progress = Math.min(totalWaterToday / Math.max(waterGoalMl || 2500, 1), 1);

  const [activeExercise, setActiveExercise] = useState<typeof EYE_EXERCISES[0] | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleLogWater = (ml: number, type: DrinkType = 'water') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logWater(ml, type);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.primaryGlow}
        secondaryGlow={palette.secondaryGlow}
        accentGlow={palette.accentGlow}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Body Care</Text>
            <View style={styles.topIconButton}>
              <Ionicons name="notifications-outline" size={20} color={palette.text} />
            </View>
          </View>

          {/* Mascot & Greeting */}
          <View style={styles.bubbleContainer}>
             <WaterMascot color={palette.blue} />
             <View style={styles.speechBubble}>
                <Text style={styles.bubbleText}>Let's drink some water!</Text>
             </View>
          </View>

          {/* ── Hydration Card ── */}
          <View style={styles.hydrationCard}>
             {/* Segmented Progress Bar at the Top of Card */}
             <View style={styles.segmentedBar}>
                {DRINK_TYPES.map(d => {
                  const amount = drinkBreakdown[d.type] || 0;
                  if (amount === 0) return null;
                  const widthPct = (amount / Math.max(waterGoalMl || 2500, 1)) * 100;
                  return (
                    <View 
                      key={d.type} 
                      style={{ 
                        width: `${Number.isFinite(widthPct) ? widthPct : 0}%`, 
                        height: '100%', 
                        backgroundColor: d.color,
                        borderRadius: 4,
                        marginRight: 1
                      }} 
                    />
                  );
                })}
             </View>

             <View style={styles.circleWrapper}>
                <Svg width="200" height="200" viewBox="0 0 100 100">
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={palette.surfaceSoft}
                    strokeWidth="8"
                    fill="none"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={palette.blue}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={283}
                    strokeDashoffset={283 * (1 - progress)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.circleInfo}>
                   <Text style={styles.circleValue}>{totalWaterToday}/{waterGoalMl}ml</Text>
                   <Text style={styles.circleGoal}>Total Intake</Text>
                </View>
             </View>

             {/* Drink Breakdown Labels */}
             <View style={styles.breakdownLabels}>
                {DRINK_TYPES.filter(d => drinkBreakdown[d.type] > 0).map(d => (
                  <View key={d.type} style={styles.breakdownItem}>
                     <View style={[styles.dot, { backgroundColor: d.color }]} />
                     <Text style={styles.breakdownText}>{d.label}: {drinkBreakdown[d.type]}ml</Text>
                  </View>
                ))}
             </View>

             <View style={styles.quickAdd}>
                {WATER_PRESETS_ML.slice(1).map((ml) => (
                  <Pressable key={ml} onPress={() => handleLogWater(ml)} style={styles.quickAddBtn}>
                     <Text style={styles.quickAddText}>+ {ml}ml</Text>
                  </Pressable>
                ))}
             </View>
          </View>


          {/* ── Other Drinks ── */}
          <Text style={styles.sectionTitle}>Track other drinks</Text>
          <View style={styles.drinksGrid}>
             {DRINK_TYPES.map((d) => (
               <Pressable 
                 key={d.type} 
                 onPress={() => handleLogWater(250, d.type)}
                 style={styles.drinkCard}
               >
                  <View style={[styles.drinkIconWrap, { backgroundColor: `${d.color}20` }]}>
                     <Ionicons name={d.icon as any} size={24} color={d.color} />
                  </View>
                  <Text style={styles.drinkLabel}>{d.label}</Text>
               </Pressable>
             ))}
          </View>

          {/* ── History Timeline ── */}
          <Text style={styles.sectionTitle}>Hydration Timeline</Text>
          <View style={styles.timeline}>
             {waterEntries.slice(0, 4).map((entry, idx) => {
                const drink = DRINK_TYPES.find(d => d.type === entry.type) || DRINK_TYPES[0];
                return (
                  <View key={entry.id} style={styles.timelineItem}>
                     <View style={styles.timelineLeft}>
                        <View style={[styles.timelineIcon, { backgroundColor: `${drink.color}20` }]}>
                           <Ionicons name={drink.icon as any} size={16} color={drink.color} />
                        </View>
                        {idx !== 3 && <View style={styles.timelineLine} />}
                     </View>
                     <View style={styles.timelineContent}>
                        <Text style={styles.timelineTime}>
                           {new Date(entry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={styles.timelineAmount}>{entry.amountMl}ml {drink.label}</Text>
                     </View>
                  </View>
                );
             })}
          </View>

          {/* ── Eye Exercises ── */}
          <Text style={styles.sectionTitle}>Eye Wellness</Text>
          {EYE_EXERCISES.map((ex) => (
            <Pressable 
              key={ex.id} 
              onPress={() => startExercise(ex)}
              style={styles.exerciseCard}
            >
               <View style={styles.exerciseIcon}>
                  <Ionicons name={ex.icon as any} size={24} color={palette.green} />
               </View>
               <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{ex.title}</Text>
                  <Text style={styles.exerciseSub}>{ex.desc}</Text>
                  <Text style={styles.exerciseMeta}>{ex.duration} duration</Text>
               </View>
               <Ionicons name="play-circle" size={32} color={palette.green} />
            </Pressable>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Exercise Timer Overlay ── */}
        {activeExercise && (
          <View style={styles.timerOverlay}>
             <View style={styles.timerCircle}>
                <Svg width="240" height="240" viewBox="0 0 100 100">
                  <Circle
                    cx="50"
                    cy="50"
                    r="48"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r="48"
                    stroke={palette.green}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={301}
                    strokeDashoffset={301 * (1 - exerciseTimer / parseInt(activeExercise.duration))}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                   <Text style={styles.timerText}>{exerciseTimer}</Text>
                </View>
             </View>
             <Text style={styles.timerInstruction}>{activeExercise.title}</Text>
             <Text style={styles.timerSub}>{activeExercise.desc}</Text>
             
             <Pressable 
               onPress={() => {
                 if (timerRef.current) clearInterval(timerRef.current);
                 setActiveExercise(null);
               }}
               style={{ marginTop: 60, padding: 20 }}
             >
                <Text style={{ color: '#ffffff', fontWeight: '800', opacity: 0.6 }}>Cancel Exercise</Text>
             </Pressable>
          </View>
        )}
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
