import { spacing } from '../theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
export type QuickActionTarget = 'DailyPlanner' | 'Control' | 'Insights';

export const quickActions = [
  {
    key: 'plan',
    label: 'Planner',
    icon: 'calendar-outline' as const,
    target: 'DailyPlanner' as QuickActionTarget,
    baseColorLight: '#10b981',
    bgDark: '#00e676',
    iconDark: '#ffffff',
  },
  {
    key: 'purify',
    label: 'Purify',
    icon: 'flame-outline' as const,
    target: 'DailyPlanner' as QuickActionTarget,
    baseColorLight: '#d946ef',
    bgDark: '#d500f9',
    iconDark: '#ffffff',
  },
  {
    key: 'control',
    label: 'App Control',
    icon: 'options-outline' as const,
    target: 'Control' as QuickActionTarget,
    baseColorLight: '#3b82f6',
    bgDark: '#2979ff',
    iconDark: '#ffffff',
  },
  {
    key: 'insights',
    label: 'Insights',
    icon: 'bar-chart-outline' as const,
    target: 'Insights' as QuickActionTarget,
    baseColorLight: '#f43f5e',
    bgDark: '#ff1744',
    iconDark: '#ffffff',
  },
] as const;

export function Sparkline({ color }: { color: string }) {
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
        <Path d="M0,25 Q10,20 20,25 T40,25 T60,15 T80,25 T100,20 L100,30 L0,30 Z" fill={color} opacity={0.15} />
        <Path d="M0,25 Q10,20 20,25 T40,25 T60,15 T80,25 T100,20" stroke={color} strokeWidth="1.5" fill="none" opacity={0.6} />
      </Svg>
    </View>
  );
}

export const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  screenGlow: 'rgba(0, 230, 118, 0.18)',
  screenGlowSoft: 'rgba(213, 0, 249, 0.15)',
  screenGlowAccent: 'rgba(0, 176, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  surfaceMuted: 'rgba(255, 255, 255, 0.02)',
  stroke: 'rgba(255, 255, 255, 0.05)',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSoft: '#94a3b8',
  green: '#00ff9d',
  greenSoft: 'rgba(0, 255, 157, 0.1)',
  purple: '#d946ef',
  purpleSoft: 'rgba(217, 70, 239, 0.1)',
  blue: '#38bdf8',
  blueSoft: 'rgba(56, 189, 248, 0.1)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.6)',
  streakShell: 'rgba(0, 255, 157, 0.03)',
  streakBorder: 'rgba(0, 255, 157, 0.1)',
  streakCoreBorder: 'rgba(255, 255, 255, 0.05)',
};

export const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  screenGlow: 'rgba(0, 200, 83, 0.15)',
  screenGlowSoft: 'rgba(170, 0, 255, 0.12)',
  screenGlowAccent: 'rgba(41, 98, 255, 0.15)',
  surface: 'rgba(255, 255, 255, 0.8)',
  surfaceSoft: 'rgba(255, 255, 255, 0.6)',
  surfaceMuted: 'rgba(255, 255, 255, 0.4)',
  stroke: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  green: '#00c853',
  greenSoft: 'rgba(0, 200, 83, 0.15)',
  purple: '#aa00ff',
  purpleSoft: 'rgba(170, 0, 255, 0.12)',
  blue: '#2962ff',
  blueSoft: 'rgba(41, 98, 255, 0.12)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.06)',
  streakShell: 'rgba(255, 255, 255, 0.9)',
  streakBorder: 'rgba(0, 200, 83, 0.4)',
  streakCoreBorder: 'rgba(0, 200, 83, 0.2)',
};

export type ScreenPalette = typeof darkPalette;

export function createHomeStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.backgroundTop,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brandText: {
      fontSize: 22,
      fontWeight: '700',
      color: palette.green,
      letterSpacing: -0.5,
    },
    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
      shadowColor: palette.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    notificationDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: palette.green,
      borderWidth: 2,
      borderColor: palette.backgroundTop,
    },
    heroRow: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      gap: spacing.md,
    },
    heroCopy: {
      flex: 1,
      justifyContent: 'center',
    },
    greetingText: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: palette.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    heroLine: {
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '700',
      color: palette.text,
      letterSpacing: -0.5,
    },
    heroLineAccent: {
      color: palette.green,
    },
    heroSupport: {
      marginTop: spacing.sm,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500',
      color: palette.textSoft,
      maxWidth: '90%',
    },
    streakWrap: {
      width: 120,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.green,
      shadowOpacity: 0.2,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 0 },
    },
    streakRing: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakCore: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakValue: {
      fontSize: 36,
      fontWeight: '800',
      color: palette.text,
      letterSpacing: -1,
    },
    streakLabel: {
      marginTop: -2,
      fontSize: 12,
      fontWeight: '800',
      color: palette.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    streakSubLabel: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      color: palette.green,
    },
    focusCard: {
      marginTop: spacing.xl,
      borderRadius: 28,
      padding: spacing.lg,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.stroke,
      shadowColor: palette.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    focusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    focusEyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: palette.greenSoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    focusEyebrow: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.green,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    playGlowOuter: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(0, 255, 157, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.green,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
    },
    playGlowInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: palette.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playIcon: {
      marginLeft: 4,
    },
    playIconActive: {
      marginLeft: 0,
    },
    focusMiddleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    focusTitle: {
      marginTop: spacing.md,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700',
      color: palette.text,
      letterSpacing: -0.5,
    },
    focusFooter: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    focusFooterRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    focusTimerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    focusTimer: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      letterSpacing: -0.2,
    },
    focusMeta: {
      fontSize: 13,
      fontWeight: '500',
      color: palette.textSoft,
    },
    metricsGrid: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricCard: {
      width: '48%',
      borderRadius: 24,
      padding: spacing.lg,
      paddingBottom: 40,
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
      shadowColor: palette.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      position: 'relative',
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    metricIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricIconYellow: {
      backgroundColor: palette.white === '#ffffff' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.2)',
    },
    metricTextWrap: {
      flex: 1,
    },
    metricLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.textSoft,
    },
    metricValue: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '800',
      color: palette.text,
      letterSpacing: -0.5,
    },
    metricSubtext: {
      fontSize: 12,
      color: palette.textMuted,
      marginTop: 2,
    },
    sectionHeader: {
      marginTop: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      letterSpacing: -0.5,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.green,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    quickActionItem: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.sm,
    },
    quickActionIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
      shadowColor: palette.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    quickActionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: palette.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    upNextCard: {
      marginTop: spacing.sm,
      borderRadius: 24,
      padding: spacing.lg,
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    upNextIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: palette.greenSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    upNextCopy: {
      flex: 1,
    },
    upNextTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.text,
      letterSpacing: -0.3,
    },
    upNextMeta: {
      fontSize: 13,
      fontWeight: '500',
      color: palette.textSoft,
      marginTop: 2,
    },
    upNextTime: {
      fontSize: 15,
      fontWeight: '700',
      color: palette.green,
    },
    upNextArrowWrap: {
      width: 32,
      height: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    upNextArrowBg: {
      backgroundColor: palette.surfaceSoft,
    },

    /* ── Quick Actions ── */
    qaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: spacing.sm,
    },
    qaCard: {
      width: '48%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    qaInner: {
      padding: 14,
      paddingBottom: 10,
    },
    qaTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    qaIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qaArrowBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qaLabelWrap: {
      marginTop: 12,
      gap: 3,
    },
    qaLabel: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: palette.text,
    },
    qaSub: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      color: palette.textMuted,
    },
    qaBarRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      paddingHorizontal: 14,
      paddingBottom: 12,
      height: 36,
    },
    qaBarItem: {
      flex: 1,
      borderRadius: 3,
      minHeight: 4,
    },
    qaBottomBar: {
      height: 4,
      width: '100%',
    },

    /* ── Daily Performance ── */
    perfGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: spacing.sm,
    },
    perfCard: {
      width: '48%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    perfInner: {
      padding: 16,
      paddingBottom: 8,
    },
    perfTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    perfIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    perfLabel: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: -0.2,
      color: palette.text,
    },
    perfValue: {
      fontSize: 38,
      fontWeight: '900',
      letterSpacing: -1,
      lineHeight: 42,
      color: palette.text,
    },
    perfSub: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
      marginBottom: 12,
      color: palette.textMuted,
    },
    perfBottomBar: {
      height: 4,
      width: '100%',
    },
  });
}

/* ── Dynamic style helpers (mode + color) ── */

export function qaCardStyle(mode: 'dark' | 'light', color: string) {
  return {
    backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
    borderWidth: 1 as const,
    borderColor: mode === 'dark' ? `${color}50` : `${color}28`,
    shadowColor: color,
    shadowOpacity: mode === 'dark' ? 0.4 : 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  };
}

export function qaArrowBtnStyle(mode: 'dark' | 'light') {
  return {
    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };
}

export function qaArrowIconColor(mode: 'dark' | 'light') {
  return mode === 'dark' ? '#94a3b8' : '#64748b';
}

export function perfCardStyle(mode: 'dark' | 'light', color: string) {
  return {
    backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
    borderWidth: 1 as const,
    borderColor: mode === 'dark' ? `${color}50` : `${color}28`,
    shadowColor: color,
    shadowOpacity: mode === 'dark' ? 0.35 : 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  };
}

export function brandZenStyle(mode: 'dark' | 'light', palette: ScreenPalette) {
  return {
    color: mode === 'dark' ? palette.green : palette.text,
  };
}

export function greetingNameStyle(mode: 'dark' | 'light', palette: ScreenPalette) {
  return mode === 'dark' ? { color: palette.green } : undefined;
}

export function brandTextStyle(mode: 'dark' | 'light', palette: ScreenPalette) {
  return {
    color: mode === 'dark' ? palette.text : palette.green,
  };
}

export function greetingTextStyle(mode: 'dark' | 'light') {
  return mode === 'dark' ? { textTransform: 'uppercase' as const } : undefined;
}

export function upNextArrowStyle(mode: 'dark' | 'light', styles: any) {
  return mode === 'dark' ? styles.upNextArrowBg : null;
}

/* ── Additional Static Styles ── */

export const extraStyles = StyleSheet.create({
  streakBadge: {
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  focusCardContent: {
    flex: 1,
  },
});
