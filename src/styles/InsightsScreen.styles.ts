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
  tabRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: palette.chipActive,
    borderWidth: 1,
    borderColor: palette.chipBorder,
    shadowColor: palette.green,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.textSoft,
    letterSpacing: 0.2,
  },
  tabChipTextActive: {
    color: palette.text,
    fontWeight: '900',
  },
  sectionCard: {
    marginTop: spacing.lg,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.5,
  },
  weekChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: palette.surfaceSoft,
  },
  weekChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSoft,
  },
  heroMinutes: {
    marginTop: spacing.lg,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '900',
    color: palette.text,
    letterSpacing: -1,
  },
  heroMeta: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDelta: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: palette.green,
  },
  barChartRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
  },
  barTopValue: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.textSoft,
  },
  barTrack: {
    width: 32,
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barGlow: {
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSoft,
  },
  barLabelActive: {
    color: palette.green,
  },
  summaryGrid: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
  },
  summaryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft || 'rgba(0,255,157,0.1)',
    marginBottom: 8,
  },
  summaryIconWrapPurple: {
    backgroundColor: 'rgba(217,70,239,0.1)',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  filterRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: palette.surfaceSoft,
  },
  filterChipActive: {
    backgroundColor: palette.green,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSoft,
  },
  filterChipTextActive: {
    color: palette.backgroundTop,
  },
  usageList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  usageLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  usageCopy: {
    flex: 1,
    gap: 4,
  },
  usageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  usageMeterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.barTrack,
    overflow: 'hidden',
  },
  usageMeterFill: {
    height: '100%',
    borderRadius: 3,
  },
  usageMinutes: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.text,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textSoft,
    textAlign: 'center',
  },
  inlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.greenSoft || 'rgba(0,255,157,0.1)',
  },
  inlineBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.green,
  },
  metricTriplet: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricTile: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: palette.surfaceSoft,
  },
  metricTileValue: {
    fontSize: 24,
    fontWeight: '900',
    color: palette.text,
  },
  metricTileLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: palette.textSoft,
    textTransform: 'uppercase',
  },
  detailCard: {
    marginTop: spacing.md,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  detailMeta: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: palette.textMuted,
  },
  milestonesList: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: palette.surfaceSoft,
  },
  milestoneDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.barTrack,
  },
  milestoneDotReached: {
    backgroundColor: palette.green,
  },
  milestoneDotNext: {
    backgroundColor: palette.purple,
  },
  milestoneCopy: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.text,
  },
  milestoneMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSoft,
  },
  milestoneState: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textSoft,
  },
  milestoneStateReached: {
    color: palette.green,
  },
  milestoneStateNext: {
    color: palette.purple,
  },
  });
}
