import React, { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBrandIcon } from '../components/AppBrandIcon';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useControlStore } from '../stores/useControlStore';
import { usePurifyStore } from '../stores/usePurifyStore';
import { spacing, typography } from '../theme/tokens';
import { AppControlTarget } from '../types/models';
import {
  countEnabledOptions,
  getAppDisplayName,
  getControlOptionDescriptors,
  sortControlsByUsage,
} from '../utils/controlOptions';

const darkPalette = {
  backgroundTop: '#0f111a',
  backgroundBottom: '#181124',
  screenGlow: 'rgba(0, 255, 170, 0.25)',
  screenGlowSoft: 'rgba(255, 51, 153, 0.2)',
  screenGlowAccent: 'rgba(51, 153, 255, 0.25)',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  surfaceMuted: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.15)',
  text: '#ffffff',
  textMuted: '#b0b8c4',
  textSoft: '#8f9bb3',
  green: '#00ff9d',
  greenSoft: 'rgba(0, 255, 157, 0.2)',
  purple: '#d946ef',
  purpleSoft: 'rgba(217, 70, 239, 0.2)',
  blue: '#38bdf8',
  blueSoft: 'rgba(56, 189, 248, 0.2)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  screenGlow: 'rgba(0, 200, 83, 0.15)',
  screenGlowSoft: 'rgba(170, 0, 255, 0.12)',
  screenGlowAccent: 'rgba(41, 98, 255, 0.15)',
  surface: 'rgba(255, 255, 255, 0.8)',
  surfaceSoft: 'rgba(255, 255, 255, 0.6)',
  surfaceMuted: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.9)',
  text: '#0f172a',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  green: '#00c853',
  greenSoft: 'rgba(0, 200, 83, 0.15)',
  purple: '#aa00ff',
  purpleSoft: 'rgba(170, 0, 255, 0.12)',
  blue: '#2962ff',
  blueSoft: 'rgba(41, 98, 255, 0.12)',
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.06)',
};

type ScreenPalette = typeof darkPalette & {
  screenGlow: string;
  screenGlowSoft: string;
  screenGlowAccent: string;
};

const safeBrowsingRows = [
  {
    key: 'strict-mode',
    label: 'Strict mode',
    subtitle: 'Blocks all distractions',
    icon: 'lock-closed-outline',
    kind: 'strict' as const,
  },
  {
    key: 'adultContentBlock',
    label: 'Adult content',
    subtitle: 'Blocks adult sites',
    icon: 'shield-checkmark-outline',
    kind: 'safe' as const,
  },
  {
    key: 'gamblingBlock',
    label: 'Gambling sites',
    subtitle: 'Blocks betting apps',
    icon: 'close-circle-outline',
    kind: 'safe' as const,
  },
] as const;

type ToggleProps = {
  value: boolean;
  onPress: () => void;
  palette: ScreenPalette;
  styles: ReturnType<typeof createStyles>;
};

function ToggleTrack({ value, onPress, palette, styles }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[
        styles.toggleTrack,
        {
          justifyContent: value ? 'flex-end' : 'flex-start',
          backgroundColor: value ? palette.green : '#64748b',
          borderColor: value ? palette.greenSoft : palette.border,
        },
      ]}
    >
      <View style={styles.toggleThumb} />
    </Pressable>
  );
}

export function ControlScreen() {
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const { mode, text } = useAppTheme();
  const controls = useControlStore((state) => state.controls);
  const safeBrowsing = useControlStore((state) => state.safeBrowsing);
  const strictModeEnabled = useControlStore((state) => state.strictModeEnabled);
  const toggleAppBlocked = useControlStore((state) => state.toggleAppBlocked);
  const toggleFeature = useControlStore((state) => state.toggleFeature);
  const toggleSafeBrowsing = useControlStore((state) => state.toggleSafeBrowsing);
  const toggleStrictMode = useControlStore((state) => state.toggleStrictMode);
  const purifyDays = usePurifyStore((state) => state.purify.currentStreakDays);
  const permissionsGranted = useControlStore((state) => state.permissionsGranted);
  const grantPermissions = useControlStore((state) => state.grantPermissions);

  const [query, setQuery] = useState('');
  const [showAllApps, setShowAllApps] = useState(false);
  const [expandedApp, setExpandedApp] = useState<AppControlTarget | null>('YouTube');
  const deferredQuery = useDeferredValue(query);
  const palette = useMemo<ScreenPalette>(
    () =>
      mode === 'dark'
        ? {
            ...darkPalette,
          }
        : {
            ...lightPalette,
          },
    [mode]
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  const sortedControls = useMemo(() => sortControlsByUsage(controls), [controls]);
  const filteredControls = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedControls;
    }

    return sortedControls.filter((control) => {
      const displayName = getAppDisplayName(control.appName).toLowerCase();
      const optionMatch = getControlOptionDescriptors(control.appName).some((option) =>
        option.label.toLowerCase().includes(normalizedQuery)
      );

      return displayName.includes(normalizedQuery) || optionMatch;
    });
  }, [deferredQuery, sortedControls]);

  const visibleControls = showAllApps ? filteredControls : filteredControls.slice(0, 3);
  const protectedApps = controls.filter(
    (control) => control.blocked || countEnabledOptions(control) > 0
  ).length;
  const enabledRuleCount =
    controls.reduce((total, control) => total + countEnabledOptions(control), 0) +
    (strictModeEnabled ? 1 : 0) +
    Number(safeBrowsing.adultContentBlock) +
    Number(safeBrowsing.gamblingBlock);
  const backgroundColors: readonly [string, string] =
    mode === 'dark'
      ? [palette.backgroundTop, palette.backgroundBottom]
      : [palette.backgroundTop, palette.backgroundBottom];
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  function handleBack() {
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColors[0]} />

      <AnimatedThemeBackdrop
        colors={backgroundColors}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={palette.screenGlowAccent}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
        >
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.topIconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <Text style={styles.topTitle}>App Control</Text>

            <View style={styles.topIconButton}>
              <Ionicons name="shield-checkmark-outline" size={18} color={palette.text} />
            </View>
          </View>

          <Text style={styles.helperText}>
            Guard your focus by controlling app access.
          </Text>

          {!permissionsGranted ? (
            <View style={styles.permissionCard}>
              <Ionicons name="shield-half" size={54} color={palette.purple} style={{ alignSelf: 'center', marginTop: spacing.md }} />
              <Text style={styles.permissionTitle}>Setup Device Access</Text>
              <Text style={styles.permissionSubtitle}>
                To enable absolute app constraints and automatic distraction filtering, FocusZen requires Usage Statistics Access.
              </Text>
              
              <View style={styles.permissionBadgeRow}>
                <View style={styles.permissionBadge}>
                  <Ionicons name="eye-outline" size={16} color={palette.blue} />
                  <Text style={[styles.permissionBadgeText, { color: palette.blue }]}>Read Usage</Text>
                </View>
                <View style={styles.permissionBadge}>
                  <Ionicons name="hand-left-outline" size={16} color={palette.green} />
                  <Text style={[styles.permissionBadgeText, { color: palette.green }]}>Enforce Blocks</Text>
                </View>
              </View>

              <Pressable style={styles.permissionBtn} onPress={grantPermissions}>
                <Text style={styles.permissionBtnText}>Activate Controls</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: palette.green }]}>{protectedApps}</Text>
                  <Text style={styles.metricLabel}>Protected</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: palette.purple }]}>{enabledRuleCount}</Text>
                  <Text style={styles.metricLabel}>Rules</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: palette.blue }]}>{purifyDays}</Text>
                  <Text style={styles.metricLabel}>Streak</Text>
                </View>
              </View>

              <View style={styles.searchShell}>
                <Ionicons name="search-outline" size={20} color={palette.textSoft} />
                <TextInput
                  value={query}
                  onChangeText={(nextValue) => {
                    startTransition(() => setQuery(nextValue));
                  }}
              placeholder="Search apps or blockers"
              placeholderTextColor={palette.textSoft}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionEyebrow}>Blocked apps</Text>

            {visibleControls.map((control) => {
              const subtitle = control.blocked
                ? 'Blocked'
                : countEnabledOptions(control) > 0
                  ? `${countEnabledOptions(control)} active rule${countEnabledOptions(control) > 1 ? 's' : ''}`
                  : 'Available';

              const optionDescriptors = getControlOptionDescriptors(control.appName);
              const expanded = expandedApp === control.appName;

              return (
                <View key={control.appName} style={styles.appShell}>
                  <Pressable
                    onPress={() =>
                      setExpandedApp((current) =>
                        current === control.appName ? null : control.appName
                      )
                    }
                    style={styles.appRow}
                  >
                    <View style={styles.appIdentity}>
                      <AppBrandIcon appName={control.appName} size={40} />
                      <View style={styles.appCopy}>
                        <Text style={styles.appTitle}>{getAppDisplayName(control.appName)}</Text>
                        <Text style={styles.appSubtitle}>{subtitle}</Text>
                      </View>
                    </View>

                    <View style={styles.appActions}>
                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={palette.textSoft}
                      />
                      <ToggleTrack
                        value={control.blocked}
                        onPress={() => {
                          toggleAppBlocked(control.appName as AppControlTarget);
                          const isNowBlocked = !control.blocked;
                          Alert.alert(
                            isNowBlocked ? 'App restricted' : 'Access restored',
                            isNowBlocked
                              ? `All distractions on ${getAppDisplayName(control.appName)} are now safely locked down.`
                              : `${getAppDisplayName(control.appName)} limits have been removed.`
                          );
                        }}
                        palette={palette}
                        styles={styles}
                      />
                    </View>
                  </Pressable>

                  {expanded && optionDescriptors.length > 0 ? (
                    <View style={styles.optionPanel}>
                      {optionDescriptors.map((option) => (
                        <View key={option.key} style={styles.optionRow}>
                          <View style={styles.optionIdentity}>
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={palette.textMuted}
                            />
                            <Text style={styles.optionLabel}>{option.label}</Text>
                          </View>
                          <ToggleTrack
                            value={Boolean(control.features[option.key])}
                            onPress={() => toggleFeature(control.appName, option.key)}
                            palette={palette}
                            styles={styles}
                          />
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}

            {filteredControls.length === 0 ? (
              <Text style={styles.emptyText}>No matching apps found.</Text>
            ) : null}

            {filteredControls.length > 3 ? (
              <Pressable
                onPress={() => setShowAllApps((current) => !current)}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>{showAllApps ? 'Show less' : 'View all'}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionEyebrow}>Protection modes</Text>

            {safeBrowsingRows.map((row) => {
              const value =
                row.kind === 'strict' ? strictModeEnabled : safeBrowsing[row.key];

              return (
                <View key={row.key} style={styles.modeRow}>
                  <View style={styles.modeIdentity}>
                    <View style={styles.modeIconWrap}>
                      <Ionicons name={row.icon} size={18} color={palette.textMuted} />
                    </View>

                    <View style={styles.modeCopy}>
                      <Text style={styles.modeTitle}>{row.label}</Text>
                      <Text style={styles.modeSubtitle}>{row.subtitle}</Text>
                    </View>
                  </View>

                  <ToggleTrack
                    value={Boolean(value)}
                    onPress={() =>
                      row.kind === 'strict'
                        ? toggleStrictMode()
                        : toggleSafeBrowsing(row.key)
                    }
                    palette={palette}
                    styles={styles}
                  />
                </View>
              );
            })}
            </View>
          </>
        )}
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}

function createStyles(palette: ScreenPalette) {
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
    borderColor: palette.border,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  helperText: {
    marginTop: spacing.xl,
    maxWidth: 260,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: palette.textMuted,
  },
  metricsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  metricValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchShell: {
    marginTop: spacing.md,
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: palette.text,
  },
  card: {
    marginTop: spacing.md,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  sectionEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: palette.textMuted,
  },
  appRow: {
    marginTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 194, 184, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  appShell: {
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(180, 194, 184, 0.08)',
  },
  appIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appCopy: {
    flex: 1,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.2,
  },
  appSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
    color: palette.textMuted,
  },
  appActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionPanel: {
    marginBottom: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  optionIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: palette.text,
    textTransform: 'capitalize',
  },
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 999,
    paddingHorizontal: 3,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8fffa',
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  viewAllButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.green,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: palette.textMuted,
  },
  modeRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modeIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceMuted,
  },
  modeCopy: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.2,
  },
  modeSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
    color: palette.textMuted,
  },
  permissionCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  permissionTitle: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  permissionSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: palette.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  permissionBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: palette.surfaceSoft,
  },
  permissionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  permissionBtn: {
    width: '100%',
    marginTop: spacing.xl,
    height: 52,
    borderRadius: 16,
    backgroundColor: palette.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.purple,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  permissionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  });
}
