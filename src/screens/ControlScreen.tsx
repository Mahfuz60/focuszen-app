import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBrandIcon, getAppColor } from "../components/AppBrandIcon";
import { AnimatedThemeBackdrop } from "../components/AnimatedThemeBackdrop";
import { useControlStore } from "../stores/useControlStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { usePurifyStore } from "../stores/usePurifyStore";
import { useAppTheme } from "../hooks/useAppTheme";
import { spacing } from "../theme/tokens";
import {
  createControlStyles as createStyles,
} from "../styles/ControlScreen.styles";
import { ScreenPalette } from '../theme/screenPalettes';
import { AppControlTarget } from "../types/models";
import {
  countEnabledOptions,
  getAppDisplayName,
  getControlOptionDescriptors,
  sortControlsByUsage,
} from "../utils/controlOptions";

const safeBrowsingRows = [
  {
    key: "strict-mode",
    label: "Strict mode",
    subtitle: "Blocks all distractions",
    icon: "lock-closed-outline",
    kind: "strict" as const,
  },
  {
    key: "adultContentBlock",
    label: "Adult content",
    subtitle: "Blocks adult sites",
    icon: "shield-checkmark-outline",
    kind: "safe" as const,
  },
  {
    key: "gamblingBlock",
    label: "Gambling sites",
    subtitle: "Blocks betting apps",
    icon: "close-circle-outline",
    kind: "safe" as const,
  },
] as const;

type ToggleProps = {
  value: boolean;
  onPress: () => void;
  palette: ScreenPalette;
  styles: ReturnType<typeof createStyles>;
  mode: "light" | "dark";
  activeColor?: string;
  disabled?: boolean;
  onDisabledPress?: () => void;
};

function ToggleTrack({
  value,
  onPress,
  palette,
  styles,
  mode,
  activeColor,
  disabled = false,
  onDisabledPress,
}: ToggleProps) {
  const enabledColor = activeColor || palette.green;
  const inactiveColor = mode === "dark" ? "#334155" : "#cbd5e1";
  const thumbColor = mode === "dark" ? "#ffffff" : "#111827";
  const displayValue = disabled ? false : value;
  return (
    <Pressable
      onPress={() => {
        if (disabled) {
          onDisabledPress?.();
          return;
        }
        onPress();
      }}
      style={{ padding: 4 }}
    >
      <View pointerEvents="none">
        <Switch
          ios_backgroundColor={inactiveColor}
          style={styles.toggleSwitch}
          thumbColor={thumbColor}
          trackColor={{ false: inactiveColor, true: enabledColor }}
          value={displayValue}
        />
      </View>
    </Pressable>
  );
}

export function ControlScreen() {
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('control'), [getPalette]);
  const styles = useMemo(
    () => createStyles(palette, mode),
    [palette, mode],
  );
  const controls = useControlStore((state) => state.controls);
  const safeBrowsing = useControlStore((state) => state.safeBrowsing);
  const strictModeEnabled = useControlStore((state) => state.strictModeEnabled);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const currentThemeMode = useSettingsStore((state) => state.settings.themeMode);
  const toggleFeature = useControlStore((state) => state.toggleFeature);
  const toggleSafeBrowsing = useControlStore((state) => state.toggleSafeBrowsing);
  const toggleStrictMode = useControlStore((state) => state.toggleStrictMode);
  const purifyDays = usePurifyStore((state) => state.purify.currentStreakDays);
  const checkPermissions = useControlStore((state) => state.checkPermissions);
  const requestPermissions = useControlStore((state) => state.requestPermissions);
  const syncAllSettings = useControlStore((state) => state.syncAllSettings);
  const permissionsGranted = useControlStore(
    (state) => state.permissionsGranted,
  );
  const controlsLocked = !permissionsGranted;

  // NEW: Check permissions on mount and when app comes to foreground
  useEffect(() => {
    checkPermissions();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });
    
    return () => subscription.remove();
  }, [checkPermissions]);

  // Sync all settings when permissions are granted OR when app comes to foreground
  useEffect(() => {
    if (permissionsGranted) {
      syncAllSettings();
    }
  }, [permissionsGranted, syncAllSettings]);

  const [query, setQuery] = useState("");
  const [showAllApps, setShowAllApps] = useState(false);
  const [expandedApp, setExpandedApp] = useState<AppControlTarget | null>(
    "YouTube",
  );
  const deferredQuery = useDeferredValue(query);

  const sortedControls = useMemo(
    () => sortControlsByUsage(controls),
    [controls],
  );
  const filteredControls = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedControls;
    }

    return sortedControls.filter((control) => {
      const displayName = getAppDisplayName(control.appName).toLowerCase();
      const optionMatch = getControlOptionDescriptors(control.appName).some(
        (option) => option.label.toLowerCase().includes(normalizedQuery),
      );

      return displayName.includes(normalizedQuery) || optionMatch;
    });
  }, [deferredQuery, sortedControls]);

  const visibleControls = showAllApps
    ? filteredControls
    : filteredControls.slice(0, 3);
  const protectedApps = controls.filter(
    (control) => countEnabledOptions(control) > 0,
  ).length;
  const enabledRuleCount =
    controls.reduce(
      (total, control) => total + countEnabledOptions(control),
      0,
    ) +
    (strictModeEnabled ? 1 : 0) +
    Number(safeBrowsing.adultContentBlock) +
    Number(safeBrowsing.gamblingBlock);
  const metricCards = [
    {
      key: "protected",
      value: protectedApps,
      label: "Protected",
      caption: "Apps blocked",
      icon: "shield-checkmark-outline",
      color: palette.green,
      backgroundColor: palette.greenSoft,
    },
    {
      key: "rules",
      value: enabledRuleCount,
      label: "Rules",
      caption: "Active rules",
      icon: "list-outline",
      color: palette.purple,
      backgroundColor: palette.purpleSoft,
    },
    {
      key: "streak",
      value: purifyDays,
      label: "Streak",
      caption: "Days streak",
      icon: "flame",
      color: palette.blue,
      backgroundColor: palette.blueSoft,
    },
  ] as const;
  const backgroundColors: readonly [string, string] = [
    palette.backgroundTop,
    palette.backgroundBottom,
  ];
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  function handleBack() {
    navigation.navigate("Home");
  }

  function handlePermissionRequired() {
    Alert.alert(
      "Device access required",
      "Enable Accessibility Service to activate app blocking.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Settings", 
          onPress: () => {
            requestPermissions();
            // Check again after a delay (user might enable it)
            setTimeout(() => checkPermissions(), 1000);
          }
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColors[0]}
      />

      <AnimatedThemeBackdrop
        colors={backgroundColors}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={palette.screenGlowAccent}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarHeight + spacing.xl },
          ]}
        >
          <View style={styles.heroSection}>
            <View pointerEvents="none" style={styles.heroArt}>
              <View style={styles.heroRingOuter} />
              <View style={styles.heroRingMiddle} />
              <View style={styles.heroShield}>
                <Ionicons
                  name="shield-checkmark"
                  size={64}
                  color={palette.green}
                />
              </View>
            </View>

            <View style={styles.topBar}>
              <Pressable onPress={handleBack} style={styles.topIconButton}>
                <Ionicons name="arrow-back" size={24} color={palette.text} />
              </Pressable>

              <Text style={styles.topTitle}>App Control</Text>

              <Pressable 
                onPress={() => navigation.navigate('Insights')}
                style={styles.topIconButton}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={palette.text}
                />
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              Guard your focus by controlling app access.
            </Text>
          </View>

          {!permissionsGranted ? (
            <View style={styles.permissionCard}>
              <Ionicons
                name="shield-half"
                size={54}
                color={palette.purple}
                style={styles.permissionIcon}
              />
              <Text style={styles.permissionTitle}>Setup Device Access</Text>
              <Text style={styles.permissionSubtitle}>
                To enable absolute app constraints and automatic distraction
                filtering, FocusZen requires Usage Statistics Access.
              </Text>

              <View style={styles.permissionBadgeRow}>
                <View style={styles.permissionBadge}>
                  <Ionicons name="eye-outline" size={16} color={palette.blue} />
                  <Text
                    style={[
                      styles.permissionBadgeText,
                      { color: palette.blue },
                    ]}
                  >
                    Read Usage
                  </Text>
                </View>
                <View style={styles.permissionBadge}>
                  <Ionicons
                    name="hand-left-outline"
                    size={16}
                    color={palette.green}
                  />
                  <Text
                    style={[
                      styles.permissionBadgeText,
                      { color: palette.green },
                    ]}
                  >
                    Enforce Blocks
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.permissionBtn}
                onPress={requestPermissions}
              >
                <Text style={styles.permissionBtnText}>Activate Controls</Text>
              </Pressable>
            </View>
          ) : null}
              <View style={styles.metricsRow}>
                {metricCards.map((metric) => (
                  <View key={metric.key} style={[styles.metricCard, {
                    borderColor: mode === 'dark' ? `${metric.color}40` : `${metric.color}20`,
                    shadowColor: metric.color,
                    shadowOpacity: mode === 'dark' ? 0.35 : 0.12,
                    shadowRadius: 15,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                    backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
                    borderWidth: 1,
                  }]}>
                    <View
                      style={[
                        styles.metricIcon,
                        { backgroundColor: metric.backgroundColor },
                      ]}
                    >
                      <Ionicons
                        name={metric.icon}
                        size={21}
                        color={metric.color}
                      />
                    </View>
                    <View style={styles.metricCopy}>
                      <Text
                        style={[styles.metricValue, { color: metric.color }]}
                      >
                        {metric.value}
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                        numberOfLines={1}
                        style={styles.metricLabel}
                      >
                        {metric.label}
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        minimumFontScale={0.72}
                        numberOfLines={1}
                        style={styles.metricCaption}
                      >
                        {metric.caption}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.searchShell}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={palette.textSoft}
                />
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

              <View style={[styles.card, {
                borderColor: mode === 'dark' ? `${palette.purple}30` : `${palette.purple}15`,
                shadowColor: palette.purple,
                shadowOpacity: mode === 'dark' ? 0.25 : 0.08,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
                backgroundColor: mode === 'dark' ? 'rgba(12, 16, 26, 0.95)' : '#ffffff',
              }]}>
                <Text style={styles.sectionEyebrow}>Blocked apps</Text>

                {visibleControls.map((control) => {
                  const enabledOptionCount = countEnabledOptions(control);
                  const subtitle = controlsLocked
                    ? "Setup required"
                    : enabledOptionCount > 0
                      ? `${enabledOptionCount} active rule${enabledOptionCount > 1 ? "s" : ""}`
                      : "Available";
                  const subtitleStyle = controlsLocked
                    ? styles.appSubtitleRule
                    : enabledOptionCount > 0
                      ? styles.appSubtitleRule
                      : styles.appSubtitleAvailable;

                  const optionDescriptors = getControlOptionDescriptors(
                    control.appName,
                  );
                  const expanded = expandedApp === control.appName;
                  const appColor = getAppColor(control.appName);

                  return (
                    <View
                      key={control.appName}
                      style={[
                        styles.appShell,
                        expanded ? styles.appShellExpanded : null,
                        {
                          borderColor: mode === 'dark' ? `${appColor}50` : `${appColor}28`,
                          shadowColor: appColor,
                          shadowOpacity: mode === 'dark' ? 0.4 : 0.15,
                          shadowRadius: 18,
                          shadowOffset: { width: 0, height: 6 },
                          elevation: 8,
                          backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
                        }
                      ]}
                    >
                      <Pressable
                        onPress={() =>
                          setExpandedApp((current) =>
                            current === control.appName
                              ? null
                              : control.appName,
                          )
                        }
                        style={styles.appRow}
                      >
                        <View style={styles.appIdentity}>
                          <AppBrandIcon appName={control.appName} size={40} />
                          <View style={styles.appCopy}>
                            <Text style={styles.appTitle}>
                              {getAppDisplayName(control.appName)}
                            </Text>
                            <Text style={[styles.appSubtitle, subtitleStyle]}>
                              {subtitle}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.appActions}>
                          <Ionicons
                            name={expanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={palette.textSoft}
                          />
                        </View>
                      </Pressable>

                      {expanded && optionDescriptors.length > 0 ? (
                        <View style={styles.optionPanel}>
                          {optionDescriptors.map((option, index) => (
                            <View
                              key={option.key}
                              style={[
                                styles.optionRow,
                                index > 0 ? styles.optionRowDivider : null,
                              ]}
                            >
                              <View style={styles.optionIdentity}>
                                <Ionicons
                                  name={option.icon}
                                  size={18}
                                  color={palette.textMuted}
                                />
                                <Text style={styles.optionLabel}>
                                  {option.label}
                                </Text>
                              </View>
                              <ToggleTrack
                                value={control.features[option.key] ?? false}
                                  onPress={() => {
                                    if (strictModeEnabled) {
                                      Alert.alert(
                                        "Strict Mode Active",
                                        "You cannot change rules while Strict Mode is enabled.",
                                      );
                                      return;
                                    }
                                    toggleFeature(control.appName, option.key);
                                  }}
                                disabled={controlsLocked}
                                onDisabledPress={handlePermissionRequired}
                                palette={palette}
                                styles={styles}
                                mode={mode}
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
                    <Text style={styles.viewAllText}>
                      {showAllApps ? "Show less" : "View all"}
                    </Text>
                    <Ionicons
                      name={showAllApps ? "chevron-up" : "chevron-forward"}
                      size={18}
                      color={palette.green}
                    />
                  </Pressable>
                ) : null}
              </View>

              <View style={[styles.card, {
                borderColor: mode === 'dark' ? `${palette.green}40` : `${palette.green}20`,
                shadowColor: palette.green,
                shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
                backgroundColor: mode === 'dark' ? 'rgba(10,16,26,0.97)' : '#ffffff',
              }]}>
                <Text style={styles.sectionEyebrow}>Protection modes</Text>

                {safeBrowsingRows.map((row, index) => {
                  const value =
                    row.kind === "strict"
                      ? strictModeEnabled
                      : safeBrowsing[row.key];

                  return (
                    <View
                      key={row.key}
                      style={[
                        styles.modeRow,
                        index === 0 ? styles.modeRowFirst : null,
                      ]}
                    >
                      <View style={styles.modeIdentity}>
                        <View style={styles.modeIconWrap}>
                          <Ionicons
                            name={row.icon}
                            size={18}
                            color={palette.green}
                          />
                        </View>

                        <View style={styles.modeCopy}>
                          <Text style={styles.modeTitle}>{row.label}</Text>
                          <Text style={styles.modeSubtitle}>
                            {row.subtitle}
                          </Text>
                        </View>
                      </View>

                      <ToggleTrack
                        value={Boolean(value)}
                        onPress={() =>
                          row.kind === "strict"
                            ? toggleStrictMode()
                            : toggleSafeBrowsing(row.key)
                        }
                        disabled={controlsLocked}
                        onDisabledPress={handlePermissionRequired}
                        palette={palette}
                        styles={styles}
                        mode={mode}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={[styles.card, {
                borderColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
                shadowColor: '#3b82f6',
                shadowOpacity: mode === 'dark' ? 0.25 : 0.08,
                shadowRadius: 20,
                elevation: 6,
                backgroundColor: mode === 'dark' ? 'rgba(12, 16, 26, 0.95)' : '#ffffff',
                marginTop: spacing.md,
                paddingBottom: 24,
              }]}>
                <Text style={styles.sectionEyebrow}>Appearance</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  {(['system', 'light', 'dark'] as const).map((t) => {
                    // Ensure it always selects 'system' by default if no preference is found
                    const active = (currentThemeMode || 'system') === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setThemeMode(t)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 16,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active 
                            ? (mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)')
                            : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                          borderWidth: 1,
                          borderColor: active ? '#3b82f6' : 'transparent',
                        }}
                      >
                        <Ionicons 
                          name={t === 'system' ? 'settings-outline' : t === 'light' ? 'sunny-outline' : 'moon-outline'} 
                          size={18} 
                          color={active ? '#3b82f6' : (mode === 'dark' ? '#94a3b8' : '#64748b')} 
                        />
                        <Text style={{ 
                          fontSize: 10, 
                          fontWeight: 'bold', 
                          marginTop: 4, 
                          color: active ? '#3b82f6' : (mode === 'dark' ? '#94a3b8' : '#64748b'),
                          textTransform: 'uppercase'
                        }}>
                          {t}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
