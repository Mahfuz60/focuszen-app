import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#0a0f0d',
  backgroundBottom: '#111b17',
  screenGlow: 'rgba(83, 208, 131, 0.08)',
  screenGlowSoft: 'rgba(111, 157, 255, 0.05)',
  surface: '#15201b',
  surfaceSoft: '#1a2721',
  stroke: '#22352c',
  text: '#ffffff',
  textMuted: '#9ab3a5',
  green: '#2ecc71',
  buttonEnabled: '#2ecc71',
  statusBar: 'light-content' as const,
  shadow: 'rgba(0, 0, 0, 0.4)',
  buttonText: '#000000',
  iconColor: '#2ecc71',
  iconBg: 'rgba(46, 204, 113, 0.15)',
};

export const lightPalette = {
  backgroundTop: '#ffffff',
  backgroundBottom: '#f0f5f2',
  screenGlow: 'rgba(46, 204, 113, 0.08)',
  screenGlowSoft: 'rgba(46, 111, 242, 0.04)',
  surface: '#ffffff',
  surfaceSoft: '#f7fbf8',
  stroke: '#e2ece5',
  text: '#111b17',
  textMuted: '#5c7365',
  green: '#1fa55b',
  buttonEnabled: '#1fa55b',
  statusBar: 'dark-content' as const,
  shadow: 'rgba(17, 27, 23, 0.06)',
  buttonText: '#ffffff',
  iconColor: '#1fa55b',
  iconBg: 'rgba(31, 165, 91, 0.1)',
};

export type ScreenPalette = typeof darkPalette;

export const permissionsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  title: {
    marginTop: spacing.md,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    maxWidth: 320,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
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
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    marginTop: spacing.xl + spacing.md,
    minHeight: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
