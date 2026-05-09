import { useColorScheme } from 'react-native';
import { useMemo, useCallback } from 'react';
import { palettes } from '../theme/tokens';
import { useSettingsStore } from '../stores/useSettingsStore';
import { getScreenPalette, ScreenPalette } from '../theme/screenPalettes';

export function useAppTheme() {
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const isHydrated = useSettingsStore((state) => state._hasHydrated);
  const systemScheme = useColorScheme();

  const mode = useMemo(() => {
    const resolved = themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
    // console.log(`[ThemeDebug] Resolved: ${resolved} | Pref: ${themeMode} | Sys: ${systemScheme} | Hydrated: ${isHydrated}`);
    return resolved;
  }, [systemScheme, themeMode, isHydrated]);

  const colors = palettes[mode];

  const getPalette = useCallback((screen: string): ScreenPalette => {
    return getScreenPalette(mode, screen);
  }, [mode]);

  return {
    mode,
    colors,
    getPalette,
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
      inverse: colors.textInverse,
      success: colors.textSuccess,
      danger: colors.textDanger,
    },
  };
}
