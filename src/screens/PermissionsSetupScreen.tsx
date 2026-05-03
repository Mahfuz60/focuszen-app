import React, { useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Alert,
  NativeModules,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useControlStore } from '../stores/useControlStore';
import { spacing } from '../theme/tokens';
import {
  permissionsStyles as styles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/PermissionsSetupScreen.styles';

const { PermissionChecker } = NativeModules;

export function PermissionsSetupScreen() {
  const navigation = useNavigation<any>();
  const { colors, mode, text } = useAppTheme();
  const completePermissionsSetup = useSettingsStore((state) => state.completePermissionsSetup);
  const grantPermissions = useControlStore((state) => state.grantPermissions);

  const [completed, setCompleted] = useState<Record<string, boolean>>({
    usage: false,
    accessibility: false,
    overlay: false,
    battery: false,
  });

  const checkAllPermissions = async () => {
    if (Platform.OS !== 'android' || !PermissionChecker) return;
    
    const usage = await PermissionChecker.checkUsageAccess();
    const accessibility = await PermissionChecker.checkAccessibility();
    const overlay = await PermissionChecker.checkOverlay();
    const battery = await PermissionChecker.checkBatteryOptimization();

    setCompleted({
      usage,
      accessibility,
      overlay,
      battery,
    });
  };

  useEffect(() => {
    // Initial check when screen loads
    checkAllPermissions();

    // Re-check when app comes back to foreground from settings
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAllPermissions();
      }
    });

    return () => subscription.remove();
  }, []);
  const palette = useMemo(
    () => (mode === 'dark' ? darkPalette : lightPalette),
    [mode]
  );

  const openSettings = async (action: string, key: string) => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(action);
      } catch (e) {
        console.warn('Could not open settings', e);
      }
    }
  };

  const allCompleted = Object.values(completed).every((v) => v === true);

  const handleFinish = () => {
    if (!allCompleted) return;
    completePermissionsSetup();
    grantPermissions();
    navigation.replace('MainTabs');
  };

  const permissions = [
    {
      id: 'usage',
      title: 'Usage Access',
      description: 'Track app usage time accurately to help you focus.',
      icon: 'stats-chart',
      action: 'android.settings.USAGE_ACCESS_SETTINGS',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Detect when distracting apps are opened and block them.',
      icon: 'shield-checkmark',
      action: 'android.settings.ACCESSIBILITY_SETTINGS',
    },
    {
      id: 'overlay',
      title: 'Display Over Apps',
      description: 'Show the block screen overlay over distracting apps.',
      icon: 'layers',
      action: 'android.settings.action.MANAGE_OVERLAY_PERMISSION',
    },
    {
      id: 'battery',
      title: 'Ignore Battery Restrictions',
      description: 'Keep the app running in the background for accurate tracking.',
      icon: 'battery-charging',
      action: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.backgroundTop }]}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.brand, { color: palette.green }]}>FocusZen</Text>
          <Text style={[styles.title, { color: palette.text }]}>Core Permissions</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            To effectively block distractions and track your focus, we need the following system permissions.
          </Text>

          <View style={styles.list}>
            {permissions.map((p) => {
              const isCompleted = completed[p.id];
              return (
                <Pressable
                  key={p.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: palette.surface,
                      borderColor: isCompleted ? palette.green : palette.stroke,
                      shadowColor: palette.shadow,
                    },
                  ]}
                  onPress={() => openSettings(p.action, p.id)}
                >
                  <View style={[styles.iconBox, { backgroundColor: isCompleted ? palette.green : palette.iconBg }]}>
                    <Ionicons 
                      name={p.icon as any} 
                      size={22} 
                      color={isCompleted ? palette.buttonText : palette.iconColor} 
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: palette.text }]}>{p.title}</Text>
                    <Text style={[styles.cardDesc, { color: palette.textMuted }]}>{p.description}</Text>
                  </View>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={26} color={palette.green} />
                  ) : (
                    <Ionicons name="chevron-forward" size={24} color={palette.textMuted} opacity={0.5} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleFinish}
            disabled={!allCompleted}
            style={[
              styles.button,
              {
                backgroundColor: allCompleted ? palette.buttonEnabled : palette.surfaceSoft,
                shadowColor: palette.shadow,
                borderColor: allCompleted ? palette.buttonEnabled : palette.stroke,
                opacity: allCompleted ? 1 : 0.6,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: allCompleted ? palette.buttonText : palette.textMuted }]}>
              {allCompleted ? 'Complete Setup' : 'Grant permissions to continue'}
            </Text>
          </Pressable>
        </ScrollView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}


