import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { ProgressRing } from '../components/ProgressRing';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePurifyStore } from '../stores/usePurifyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { spacing } from '../theme/tokens';
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

const darkPalette = {
  backgroundTop: '#0f111a',
  backgroundBottom: '#181124',
  screenGlow: 'rgba(0, 255, 170, 0.25)',
  screenGlowSoft: 'rgba(255, 51, 153, 0.2)',
  screenGlowAccent: 'rgba(51, 153, 255, 0.25)',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  stroke: 'rgba(255, 255, 255, 0.15)',
  text: '#ffffff',
  textMuted: '#b0b8c4',
  textSoft: '#8f9bb3',
  purpleTrack: 'rgba(255, 255, 255, 0.06)',
  purple: '#d946ef',
  purpleGlow: 'rgba(217, 70, 239, 0.25)',
  green: '#00ff9d',
  iconAccent: '#ef4444',
  shadow: 'rgba(0, 0, 0, 0.5)',
  activeToggleBg: 'rgba(255,255,255,0.12)',
};

const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  screenGlow: 'rgba(0, 200, 83, 0.15)',
  screenGlowSoft: 'rgba(170, 0, 255, 0.12)',
  screenGlowAccent: 'rgba(41, 98, 255, 0.15)',
  surface: 'rgba(255, 255, 255, 0.8)',
  surfaceSoft: 'rgba(255, 255, 255, 0.6)',
  stroke: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  purpleTrack: 'rgba(0, 0, 0, 0.04)',
  purple: '#8b5cf6',
  purpleGlow: 'rgba(139, 92, 246, 0.2)',
  green: '#10b981',
  iconAccent: '#dc2626',
  shadow: 'rgba(0, 0, 0, 0.06)',
  activeToggleBg: '#ffffff',
};

type ScreenPalette = typeof darkPalette & {
  screenGlow: string;
  screenGlowSoft: string;
  screenGlowAccent: string;
};

const REFERENCE_TITLE = 'Self-Purified';

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
  const palette = useMemo<ScreenPalette>(
    () =>
      mode === 'dark'
        ? {
            ...darkPalette,
          }
        : {
            ...lightPalette,
          },
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
  const ringProgress = status.active ? getPurifyRingProgress(status.currentStreakDays) : 0;
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
        primaryGlow={palette.purpleGlow}
        secondaryGlow={mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(59, 130, 246, 0.08)'}
        accentGlow={mode === 'dark' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(168, 85, 247, 0.08)'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
        >
          <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.topIconButton}>
            <Ionicons name="arrow-back" size={18} color={palette.text} />
          </Pressable>

          <Text style={styles.topTitle}>Purify</Text>

          <View style={styles.toggleShell}>
            <Pressable
              onPress={() => setPurifyLanguage('en')}
              style={[
                styles.toggleOption,
                purifyLanguage === 'en' ? styles.toggleOptionActive : null,
              ]}
            >
              <Text style={styles.toggleText}>{copy.languageToggleEn}</Text>
            </Pressable>

            <Pressable
              onPress={() => setPurifyLanguage('bn')}
              style={[
                styles.toggleOption,
                purifyLanguage === 'bn' ? styles.toggleOptionActive : null,
              ]}
            >
              <Text style={styles.toggleText}>{copy.languageToggleBn}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>
            {purifyLanguage === 'en' ? REFERENCE_TITLE : copy.title}
          </Text>
          <Text style={styles.screenSubtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.ringSection}>
          <Svg
            pointerEvents="none"
            width={340}
            height={340}
            style={styles.ringAtmosphere}
          >
            <Defs>
              <RadialGradient id="purifyRingGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={palette.purple} stopOpacity={mode === 'dark' ? 0.25 : 0.06} />
                <Stop offset="50%" stopColor={palette.purple} stopOpacity={mode === 'dark' ? 0.12 : 0.02} />
                <Stop offset="76%" stopColor={palette.purple} stopOpacity={mode === 'dark' ? 0.04 : 0.005} />
                <Stop offset="100%" stopColor={palette.purple} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="170" cy="170" r="160" fill="url(#purifyRingGlow)" />
          </Svg>

          <ProgressRing
            size={286}
            strokeWidth={14}
            progress={ringProgress}
            valueLabel=" "
            caption=" "
            trackColor={palette.purpleTrack}
            progressGradientColors={[palette.purple, palette.iconAccent]}
            valueColor={palette.white}
            captionColor={palette.white}
          />

          <View pointerEvents="none" style={styles.ringOverlay}>
            <Text style={styles.dayLabel}>{status.currentStreakLabel}</Text>
            <Text style={styles.timerLabel}>{ringTimerLabel}</Text>
            <Ionicons name="walk" size={36} color={palette.iconAccent} style={{ marginTop: 16 }} />
          </View>

          <Pressable
            onPress={status.active ? confirmReset : handleStart}
            style={styles.ringLockButton}
          >
            <Ionicons name="power" size={24} color="#ffffff" />
          </Pressable>
        </View>

        <Text style={styles.milestoneLabel}>{nextMilestoneLabel}</Text>

        <View style={styles.quoteChip}>
          <Ionicons name="water-outline" size={14} color={palette.textMuted} />
          <Text style={styles.quoteChipText}>{chipLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={palette.textMuted} />
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>{quoteVm.body}</Text>
          <Text style={styles.quoteSource}>{quoteVm.sourceLabel}</Text>
        </View>

          <View style={styles.bottomRow}>
            <Pressable onPress={() => navigation.navigate('Focus')} style={styles.bottomAction}>
              <Ionicons name="flash-outline" size={16} color={palette.text} />
              <Text style={styles.bottomActionText}>Open focus</Text>
            </Pressable>
          </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}

function createStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  toggleShell: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 4,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  toggleOption: {
    minWidth: 40,
    minHeight: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  toggleOptionActive: {
    backgroundColor: palette.activeToggleBg,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.text,
  },
  headerBlock: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    marginTop: spacing.sm,
    maxWidth: 250,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: palette.textMuted,
  },
  ringSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAtmosphere: {
    position: 'absolute',
  },
  ringOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLockButton: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: palette.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dayLabel: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: 0,
  },
  timerLabel: {
    marginTop: 4,
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  milestoneLabel: {
    marginTop: spacing.lg,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    color: palette.textMuted,
  },
  quoteChip: {
    marginTop: spacing.md,
    alignSelf: 'center',
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  quoteChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
  },
  quoteCard: {
    marginTop: spacing.md,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  quoteText: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'left',
    letterSpacing: -0.2,
  },
  quoteSource: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    color: palette.textMuted,
  },
  bottomRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bottomAction: {
    minHeight: 56,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  bottomActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  });
}
