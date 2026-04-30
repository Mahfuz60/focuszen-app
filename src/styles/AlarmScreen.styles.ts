import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#0a0a14',
  backgroundBottom: '#12101e',
  primaryGlow: 'rgba(251, 191, 36, 0.2)',
  secondaryGlow: 'rgba(239, 68, 68, 0.15)',
  accentGlow: 'rgba(251, 191, 36, 0.08)',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  stroke: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSoft: '#94a3b8',
  accent: '#fbbf24',
  accentSoft: 'rgba(251, 191, 36, 0.12)',
  alarm: '#ef4444',
  alarmSoft: 'rgba(239, 68, 68, 0.15)',
  red: '#ef4444',
  green: '#00ff9d',
  shadow: 'rgba(0, 0, 0, 0.5)',
  backgroundTopStr: '#0a0a14',
};

export const lightPalette = {
  backgroundTop: '#fffbeb',
  backgroundBottom: '#fef3c7',
  primaryGlow: 'rgba(217, 119, 6, 0.15)',
  secondaryGlow: 'rgba(239, 68, 68, 0.1)',
  accentGlow: 'rgba(217, 119, 6, 0.08)',
  surface: 'rgba(255, 255, 255, 0.85)',
  surfaceSoft: 'rgba(255, 255, 255, 0.65)',
  stroke: 'rgba(217, 119, 6, 0.2)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  accent: '#d97706',
  accentSoft: 'rgba(217, 119, 6, 0.1)',
  alarm: '#dc2626',
  alarmSoft: 'rgba(220, 38, 38, 0.1)',
  red: '#dc2626',
  green: '#059669',
  shadow: 'rgba(0, 0, 0, 0.06)',
  backgroundTopStr: '#fffbeb',
};

export type ScreenPalette = typeof darkPalette;

export function createAlarmStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.backgroundTop },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topIconButton: {
      width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    topTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    napCount: { fontSize: 12, fontWeight: '700', color: palette.textSoft },
    timerSection: { alignItems: 'center', marginVertical: spacing.xl },
    timerRing: {
      width: 220, height: 220, borderRadius: 110,
      borderWidth: 2, borderColor: palette.stroke,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surfaceSoft,
    },
    timerInner: {
      width: 200, height: 200, borderRadius: 100,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: palette.accent,
    },
    timerEmoji: { fontSize: 32, marginBottom: 4 },
    timerDisplay: { fontSize: 44, fontWeight: '900', color: palette.text, letterSpacing: -1 },
    timerLabel: { fontSize: 14, fontWeight: '600', color: palette.textSoft, marginTop: 4 },
    progressTrack: {
      width: '80%', height: 4, borderRadius: 2,
      backgroundColor: palette.surfaceSoft, marginTop: spacing.lg, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: palette.accent, borderRadius: 2 },
    presetsSection: { marginTop: spacing.sm },
    sectionLabel: {
      fontSize: 11, fontWeight: '800', color: palette.textSoft,
      letterSpacing: 1.2, marginBottom: spacing.sm,
    },
    presetsGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    },
    presetCard: {
      flex: 1, minWidth: '28%', alignItems: 'center',
      padding: spacing.md, borderRadius: 18,
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1, borderColor: palette.stroke,
    },
    presetCardActive: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
    presetEmoji: { fontSize: 22, marginBottom: 4 },
    presetLabel: { fontSize: 14, fontWeight: '700', color: palette.textMuted },
    presetLabelActive: { color: palette.accent },
    customRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      marginTop: spacing.sm,
    },
    customInput: {
      flex: 1, height: 48, borderRadius: 14, textAlign: 'center',
      fontSize: 22, fontWeight: '800', color: palette.text,
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.accent,
    },
    customUnit: { fontSize: 16, color: palette.textSoft },
    benefitText: { fontSize: 13, color: palette.textSoft, marginTop: spacing.md, lineHeight: 18 },
    ctaButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: spacing.sm, marginTop: spacing.xl, height: 56, borderRadius: 28,
      backgroundColor: palette.accent,
    },
    ctaButtonStop: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: palette.red },
    ctaText: { fontSize: 16, fontWeight: '800', color: palette.backgroundTopStr },
    ctaTextStop: { color: palette.red },
    dismissButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: spacing.sm, marginTop: spacing.xl, height: 60, borderRadius: 30,
      backgroundColor: palette.alarm,
    },
    dismissText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  });
}
