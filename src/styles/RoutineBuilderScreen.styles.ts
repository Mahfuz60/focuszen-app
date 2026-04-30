import { StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';

export const darkPalette = {
  text: '#ffffff',
  textMuted: '#94a3b8',
};

export const lightPalette = {
  text: '#020617',
  textMuted: '#64748b',
};

export type ScreenPalette = typeof darkPalette;

export function createRoutineStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    supportText: {
      marginTop: spacing.xs,
      fontSize: typography.body,
      lineHeight: 24,
      color: palette.textMuted,
    },
    steps: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    stepRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'center',
    },
    rowTitle: {
      fontSize: typography.body,
      fontWeight: '800',
      color: palette.text,
    },
  });
}
