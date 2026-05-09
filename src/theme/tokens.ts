export const radius = {
  sm: 14,
  md: 20,
  lg: 28,
  round: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const typography = {
  title: 30,
  heading: 20,
  body: 16,
  caption: 13,
  hero: 40,
  fontFamily: {
    thin: 'Roboto_100Thin',
    light: 'Roboto_300Light',
    regular: 'Roboto_400Regular',
    medium: 'Roboto_500Medium',
    semiBold: 'Roboto_600SemiBold',
    bold: 'Roboto_700Bold',
    black: 'Roboto_900Black',
  },
};

export const shadows = {
  card: {
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
};

export const palettes = {
  light: {
    background: '#f4f8f3',
    surface: '#ffffff',
    surfaceMuted: '#eef4ee',
    text: '#132018',
    textMuted: '#62706a',
    textPrimary: '#132018',
    textSecondary: '#4d5d56',
    textTertiary: '#73817b',
    textInverse: '#ffffff',
    textSuccess: '#157347',
    textDanger: '#b54646',
    border: '#dbe6dc',
    focus: '#1fa55b',
    focusSoft: '#dff5e8',
    amber: '#d9981f',
    amberSoft: '#fff2d7',
    red: '#db5b5b',
    redSoft: '#ffe7e7',
    blue: '#2e6ff2',
    blueSoft: '#e4edff',
    tabBar: '#fdfefd',
  },
  dark: {
    background: '#0d1711',
    surface: '#16231b',
    surfaceMuted: '#1d2c23',
    text: '#ffffff',
    textMuted: '#e2e8f0',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#08110c',
    textSuccess: '#7ee2a3',
    textDanger: '#ff9a9a',
    border: '#334155',
    focus: '#53d083',
    focusSoft: '#1f3b2a',
    amber: '#f0b13a',
    amberSoft: '#3b2d12',
    red: '#ff7a7a',
    redSoft: '#422021',
    blue: '#6f9dff',
    blueSoft: '#1d2f56',
    tabBar: '#132018',
  },
};

export type ThemePalette = typeof palettes.light;
