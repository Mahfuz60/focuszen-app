import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  StatusBar,
  Text,
  View,
  ScrollView,
  Platform,
  NativeModules,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useControlStore } from '../stores/useControlStore';
import {
  createPermissionsStyles as createStyles,
} from '../styles/PermissionsSetupScreen.styles';

const { PermissionChecker } = NativeModules;

export function PermissionsSetupScreen() {
  const navigation = useNavigation<any>();
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('permissionsSetup'), [getPalette]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const completePermissionsSetup = useSettingsStore((state) => state.completePermissionsSetup);
  const syncAllSettings = useControlStore((state) => state.syncAllSettings);
  const checkPermissions = useControlStore((state) => state.checkPermissions);

  const [completed, setCompleted] = useState<Record<string, boolean>>({
    usage: false,
    accessibility: false,
    overlay: false,
    battery: false,
  });

  const checkAllPermissions = useCallback(async () => {
  if (Platform.OS !== 'android') {
    setCompleted({ usage: true, accessibility: true, overlay: true, battery: true });
    return;
  }

  if (!PermissionChecker) {
    setCompleted({ usage: false, accessibility: false, overlay: false, battery: false });
    return;
  }

  try {
    const [usage, accessibility, overlay, battery] = await Promise.all([
      PermissionChecker.checkUsageAccess(),
      PermissionChecker.checkAccessibility(),
      PermissionChecker.checkOverlay(),
      PermissionChecker.checkBatteryOptimization(),
    ]);

    setCompleted({ usage, accessibility, overlay, battery });
  } catch (error) {
    console.warn('Permission check failed', error);
    setCompleted({ usage: false, accessibility: false, overlay: false, battery: false });
  }
}, []);

  useEffect(() => {
    checkAllPermissions();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAllPermissions();
      }
    });

    return () => subscription.remove();
  }, [checkAllPermissions]);

  const openSettings = async (action: string, dataUri?: string) => {
    if (Platform.OS === 'android') {
      try {
        if (dataUri) {
          await IntentLauncher.startActivityAsync(action, { data: dataUri });
        } else {
          await IntentLauncher.startActivityAsync(action);
        }
      } catch (e) {
        console.warn('Could not open settings', e);
      }
    }
  };

  const allCompleted = Object.values(completed).every((v) => v === true);
// const allCompleted=true;

  const handleFinish = async () => {
  await checkAllPermissions();

  if (!Object.values(completed).every(Boolean)) return;

  completePermissionsSetup();
  syncAllSettings();
  await checkPermissions();
  navigation.replace('MainTabs');
};

  const appPackageName =
  Constants.expoConfig?.android?.package ?? 'com.focuszen.app';

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
    dataUri: `package:${appPackageName}`,
  },
  {
    id: 'battery',
    title: 'Ignore Battery Restrictions',
    description: 'Keep the app running in the background for accurate tracking.',
    icon: 'battery-charging',
    action: 'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    dataUri: `package:${appPackageName}`,
  },
];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={palette.statusBar} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={palette.screenGlow}
        secondaryGlow={palette.screenGlowSoft}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>FocusZen</Text>
          <Text style={styles.title}>Core Permissions</Text>
          <Text style={styles.subtitle}>
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
                    isCompleted && { borderColor: palette.green },
                  ]}
                  onPress={() => openSettings(p.action, (p as any).dataUri)}
                >
                  <View style={[styles.iconBox, { backgroundColor: isCompleted ? palette.green : palette.iconBg }]}>
                    <Ionicons 
                      name={p.icon as any} 
                      size={22} 
                      color={isCompleted ? palette.buttonText : palette.iconColor} 
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardDesc}>{p.description}</Text>
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
                borderColor: allCompleted ? palette.buttonEnabled : palette.stroke,
              },
              !allCompleted && { opacity: 0.6 },
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


