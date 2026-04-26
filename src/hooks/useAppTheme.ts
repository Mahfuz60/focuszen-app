import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { palettes } from '../theme/tokens';
import { useSettingsStore } from '../stores/useSettingsStore';

export function useAppTheme() {
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();

  return useMemo(() => {
    const resolvedMode =
      themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
    const palette = palettes[resolvedMode];

    return {
      mode: resolvedMode,
      colors: palette,
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
        tertiary: palette.textTertiary,
        inverse: palette.textInverse,
        success: palette.textSuccess,
        danger: palette.textDanger,
      },
    };
  }, [systemScheme, themeMode]);
}
