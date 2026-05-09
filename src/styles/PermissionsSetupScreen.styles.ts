import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

import { ScreenPalette } from '../theme/screenPalettes';

export function createPermissionsStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.xl,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: palette.green,
  },
  title: {
    marginTop: spacing.md,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    maxWidth: 320,
    letterSpacing: -0.5,
    color: palette.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: palette.textMuted,
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    backgroundColor: palette.surface,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: palette.text,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: palette.textMuted,
  },
  button: {
    marginTop: spacing.xl + spacing.md,
    minHeight: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
}
