import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  screenGlow: 'rgba(0, 230, 118, 0.18)',
  screenGlowSoft: 'rgba(213, 0, 249, 0.15)',
  screenGlowAccent: 'rgba(0, 176, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  stroke: 'rgba(255, 255, 255, 0.05)',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSoft: '#94a3b8',
  accent: '#38bdf8',
  accentSoft: 'rgba(56, 189, 248, 0.1)',
  accentGradient: 'rgba(56, 189, 248, 0.25)',
  red: '#ef4444',
  shadow: 'rgba(0, 0, 0, 0.6)',
};

export const lightPalette = {
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
  textSoft: '#464647ff',
  accent: '#0ea5e9',
  accentSoft: 'rgba(14, 165, 233, 0.12)',
  accentGradient: 'rgba(14, 165, 233, 0.25)',
  red: '#dc2626',
  shadow: 'rgba(0, 0, 0, 0.06)',
};

export type ScreenPalette = typeof darkPalette;

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
      borderWidth: 1.2, borderColor: `${palette.textSoft}30`,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      shadowColor: palette.accent,
      shadowOpacity: 0.1, shadowRadius: 30,
    },
    ringInner: {
      position: 'absolute', width: 240, height: 240, borderRadius: 120,
      backgroundColor: 'rgba(56, 189, 248, 0.05)',
      borderWidth: 1.5, borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    ringCore: { alignItems: 'center', zIndex: 1 },
    lungsIcon: { marginBottom: 8, opacity: 0.8 },
    phaseLabel: { fontSize: 34, fontWeight: '900', color: palette.text, letterSpacing: -0.5 },
    phaseSub: { fontSize: 15, color: palette.textSoft, textAlign: 'center', marginTop: 6, paddingHorizontal: 40, lineHeight: 22 },
    phaseCount: { fontSize: 72, fontWeight: '900', color: palette.accent, marginTop: -8 },
    
    leafContainer: { position: 'absolute', width: '100%', height: '100%' },
    leaf: { position: 'absolute', opacity: 0.6 },

    floatingAction: {
      position: 'absolute',
      right: 0,
      bottom: 15,
      width: 68, height: 68, borderRadius: 34,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#7c3aed',
      shadowColor: '#7c3aed',
      shadowOpacity: 0.6, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
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
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
      overflow: 'hidden',
    },
    patternCardActive: {
      borderColor: 'rgba(56, 189, 248, 0.3)',
      backgroundColor: 'rgba(56, 189, 248, 0.08)',
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
    patternRhythm: { fontSize: 16, fontWeight: '700', color: palette.textSoft, marginTop: 2 },
    patternDesc: { fontSize: 14, color: palette.textMuted, marginTop: 10, lineHeight: 22 },
    
    tipCard: {
      flexDirection: 'row', alignItems: 'center',
      padding: spacing.xl, borderRadius: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
      marginTop: spacing.xxl,
    },
    tipText: { flex: 1, fontSize: 18, color: palette.textSoft, lineHeight: 22, fontWeight: '500', marginLeft: 16 },


  });
}
