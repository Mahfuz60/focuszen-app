import { StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';

import { ScreenPalette } from '../theme/screenPalettes';

export function createGoalsMissionStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  levels: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  supportText: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    lineHeight: 24,
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  heading: {
    fontSize: typography.heading,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    fontWeight: '700',
  },
  badges: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
  },
});
}
