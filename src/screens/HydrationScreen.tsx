import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { GradientBorderCard } from '../components/GradientBorderCard';
import { useAppTheme } from '../hooks/useAppTheme';
import { 
  useBodyCareStore, 
  WATER_PRESETS_ML, 
  DRINK_TYPES, 
  computeTodayWater,
  DrinkType
} from '../stores/useBodyCareStore';
import {
  createBodyCareStyles,
  ScreenPalette,
} from '../styles/BodyCareScreen.styles';

import { WaveProgress } from '../components/WaveProgress';
import { HydrationAddModal } from '../components/HydrationAddModal';

export function HydrationScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('bodyCare'), [getPalette]);
  const styles = useMemo(() => createBodyCareStyles(palette), [palette]);
  const navigation = useNavigation<any>();

  const { waterEntries, waterGoalMl, logWater, updateGoal, lastVolumes, lastType } = useBodyCareStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialModalType, setInitialModalType] = useState<DrinkType>('Water');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [tempGoal, setTempGoal] = useState(waterGoalMl.toString());
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [visibleProgress, setVisibleProgress] = useState(0);
  const [nextReminder, setNextReminder] = useState({ time: '11:00 AM', diff: '45 min' });

  useEffect(() => {
    const updateReminder = () => {
      const now = new Date();
      const next = new Date();
      next.setMinutes(0, 0, 0);
      next.setHours(now.getHours() + 1);
      
      // If next is too close (< 15 mins), push it by another hour
      if (next.getTime() - now.getTime() < 15 * 60000) {
        next.setHours(next.getHours() + 1);
      }

      const diffMs = next.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      setNextReminder({
        time: next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diff: diffMins >= 60 
          ? `In ${Math.floor(diffMins/60)}h ${diffMins%60}m` 
          : `In ${diffMins} min`
      });
    };

    updateReminder();
    const timer = setInterval(updateReminder, 60000);
    return () => clearInterval(timer);
  }, []);


  const todayEntries = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return waterEntries.filter((entry) => new Date(entry.loggedAt) >= todayStart);
  }, [waterEntries]);
  const totalWaterToday = useMemo(() => computeTodayWater(waterEntries), [waterEntries]);
  const progress = Math.min(totalWaterToday / Math.max(waterGoalMl, 1), 1);
  const visibleEntries = showAllEntries ? todayEntries : todayEntries.slice(0, 5);
  const visualProgress = Math.max(visibleProgress, 0.05);

  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value }) => {
      setVisibleProgress(value);
    });

    return () => animatedProgress.removeListener(listenerId);
  }, [animatedProgress]);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, progress]);


  const handleLogWater = (ml: number, type: DrinkType = 'Water') => {
    logWater(ml, type);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Trigger progress animation
    Animated.sequence([
      Animated.timing(animatedProgress, { toValue: progress + (ml / waterGoalMl), duration: 200, useNativeDriver: false }),
      Animated.spring(animatedProgress, { toValue: (totalWaterToday + ml) / waterGoalMl, tension: 20, friction: 5, useNativeDriver: false })
    ]).start();
  };

  const openGoalModal = () => {
    setTempGoal(waterGoalMl.toString());
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    const nextGoal = parseInt(tempGoal, 10);
    updateGoal(Number.isFinite(nextGoal) ? Math.max(nextGoal, 500) : 2500);
    setShowGoalModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.backgroundTop} />
      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={24} color={palette.text} />
            </Pressable>
            <Text style={styles.topTitle}>Hydration</Text>
            <Pressable onPress={() => navigation.navigate('Insights')} style={styles.topIconButton}>
              <Ionicons name="settings-outline" size={20} color={palette.text} />
            </Pressable>
          </View>

          {/* Header */}
          <View style={[styles.header, { marginBottom: 12 }]}>
            <Text style={styles.mainTitle}>Let's <Text style={styles.mainTitleAccent}>drink</Text> some water!</Text>
          </View>

          {/* Goal Card */}
          <GradientBorderCard colors={['rgba(56, 189, 248, 0.45)', 'rgba(148, 163, 184, 0.1)']} innerStyle={styles.goalCard}>
            <View style={styles.goalInfo}>
               <View style={styles.goalIcon}>
                  <Ionicons name="water" size={20} color={palette.blue} />
               </View>
               <View>
                  <Text style={styles.goalLabel}>Daily goal</Text>
                  <Text style={styles.goalValue}>{(waterGoalMl/1000).toFixed(1)} L</Text>
               </View>
            </View>
            <Pressable onPress={openGoalModal} style={styles.editBtn}>
               <Text style={styles.editBtnText}>Edit goal</Text>
               <Ionicons name="chevron-forward" size={14} color={palette.blue} />
            </Pressable>
          </GradientBorderCard>

          {/* Hero Progress */}
          <View style={styles.heroContainer}>
            <Pressable onPress={() => handleLogWater(250)} style={styles.waterCircle}>
               <WaveProgress 
                  progress={visualProgress} 
                  size={280} 
                  color={palette.blue} 
                  mode={mode}
               />
               <View style={styles.circleContent}>
                  <Text style={styles.currentIntake}>
                    {((visibleProgress * waterGoalMl)/1000).toFixed(1)}<Text style={[styles.intakeUnit, { color: palette.blue }]}>L</Text>
                  </Text>
                  <Text style={styles.goalSuffix}>of {(waterGoalMl/1000).toFixed(1)} L</Text>
                  <Text style={styles.percentText}>{Math.round(visibleProgress * 100)}% of daily goal</Text>
               </View>
            </Pressable>
            
            <View style={styles.heroSpacer} />

            <Pressable 
              onPress={() => {
                const vol = lastVolumes?.[lastType] || 250;
                handleLogWater(vol, lastType);
              }} 
              onLongPress={() => {
                setInitialModalType(lastType);
                setShowAddModal(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              delayLongPress={500}
              style={[styles.addDrinkBtn, { paddingHorizontal: 32 }]}
            >
               <Ionicons name="add-circle" size={24} color="#fff" />
               <Text style={styles.addDrinkText}>Log {lastVolumes?.[lastType] || 250}ml {lastType}</Text>
            </Pressable>
          </View>


          {/* Quick Add */}
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
             {WATER_PRESETS_ML.map(ml => (
               <Pressable key={ml} style={styles.quickAddPressable} onPress={() => handleLogWater(ml)}>
                <GradientBorderCard colors={['rgba(56, 189, 248, 0.35)', 'rgba(148, 163, 184, 0.1)']} containerStyle={styles.quickAddPressable} innerStyle={styles.quickAddBox}>
                   <Ionicons name="pint-outline" size={24} color={palette.blue} />
                   <Text style={styles.quickAddVal}>{ml >= 1000 ? `${ml/1000}L` : `${ml}ml`}</Text>
                </GradientBorderCard>
               </Pressable>
             ))}
          </View>

          {/* Drink Types */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drink Types</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
             {DRINK_TYPES.map(d => (
               <View key={d.type} style={styles.drinkTypeBox}>
                  <Pressable 
                    onPress={() => {
                      setInitialModalType(d.type);
                      setShowAddModal(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    style={[
                      styles.drinkIconCircle, 
                      { 
                        backgroundColor: lastType === d.type ? `${d.color}25` : `${d.color}10`, 
                        borderWidth: 1.5, 
                        borderColor: lastType === d.type ? d.color : 'transparent' 
                      }
                    ]}
                  >
                    <Image source={{ uri: d.imageUri }} style={styles.drinkImageIcon} />
                  </Pressable>
                  
                  <Text style={[styles.drinkTypeLabel, { color: lastType === d.type ? d.color : palette.textSoft }]}>{d.label}</Text>
                  <View style={[styles.drinkTypeBadge, lastType === d.type && { borderColor: d.color, backgroundColor: `${d.color}15` }]}>
                    <Text style={[styles.drinkTypeBadgeText, lastType === d.type && { color: d.color }]}>
                      {lastVolumes?.[d.type] || 250}ml
                    </Text>
                  </View>
               </View>
             ))}
          </ScrollView>

          {/* Tips Cards */}
          <View style={styles.cardsRow}>
             <GradientBorderCard colors={['rgba(56, 189, 248, 0.4)', 'rgba(148, 163, 184, 0.1)']} containerStyle={{ flex: 1 }} innerStyle={styles.tipCard}>
                <View style={[styles.tipIcon, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                   <Ionicons name="notifications" size={18} color={palette.blue} />
                </View>
                <Text style={styles.tipTitle}>Next reminder</Text>
                <Text style={styles.tipVal}>{nextReminder.diff}</Text>
                <Text style={styles.tipSub}>{nextReminder.time}</Text>
             </GradientBorderCard>
             <GradientBorderCard colors={['rgba(16, 185, 129, 0.4)', 'rgba(148, 163, 184, 0.1)']} containerStyle={{ flex: 1 }} innerStyle={styles.tipCard}>
                <View style={[styles.tipIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                   <Ionicons name="sparkles" size={18} color={palette.green} />
                </View>
                <Text style={styles.tipTitle}>You're doing great!</Text>
                <Text style={styles.tipVal}>Keep it up</Text>
                <View style={styles.tipMascot}>
                   <Ionicons name="happy-outline" size={32} color={palette.blue} />
                </View>
             </GradientBorderCard>
          </View>

          {/* Overview Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today Overview</Text>
          </View>
          <GradientBorderCard colors={['rgba(56, 189, 248, 0.4)', 'rgba(16, 185, 129, 0.2)']} innerStyle={styles.overviewGrid}>
             <View style={styles.statItem}>
                <Ionicons name="pint-outline" size={18} color={palette.blue} style={styles.statIcon} />
                <Text style={styles.statVal}>{todayEntries.length}</Text>
                <Text style={styles.statLab}>Drinks</Text>
             </View>
             <View style={styles.statItem}>
                <Ionicons name="water-outline" size={18} color={palette.blue} style={styles.statIcon} />
                <Text style={styles.statVal}>{(totalWaterToday/1000).toFixed(1)} L</Text>
                <Text style={styles.statLab}>Intake</Text>
             </View>
             <View style={styles.statItem}>
                <Ionicons name="pie-chart-outline" size={18} color={palette.green} style={styles.statIcon} />
                <Text style={styles.statVal}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.statLab}>Goal</Text>
             </View>
             <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={18} color="#f97316" style={styles.statIcon} />
                <Text style={styles.statVal}>{progress >= 1 ? 1 : 0}</Text>
                <Text style={styles.statLab}>Day Streak</Text>
             </View>
          </GradientBorderCard>

          {/* Timeline */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {todayEntries.length > 5 && (
              <Pressable onPress={() => setShowAllEntries((value) => !value)}>
                <Text style={styles.viewAll}>{showAllEntries ? 'Show less' : 'See all >'}</Text>
              </Pressable>
            )}
          </View>
          <GradientBorderCard colors={['rgba(56, 189, 248, 0.35)', 'rgba(148, 163, 184, 0.1)']} innerStyle={styles.timelineCard}>
             {todayEntries.length === 0 && (
               <Text style={styles.emptyText}>No drinks logged today.</Text>
             )}
             {visibleEntries.map((entry, idx) => {
                const drink = DRINK_TYPES.find(d => d.type === entry.type) || DRINK_TYPES[0];
                return (
                  <View key={entry.id} style={styles.timelineItem}>
                     <Text style={styles.timelineTime}>
                        {new Date(entry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </Text>
                     <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: `${drink.color}15`, borderWidth: 1, borderColor: `${drink.color}30` }]}>
                           <Ionicons name={drink.icon as any} size={18} color={drink.color} />
                        </View>
                        {idx !== visibleEntries.length - 1 && <View style={styles.timelineConnector} />}
                     </View>
                     <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{drink.label}</Text>
                        <Text style={styles.timelineSub}>{entry.amountMl}ml</Text>
                     </View>
                     <Pressable style={styles.timelineAdd} onPress={() => handleLogWater(entry.amountMl, entry.type)}>
                        <Ionicons name="add" size={20} color={palette.blue} />
                     </Pressable>
                  </View>
                );
             })}
          </GradientBorderCard>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </AnimatedThemeBackdrop>
      {/* Goal Edit Modal */}
      <Modal visible={showGoalModal} animationType="fade" onRequestClose={() => setShowGoalModal(false)} transparent>
        <View style={styles.overlay}>
          <View style={styles.goalModal}>
             <Text style={[styles.modalTitle, { color: '#fff' }]}>Edit Daily Goal</Text>
             <Text style={[styles.modalSub, { color: 'rgba(255,255,255,0.6)', textAlign: 'center' }]}>Target intake in milliliters (ml)</Text>
             
             <View style={[styles.inputBox, { borderColor: 'rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                <Ionicons name="water" size={28} color={palette.blue} />
                <TextInput
                  autoFocus
                  keyboardType="number-pad"
                  maxLength={5}
                  onChangeText={setTempGoal}
                  selectTextOnFocus
                  style={[styles.inputText, { color: '#fff' }]}
                  value={tempGoal}
                />
             </View>

             <View style={[styles.modalBtns, { marginTop: 10 }]}>
                <Pressable onPress={() => setShowGoalModal(false)} style={styles.modalCancel}>
                   <Text style={[styles.modalCancelText, { color: 'rgba(255,255,255,0.6)' }]}>Cancel</Text>
                </Pressable>
                <Pressable 
                  onPress={saveGoal}
                  style={[styles.modalSave, { backgroundColor: palette.blue, shadowColor: palette.blue, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }]}
                >
                   <Text style={styles.modalSaveText}>Save Goal</Text>
                </Pressable>
             </View>
          </View>
        </View>
      </Modal>
      <HydrationAddModal
        visible={showAddModal}
        initialType={initialModalType}
        onClose={() => setShowAddModal(false)}
        onAdd={(ml, type) => {
          handleLogWater(ml, type);
          setShowAddModal(false);
        }}
        palette={palette}
      />
    </SafeAreaView>
  );
}
