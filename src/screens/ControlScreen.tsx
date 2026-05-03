import React, {
  startTransition,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
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
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBrandIcon } from "../components/AppBrandIcon";
import { AnimatedThemeBackdrop } from "../components/AnimatedThemeBackdrop";
import { useControlStore } from "../stores/useControlStore";
import { usePurifyStore } from "../stores/usePurifyStore";
import { useAppTheme } from "../hooks/useAppTheme";
import { spacing } from "../theme/tokens";
import {
  createControlStyles as createStyles,
  darkPalette,
  fontFamily,
  lightPalette,
  ScreenPalette,
} from "../styles/ControlScreen.styles";
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
  const { mode } = useAppTheme();
  const colorScheme = useColorScheme();
  const resolvedMode =
    mode === "dark" || colorScheme === "dark" ? "dark" : "light";
  const controls = useControlStore((state) => state.controls);
  const safeBrowsing = useControlStore((state) => state.safeBrowsing);
  const strictModeEnabled = useControlStore((state) => state.strictModeEnabled);
  const toggleFeature = useControlStore((state) => state.toggleFeature);
  const toggleSafeBrowsing = useControlStore(
    (state) => state.toggleSafeBrowsing,
  );
  const toggleStrictMode = useControlStore((state) => state.toggleStrictMode);
  const purifyDays = usePurifyStore((state) => state.purify.currentStreakDays);
  const permissionsGranted = useControlStore(
    (state) => state.permissionsGranted,
  );
  const grantPermissions = useControlStore((state) => state.grantPermissions);
  const controlsLocked = !permissionsGranted;

  const [query, setQuery] = useState("");
  const [showAllApps, setShowAllApps] = useState(false);
  const [expandedApp, setExpandedApp] = useState<AppControlTarget | null>(
    "YouTube",
  );
  const deferredQuery = useDeferredValue(query);
  const palette = useMemo<ScreenPalette>(
    () => (resolvedMode === "dark" ? darkPalette : lightPalette),
    [resolvedMode],
  );
  const styles = useMemo(
    () => createStyles(palette, resolvedMode),
    [palette, resolvedMode],
  );

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
  const statusBarStyle = "light-content";

  function handleBack() {
    navigation.navigate("Home");
  }

  function handlePermissionRequired() {
    Alert.alert(
      "Device access required",
      "Enable Usage Access before turning on app blocks.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Setup access", onPress: grantPermissions },
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
        mode={resolvedMode}
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

              <View style={styles.topIconButton}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={palette.text}
                />
              </View>
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
                onPress={grantPermissions}
              >
                <Text style={styles.permissionBtnText}>Activate Controls</Text>
              </Pressable>
            </View>
          ) : null}
              <View style={styles.metricsRow}>
                {metricCards.map((metric) => (
                  <View key={metric.key} style={styles.metricCard}>
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

              <View style={styles.card}>
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

                  return (
                    <View
                      key={control.appName}
                      style={[
                        styles.appShell,
                        expanded ? styles.appShellExpanded : null,
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
                                mode={resolvedMode}
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

              <View style={styles.card}>
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
                        mode={resolvedMode}
                      />
                    </View>
                  );
                })}
              </View>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}
