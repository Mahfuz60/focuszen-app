import { spacing } from '../theme/tokens';
import { StyleSheet } from 'react-native';
export type QuickActionTarget = 'DailyPlanner' | 'Control' | 'Insights';

export const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  screenGlow: 'rgba(0, 230, 118, 0.18)',
  screenGlowSoft: 'rgba(213, 0, 249, 0.15)',
  screenGlowAccent: 'rgba(0, 176, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceSoft: 'rgba(255, 255, 255, 0.06)',
  surfaceMuted: 'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(255, 255, 255, 0.12)',
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
  stroke: 'rgba(0, 0, 0, 0.05)',
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
      width: '48.6%',
      borderRadius: 24,
      overflow: 'hidden',
      minHeight: 120,
    },
    perfInner: {
      padding: 16,
      paddingBottom: 25,
    },
    perfTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    perfIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    perfLabel: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
      color: palette.text,
    },
    perfValue: {
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 36,
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
    usageDetailsCard: {
      borderRadius: 22,
      padding: spacing.md,
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
      shadowColor: palette.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    usageHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    usageTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: palette.text,
      letterSpacing: -0.3,
    },
    usageDetailsBody: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    usageLegend: {
      flex: 1,
      gap: 8,
    },
    usageLegendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    usageLegendDot: {
      width: 14,
      height: 14,
      borderRadius: 2,
    },
    usageLegendText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    usageChartWrap: {
      width: 190,
      height: 190,
      alignItems: 'center',
      justifyContent: 'center',
    },
    usageCenterValue: {
      position: 'absolute',
      fontSize: 20,
      fontWeight: '900',
      color: palette.text,
      letterSpacing: -0.3,
    },
    usageCenterLabel: {
      position: 'absolute',
      marginTop: 36,
      fontSize: 12,
      fontWeight: '700',
      color: palette.textSoft,
      textTransform: 'uppercase',
    },
    usagePercentRow: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    usagePercentText: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.textMuted,
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
