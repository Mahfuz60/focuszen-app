import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';
import { ScreenPalette } from '../theme/screenPalettes';

export function createAlarmStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.backgroundTop },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
    topIconButton: {
      width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.stroke,
      shadowColor: palette.shadow, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    },
    topTitle: { fontSize: 22, fontWeight: '900', color: palette.text },
    timerSection: { alignItems: 'center', marginVertical: spacing.lg },
    timerRing: {
      width: 258, height: 258, borderRadius: 129,
      borderWidth: 1.5, borderColor: palette.stroke,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surface,
      shadowColor: palette.accent, shadowOpacity: 0.22, shadowRadius: 34, shadowOffset: { width: 0, height: 16 },
      elevation: 10,
    },
    timerInner: {
      width: 218, height: 218, borderRadius: 109,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: palette.accent,
      backgroundColor: palette.accentSoft,
    },
    timerEmoji: { fontSize: 34, marginBottom: 6 },
    timerDisplay: { fontSize: 48, fontWeight: '900', color: palette.text },
    timerLabel: { fontSize: 14, fontWeight: '800', color: palette.textSoft, marginTop: 6 },
    progressTrack: {
      width: '88%', height: 8, borderRadius: 4,
      backgroundColor: palette.surfaceSoft, marginTop: spacing.lg, overflow: 'hidden',
      borderWidth: 1, borderColor: palette.stroke,
    },
    progressFill: { height: '100%', backgroundColor: palette.accent, borderRadius: 4 },
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
      padding: spacing.md, borderRadius: 16,
      backgroundColor: palette.surface,
      borderWidth: 1, borderColor: palette.stroke,
      shadowColor: palette.shadow, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 },
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
      flex: 1, height: 50, borderRadius: 16, textAlign: 'center',
      fontSize: 22, fontWeight: '800', color: palette.text,
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.accent,
    },
    customUnit: { fontSize: 16, color: palette.textSoft },
    benefitText: { fontSize: 14, color: palette.textSoft, marginTop: spacing.md, lineHeight: 20, fontWeight: '600' },
    ctaButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: spacing.sm, marginTop: spacing.xl, height: 58, borderRadius: 18,
      backgroundColor: palette.accent,
      shadowColor: palette.accent, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
    },
    ctaButtonStop: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: palette.red },
    ctaText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
    ctaTextStop: { color: palette.red },
    dismissButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: spacing.sm, marginTop: spacing.xl, height: 60, borderRadius: 18,
      backgroundColor: palette.alarm,
      shadowColor: palette.alarm, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
    },
    dismissText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  });
}
