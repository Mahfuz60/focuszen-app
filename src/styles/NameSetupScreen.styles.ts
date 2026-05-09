import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

import { ScreenPalette } from '../theme/screenPalettes';

export function createNameSetupStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.green,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    maxWidth: 320,
    color: palette.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 300,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
  card: {
    marginTop: spacing.xl,
    borderRadius: 26,
    padding: spacing.md,
    borderWidth: 1,
    backgroundColor: palette.surface,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textMuted,
  },
  input: {
    marginTop: spacing.sm,
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.stroke,
    color: palette.inputText,
  },
  previewWrap: {
    marginTop: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.stroke,
  },
  previewLabel: {
    fontSize: 14,
    color: palette.textMuted,
  },
  previewText: {
    marginTop: spacing.xs,
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  button: {
    marginTop: spacing.lg,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonActive: {
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
}
