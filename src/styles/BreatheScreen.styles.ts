import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';
import { ScreenPalette } from '../theme/screenPalettes';

export function createBreatheStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.backgroundTop },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    topIconButton: {
      width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    topTitle: { fontSize: 22, fontWeight: '800', color: palette.text, letterSpacing: -0.5 },
    
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    statPill: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1, borderColor: palette.stroke,
    },
    statText: { fontSize: 14, fontWeight: '700', color: palette.accent },

    ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xxl },
    ringOuter: {
      width: 280, height: 280, borderRadius: 140,
      borderWidth: 1.2, borderColor: palette.ringBorder,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.ringSurface,
      shadowColor: palette.accent,
      shadowOpacity: 0.18, shadowRadius: 34, shadowOffset: { width: 0, height: 14 },
      elevation: 8,
    },
    ringInner: {
      position: 'absolute', width: 240, height: 240, borderRadius: 120,
      backgroundColor: palette.ringPulse,
      borderWidth: 1.5, borderColor: palette.ringBorder,
    },
    progressDotOrbit: {
      position: 'absolute',
      width: 260,
      height: 260,
      zIndex: 6,
      elevation: 20,
    },
    progressDot: {
      position: 'absolute',
      top: -10,
      left: 125,
      elevation: 20,
      zIndex: 20,
    },
    ringCore: { alignItems: 'center', zIndex: 1 },
    lungsIcon: { marginBottom: 8, opacity: 0.8 },
    phaseLabel: { fontSize: 34, fontWeight: '900', color: palette.text, letterSpacing: -0.5 },
    phaseSub: { fontSize: 15, color: palette.textSoft, textAlign: 'center', marginTop: 6, paddingHorizontal: 40, lineHeight: 22 },
    
    leafContainer: { position: 'absolute', width: '100%', height: '100%' },
    leaf: { position: 'absolute', opacity: 0.6 },

    readyTechnique: {
      marginTop: -spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 22,
      backgroundColor: palette.surface,
      borderWidth: 1.5,
      borderColor: palette.stroke,
      shadowColor: palette.accent,
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 6,
    },
    readyTechniqueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    readyTechniqueLabel: { fontSize: 15, fontWeight: '800', color: palette.text },
    readyTechniqueRhythm: { fontSize: 24, fontWeight: '900', color: palette.accent, textAlign: 'center', marginTop: 8 },
    readyTechniqueDesc: { fontSize: 14, color: palette.textSoft, textAlign: 'center', lineHeight: 20, marginTop: 6 },

    floatingAction: {
      position: 'absolute',
      right: 0,
      bottom: 15,
      width: 68, height: 68, borderRadius: 34,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#7c3aed',
      shadowColor: '#7c3aed',
      shadowOpacity: 0.42, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
      elevation: 12,
      zIndex: 10,
    },
    floatingActionRunning: {
      backgroundColor: palette.red,
      shadowColor: palette.red,
    },

    patternsSection: { marginTop: spacing.xxl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    sectionAccent: { width: 4, height: 18, backgroundColor: palette.accent, borderRadius: 2, marginRight: 10 },
    sectionLabel: {
      fontSize: 14, fontWeight: '900', color: palette.text,
      letterSpacing: 1.8, textTransform: 'uppercase',
    },
    
    patternsGrid: { gap: 16 },
    patternCard: {
      flexDirection: 'row', alignItems: 'center',
      padding: spacing.md, borderRadius: 28,
      backgroundColor: palette.surface,
      borderWidth: 1.5, borderColor: palette.stroke,
      overflow: 'hidden',
      shadowColor: palette.accent, shadowOpacity: 0.1, shadowRadius: 10,
      elevation: 4,
    },
    patternCardActive: {
      borderColor: palette.accentSoft,
      backgroundColor: palette.surfaceSoft,
      shadowOpacity: 0.25, shadowRadius: 15, elevation: 8,
    },
    patternSideGlow: {
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
    },
    patternIconWrap: {
      width: 64, height: 64, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 16,
    },
    patternInfo: { flex: 1 },
    patternName: { fontSize: 20, fontWeight: '800', color: palette.text, letterSpacing: -0.3 },
    patternNameActive: { color: palette.accent },
    patternRhythm: { fontSize: 16, fontWeight: '700', color: palette.textSoft, marginTop: 2 },
    patternDesc: { fontSize: 14, color: palette.textMuted, marginTop: 10, lineHeight: 22 },
    customEditor: { gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.stroke },
    customRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    customLabel: { fontSize: 14, fontWeight: '700', color: palette.textMuted },
    customStepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    customStepButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceSoft,
      borderWidth: 1,
      borderColor: palette.stroke,
    },
    customValue: { minWidth: 34, fontSize: 15, fontWeight: '900', color: palette.accent, textAlign: 'center' },
    customApply: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
      borderRadius: 18,
      backgroundColor: palette.accent,
    },
    customApplyDisabled: { opacity: 0.45 },
    customApplyText: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
    
    tipCard: {
      flexDirection: 'row', alignItems: 'center',
      padding: spacing.xl, borderRadius: 32,
      backgroundColor: palette.surface,
      borderWidth: 1.5, borderColor: palette.stroke,
      marginTop: spacing.xxl,
      shadowColor: palette.accent, shadowOpacity: 0.15, shadowRadius: 12,
      elevation: 6,
    },
    tipText: { flex: 1, fontSize: 18, color: palette.textSoft, lineHeight: 22, fontWeight: '500', marginLeft: 16 },


  });
}
