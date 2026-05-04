import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePurifyStore } from '../stores/usePurifyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { spacing } from '../theme/tokens';
import {
  createPurifyStyles as createStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/PurifyScreen.styles';
import {
  buildPurifyStatus,
  getNextPurifyMilestone,
  getPurifyMilestoneDays,
  getPurifyRingProgress,
} from '../utils/purifyProgress';
import {
  buildPurifyQuoteViewModel,
  getHourlyQuote,
  getPurifyQuotes,
  getPurifyScreenCopy,
} from '../utils/purify';





function formatMilestoneLabel(days: number, language: 'en' | 'bn') {
  if (language === 'bn') {
    return `পরের মাইলস্টোন: ${days} দিন`;
  }

  return `Next milestone: ${days} days`;
}

export function PurifyScreen() {
  const { mode, text } = useAppTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();

  const purify = usePurifyStore((state) => state.purify);
  const startPurify = usePurifyStore((state) => state.startPurify);
  const resetPurify = usePurifyStore((state) => state.resetPurify);
  const refreshPurify = usePurifyStore((state) => state.refreshPurify);

  const purifyLanguage = useSettingsStore(
    (state) => state.settings.purifyLanguage ?? 'en'
  );
  const setPurifyLanguage = useSettingsStore((state) => state.setPurifyLanguage);

  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  const currentHour = useMemo(() => new Date(nowIso).getHours(), [nowIso]);
  const palette = useMemo(
    () => (mode === 'dark' ? ({ ...darkPalette } as ScreenPalette) : ({ ...lightPalette } as ScreenPalette)),
    [mode]
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const now = new Date().toISOString();
    setNowIso(now);
    void refreshPurify(now, purifyLanguage);
  }, [isFocused, purifyLanguage, refreshPurify]);

  useEffect(() => {
    if (!isFocused || !purify.active) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().toISOString();
      setNowIso(now);
      void refreshPurify(now, purifyLanguage);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocused, purify.active, purifyLanguage, refreshPurify]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    const timeout = setTimeout(() => {
      setNowIso(new Date().toISOString());
    }, nextHour.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [currentHour, isFocused]);

  const copy = useMemo(() => getPurifyScreenCopy(purifyLanguage), [purifyLanguage]);
  const quotes = useMemo(() => getPurifyQuotes(purifyLanguage), [purifyLanguage]);
  const hourlyQuote = useMemo(() => getHourlyQuote(quotes, currentHour), [currentHour, quotes]);
  const quoteVm = useMemo(
    () => buildPurifyQuoteViewModel(hourlyQuote, purifyLanguage),
    [hourlyQuote, purifyLanguage]
  );

  const status = useMemo(
    () =>
      buildPurifyStatus({
        state: purify,
        nowIso,
        language: purifyLanguage,
      }),
    [nowIso, purify, purifyLanguage]
  );

  const nextMilestone = getNextPurifyMilestone(status.currentStreakDays);
  const nextMilestoneLabel = nextMilestone
    ? formatMilestoneLabel(getPurifyMilestoneDays(nextMilestone), purifyLanguage)
    : purifyLanguage === 'bn'
      ? 'সর্বোচ্চ মাইলস্টোন পূর্ণ'
      : 'Highest milestone reached';
  const elapsedSeconds = purify.startedAt ? Math.max(0, Math.floor((new Date(nowIso).getTime() - new Date(purify.startedAt).getTime()) / 1000)) : 0;
  const ringProgress = status.active ? Math.max(0.01, (elapsedSeconds % 86400) / 86400) : 0;
  const ringTimerLabel = status.active
    ? status.elapsedLabel
    : '00:00:00';
  const chipLabel = quoteVm.tagLabel;
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }

  function handleStart() {
    const now = new Date().toISOString();
    setNowIso(now);
    startPurify(now);
  }

  function confirmReset() {
    Alert.alert(
      purifyLanguage === 'bn' ? 'স্ট্রিক রিসেট' : 'Reset streak',
      purifyLanguage === 'bn'
        ? 'রিসেট করলে বর্তমান স্ট্রিক ভেঙে যাবে।'
        : 'Resetting will break the current streak.',
      [
        {
          text: purifyLanguage === 'bn' ? 'না' : 'Cancel',
          style: 'cancel',
        },
        {
          text: purifyLanguage === 'bn' ? 'রিসেট' : 'Reset',
          style: 'destructive',
          onPress: () => {
            const now = new Date().toISOString();
            setNowIso(now);
            resetPurify(now);
          },
        },
      ]
    );
  }

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
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={24} color={palette.text} />
            </Pressable>
            <View style={styles.toggleShell}>
              <Pressable
                onPress={() => setPurifyLanguage('en')}
                style={[styles.toggleOption, purifyLanguage === 'en' && styles.toggleOptionActive]}
              >
                <Text style={styles.toggleText}>EN</Text>
              </Pressable>
              <Pressable
                onPress={() => setPurifyLanguage('bn')}
                style={[styles.toggleOption, purifyLanguage === 'bn' && styles.toggleOptionActive]}
              >
                <Text style={styles.toggleText}>BN</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.headerBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.screenTitle}>Self-Purified</Text>
              <Text style={styles.screenSubtitle}>Build self-discipline. Step away from harmful habits.</Text>
            </View>
            
            
          </View>

          <View style={styles.ringSection}>
           
          <Svg
            width={320}
            height={320}
            viewBox="0 0 320 320"
            style={styles.rainbowSvg}
          >
            <Defs>
              <LinearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#38bdf8" />
                <Stop offset="25%" stopColor="#00ff9d" />
                <Stop offset="50%" stopColor="#fbbf24" />
                <Stop offset="75%" stopColor="#f43f5e" />
                <Stop offset="100%" stopColor="#d946ef" />
              </LinearGradient>
              <RadialGradient id="ringBackGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#0f111a" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            <Circle cx="160" cy="160" r="140" fill="url(#ringBackGlow)" />
            <Circle
              cx="160"
              cy="160"
              r="130"
              stroke="url(#rainbowGrad)"
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              transform="rotate(-90 160 160)"
            />
            <Circle
              cx="160"
              cy="30"
              r="7"
              fill="#0a0a0aff"
            />
          </Svg>

          <View pointerEvents="none" style={styles.ringOverlay}>
            <Text style={styles.dayLabel}>{status.currentStreakLabel}</Text>
            <Text style={styles.timerLabel}>{ringTimerLabel}</Text>
            <View style={styles.walkIconCircle}>
              <Ionicons name="walk" size={32} color={palette.iconColor} />
            </View>
          </View>
             <Pressable
            onPress={status.active ? confirmReset : handleStart}
            style={styles.topRightPowerBtn}
          >
            <View style={styles.iconSquircle}>
              <Ionicons name="power" size={20} color={palette.powerAccent} />
            </View>
          </Pressable>
          

        

        </View>

        <Pressable onPress={() => {}} style={styles.nextMilestoneCard}>
          <View style={styles.milestoneIconWrap}>
            <Ionicons name="disc-outline" size={26} color="#d946ef" />
          </View>
          <View style={styles.milestoneCopy}>
            <Text style={styles.milestoneLabelSmall}>Next milestone</Text>
            <Text style={styles.milestoneValueLarge}>{nextMilestoneLabel}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </Pressable>

        <View style={styles.quoteGlassCard}>
          <View style={styles.quoteLeftBar} />
          <View style={styles.quoteContent}>
            <Text style={styles.quoteTextMain}>"{quoteVm.body}"</Text>
            <Text style={styles.quoteSourceText}>{quoteVm.sourceLabel}</Text>
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate('Focus')} style={styles.openFocusButton}>
          <Ionicons name="flash" size={20} color={palette.yellow} style={{ marginRight: 12 }} />
          <Text style={styles.openFocusText}>Open focus</Text>
          <Ionicons name="chevron-forward" size={18} color={palette.yellow} style={{ marginLeft: 'auto' }} />
        </Pressable>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
