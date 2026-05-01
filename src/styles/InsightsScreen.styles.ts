import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  screenGlow: 'rgba(0, 255, 157, 0.18)',
  screenGlowSoft: 'rgba(213, 0, 249, 0.15)',
  screenGlowAccent: 'rgba(0, 176, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.12)',
  surfaceSoft: 'rgba(255, 255, 255, 0.08)',
  stroke: 'rgba(255, 255, 255, 0.2)',
  text: '#ffffff',
  textMuted: '#e2e8f0',
  textSoft: '#94a3b8',
  white: '#ffffff',
  green: '#00ff9d',
  purple: '#d946ef',
  blue: '#38bdf8',
  chipActive: 'rgba(0, 255, 157, 0.15)',
  chipBorder: 'rgba(0, 255, 157, 0.3)',
  barTrack: 'rgba(255, 255, 255, 0.05)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  greenSoft: 'rgba(0, 255, 157, 0.1)',
  purpleSoft: 'rgba(217, 70, 239, 0.1)',
  blueSoft: 'rgba(56, 189, 248, 0.1)',
};

export const chartPalettes = {
  focus: {
    dark: ['#00ff9d', '#0ea5e9'],
    light: ['#10b981', '#3b82f6'],
    track: {
      dark: 'rgba(0,255,157,0.1)',
      light: 'rgba(16,185,129,0.06)',
    },
    glow: {
      dark: 'rgba(0,255,157,0.5)',
      light: 'rgba(16,185,129,0.3)',
    },
  },
  usage: {
    blocked: ['#00ff9d', '#0ea5e9'],
    active: ['#d946ef', '#8b5cf6'],
  },
  purify: {
    dark: ['#d946ef', '#8b5cf6'],
    light: ['#aa00ff', '#6366f1'],
  },
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
  text: '#020617',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  white: '#ffffff',
  green: '#00c853',
  purple: '#aa00ff',
  blue: '#2962ff',
  chipActive: 'rgba(255, 255, 255, 0.9)',
  chipBorder: 'rgba(0, 200, 83, 0.3)',
  barTrack: 'rgba(0, 0, 0, 0.04)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export type ScreenPalette = typeof darkPalette & {
  screenGlow: string;
  screenGlowSoft: string;
  screenGlowAccent: string;
};

export function createInsightsStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
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
    // Tab row (top)
    tabRow: { marginTop: spacing.md, flexDirection: 'row', gap: 6, padding: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24 },
    tabChip: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
    tabChipActive: { backgroundColor: palette.chipActive, borderWidth: 1, borderColor: palette.chipBorder },
    tabChipText: { fontSize: 13, fontWeight: '800', color: palette.textSoft, letterSpacing: 0.2 },
    tabChipTextActive: { color: palette.text, fontWeight: '900' },

    // Section Cards
    sectionCard: { marginTop: spacing.lg, borderRadius: 32, padding: spacing.lg, backgroundColor: palette.surfaceSoft, borderWidth: 1.5, borderColor: palette.stroke },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: palette.text },
    
    // Period Toggle (Bottom of Chart)
    weekChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: palette.white === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: palette.stroke },
    weekChipText: { fontSize: 12, fontWeight: '800', color: palette.textSoft },
    periodToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 16, alignSelf: 'center', marginTop: 24 },
    periodBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12 },
    periodBtnActive: { backgroundColor: palette.white === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: palette.stroke },
    periodText: { fontSize: 13, fontWeight: '800', color: palette.textSoft },
    periodTextActive: { color: palette.text },

    // Metrics
    heroMinutes: { fontSize: 64, fontWeight: '900', color: palette.text, letterSpacing: -2 },
    heroMeta: { fontSize: 18, fontWeight: '700', color: palette.text, marginTop: -2 },
    heroDelta: { fontSize: 13, fontWeight: '700', color: palette.green, marginTop: 4 },

    // Line Chart
    chartContainer: { flexDirection: 'row', marginTop: 30, height: 140 },
    chartYAxis: { width: 35, justifyContent: 'space-between', paddingBottom: 22, height: 120 },
    chartYLabel: { fontSize: 11, fontWeight: '800', color: palette.textSoft, textAlign: 'right', paddingRight: 8 },
    chartArea: { flex: 1, height: 140, position: 'relative' },
    chartGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, justifyContent: 'space-between' },
    chartGridLine: { height: 1, backgroundColor: palette.stroke, opacity: 0.3 },
    chartXLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
    chartXLabel: { fontSize: 10, fontWeight: '900', color: palette.textSoft, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Summary Pairs (Best Day / Top Time)
    summaryGrid: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    summaryCard: { flex: 1, padding: spacing.lg, borderRadius: 28, backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.stroke },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,255,157,0.05)' },
    summaryLabel: { fontSize: 11, fontWeight: '900', color: palette.textSoft, textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 19, fontWeight: '900', color: palette.text },
    summarySub: { fontSize: 13, fontWeight: '600', color: palette.textSoft, marginTop: 4 },

    // Control Snapshot (3 columns)
    tripletGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    tripletCard: { flex: 1, padding: spacing.md, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: palette.stroke, alignItems: 'center' },
    tripletIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    tripletValue: { fontSize: 24, fontWeight: '900', color: palette.text },
    tripletLabel: { fontSize: 10, fontWeight: '800', color: palette.textSoft, textTransform: 'uppercase', marginTop: 2 },

    // Purify Progress
    purifyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    purifyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(0,255,157,0.1)' },
    purifyBadgeText: { fontSize: 11, fontWeight: '900', color: palette.green },
    
    // Timeline
    timelineWrap: { marginTop: 30, paddingHorizontal: 4 },
    timelineRow: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
    timelineDotActive: { backgroundColor: palette.purple, shadowColor: palette.purple, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
    timelineMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    timelineText: { fontSize: 11, fontWeight: '700', color: palette.textSoft },
  });
}
