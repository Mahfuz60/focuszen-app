import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#060b14',
  backgroundBottom: '#0a1020',
  primaryGlow: 'rgba(56, 189, 248, 0.2)',
  secondaryGlow: 'rgba(16, 185, 129, 0.15)',
  accentGlow: 'rgba(56, 189, 248, 0.08)',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  stroke: 'rgba(255, 255, 255, 0.12)',
  strokeAlert: 'rgba(56, 189, 248, 0.4)',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSoft: '#94a3b8',
  blue: '#38bdf8',
  blueSoft: 'rgba(56, 189, 248, 0.12)',
  green: '#10b981',
  greenSoft: 'rgba(16, 185, 129, 0.12)',
  accent: '#38bdf8',
  accentSoft: 'rgba(56, 189, 248, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const lightPalette = {
  backgroundTop: '#e0f2fe',
  backgroundBottom: '#f0fdf4',
  primaryGlow: 'rgba(2, 132, 199, 0.15)',
  secondaryGlow: 'rgba(5, 150, 105, 0.12)',
  accentGlow: 'rgba(2, 132, 199, 0.08)',
  surface: 'rgba(255, 255, 255, 0.85)',
  surfaceSoft: 'rgba(255, 255, 255, 0.65)',
  stroke: 'rgba(2, 132, 199, 0.15)',
  strokeAlert: 'rgba(2, 132, 199, 0.5)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  blue: '#0284c7',
  blueSoft: 'rgba(2, 132, 199, 0.1)',
  green: '#059669',
  greenSoft: 'rgba(5, 150, 105, 0.1)',
  accent: '#0284c7',
  accentSoft: 'rgba(2, 132, 199, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.06)',
};

export type ScreenPalette = typeof darkPalette;

export function createVitalsStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.backgroundTop },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topIconButton: {
      width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    topTitle: { fontSize: 18, fontWeight: '700', color: palette.text },
    sectionCard: {
      marginTop: spacing.lg, padding: spacing.md, borderRadius: 24,
      backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.stroke,
    },
    sectionCardAlert: { borderColor: palette.strokeAlert, backgroundColor: palette.blueSoft },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardIconWrap: {
      width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.blueSoft,
    },
    cardTitle: { fontSize: 17, fontWeight: '800', color: palette.text },
    cardMeta: { fontSize: 13, color: palette.textSoft, marginTop: 2 },
    cardPercent: { fontSize: 22, fontWeight: '900', color: palette.blue },
    waterTrack: {
      height: 8, borderRadius: 4, backgroundColor: palette.surfaceSoft,
      marginTop: spacing.md, overflow: 'hidden',
    },
    waterFill: { height: '100%', backgroundColor: palette.blue, borderRadius: 4 },
    waterPresets: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    waterChip: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 4, height: 40, borderRadius: 12,
      backgroundColor: palette.blueSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    waterChipText: { fontSize: 13, fontWeight: '700', color: palette.blue },
    logRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingVertical: 8, borderTopWidth: 1, borderTopColor: palette.stroke, marginTop: spacing.xs,
    },
    logText: { flex: 1, fontSize: 14, fontWeight: '600', color: palette.textMuted },
    logTime: { fontSize: 12, color: palette.textSoft },
    eyeActiveCard: {
      marginTop: spacing.md, alignItems: 'center', padding: spacing.lg,
      borderRadius: 16, backgroundColor: palette.blueSoft,
    },
    eyeActiveTitle: { fontSize: 18, fontWeight: '800', color: palette.blue },
    eyeActiveTimer: { fontSize: 48, fontWeight: '900', color: palette.text, marginTop: 4 },
    eyeActiveDesc: { fontSize: 13, color: palette.textSoft, marginTop: spacing.sm, textAlign: 'center' },
    eyeCountdownRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md,
    },
    eyeCountdownText: { fontSize: 14, color: palette.textSoft, fontWeight: '600' },
    tipCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      marginTop: spacing.lg, padding: spacing.md, borderRadius: 16,
      backgroundColor: palette.accentSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    tipText: { flex: 1, fontSize: 13, color: palette.textMuted, lineHeight: 20 },
  });
}
