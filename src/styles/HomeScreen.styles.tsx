import { spacing } from '../theme/tokens';
import { StyleSheet } from 'react-native';


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
  textSoft: '#0d0d0eff',
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

export function createHomeStyles(palette: ScreenPalette, mode: 'dark' | 'light') {
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
      marginTop: spacing.lg,
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
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
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
      gap: 12,
      marginTop: spacing.sm,
    },
    qaCardWrapper: {
      width: '48.3%',
    },
    qaCard: {
      padding: 14,
      height: 135,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
    },
    qaIconContainer: {
      alignItems: 'center',
      marginBottom: 8,
    },
    qaIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qaImage: {
      width: 42,
      height: 42,
    },
    qaArrowHint: {
      position: 'absolute',
      top: -4,
      right: -48,
    },
    qaInfo: {
      alignItems: 'center',
      gap: 2,
    },
    qaLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: palette.text,
      textAlign: 'center',
    },
    qaSub: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.textSoft,
      textAlign: 'center',
      opacity: 0.8,
    },
    usageMasterCard: {
      padding: 24,
      borderRadius: 28,
      marginBottom: 16,
    },
    usageFullDivider: {
      height: 1,
      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      marginVertical: 20,
      width: '100%',
    },
    usageHeroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    usageLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    usageHeroLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: palette.blue,
      letterSpacing: 1,
    },
    usageTotalHero: {
      fontSize: 52,
      fontWeight: '800',
      color: palette.text,
      letterSpacing: -2,
      lineHeight: 58,
    },
    usageTotalSuffix: {
      fontSize: 22,
      fontWeight: '700',
      color: palette.text,
      marginLeft: -2,
    },
    usageDeltaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    usageDeltaText: {
      fontSize: 14,
      fontWeight: '700',
    },
    usageActionWrap: {
      position: 'relative',
    },
    usageChartBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#3b82f6',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      shadowColor: '#3b82f6',
      shadowOpacity: mode === 'dark' ? 0.5 : 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    usageProgressContainer: {
      marginTop: 20,
    },
    usageProgressTrack: {
      height: 8,
      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    usageProgressFill: {
      height: '100%',
      backgroundColor: palette.blue,
      borderRadius: 4,
    },
    usageProgressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    usageProgressSub: {
      fontSize: 12,
      fontWeight: '700',
      color: palette.textSoft,
    },
    usageProgressPercent: {
      fontSize: 12,
      fontWeight: '800',
      color: palette.blue,
    },
    usageDetailsCard: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: mode === 'dark' ? '#121316' : '#ffffff',
      borderWidth: mode === 'dark' ? 1 : 0,
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: mode === 'dark' ? 0.4 : 0.12,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 15 },
      elevation: 20,
    },
    usageList: {
      flex: 1,
      paddingRight: 16,
    },
    usageListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    usageListItemNoBorder: {
      borderBottomWidth: 0,
    },
    usageListLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    usageIconWrap: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    usageIconInner: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    usageListName: {
      fontSize: 15,
      fontWeight: '700',
      color: palette.text,
    },
    usageListTime: {
      fontSize: 13,
      fontWeight: '500',
      color: palette.textSoft,
      marginTop: 2,
    },
    usageListDivider: {
      width: 1,
      height: '80%',
      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
    usageChartContainer: {
      flex: 1.2,
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 16,
    },
    usageCenterContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    usageCenterValue: {
      fontSize: 38,
      fontWeight: '800',
      color: palette.text,
      letterSpacing: -1,
    },
    usageCenterValueSuffix: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.textSoft,
    },
    usageCenterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSoft,
      marginTop: -2,
    },
    usagePercentLabel: {
      position: 'absolute',
      fontSize: 12,
      fontWeight: '700',
    },
    usageDropdownWrap: {
      position: 'absolute',
      top: 48,
      right: 0,
      width: 140,
      backgroundColor: mode === 'dark' ? '#1a1b1e' : '#ffffff',
      borderRadius: 18,
      padding: 6,
      borderWidth: 1,
      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      zIndex: 100,
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 10,
    },
    usageDropdownItem: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    usageDropdownItemActive: {
      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
    usageDropdownText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSoft,
    },
    usageDropdownTextActive: {
      color: palette.text,
      fontWeight: '700',
    },
  });
}

/* ── Dynamic style helpers (mode + color) ── */


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
