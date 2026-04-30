import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = (colors: any, text: any) => ({
  backgroundTop: '#101917',
  backgroundBottom: '#15231d',
  screenGlow: 'rgba(83, 208, 131, 0.14)',
  screenGlowSoft: 'rgba(111, 157, 255, 0.08)',
  surface: '#17251e',
  surfaceSoft: '#1c2c24',
  stroke: '#25382d',
  text: text.primary,
  textMuted: text.secondary,
  green: colors.focus,
  greenDeep: '#1f7a46',
  buttonEnabled: '#1f7a46',
  buttonDisabled: '#2a4135',
  inputText: '#ffffff',
  statusBar: 'light-content' as const,
  shadow: 'rgba(3, 9, 18, 0.28)',
  buttonText: '#f8fffa',
  buttonTextDisabled: '#bdd2c3',
});

export const lightPalette = (colors: any, text: any) => ({
  backgroundTop: '#f7fbf7',
  backgroundBottom: '#e6f1e8',
  screenGlow: 'rgba(31, 165, 91, 0.1)',
  screenGlowSoft: 'rgba(46, 111, 242, 0.06)',
  surface: '#ffffff',
  surfaceSoft: '#f1f7f2',
  stroke: '#d7e5d9',
  text: text.primary,
  textMuted: text.secondary,
  green: colors.focus,
  greenDeep: '#1f7a46',
  buttonEnabled: '#1f7a46',
  buttonDisabled: '#82c196',
  inputText: '#132018',
  statusBar: 'dark-content' as const,
  shadow: 'rgba(19, 32, 24, 0.1)',
  buttonText: '#ffffff',
  buttonTextDisabled: '#eff6f1',
});

export type ScreenPalette = ReturnType<typeof darkPalette>;

export const nameSetupStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    maxWidth: 320,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 300,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    marginTop: spacing.xl,
    borderRadius: 26,
    padding: spacing.md,
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    marginTop: spacing.sm,
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  previewWrap: {
    marginTop: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 14,
  },
  previewText: {
    marginTop: spacing.xs,
    fontSize: 20,
    fontWeight: '800',
  },
  button: {
    marginTop: spacing.lg,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
