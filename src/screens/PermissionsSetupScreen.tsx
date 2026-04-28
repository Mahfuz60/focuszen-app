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
import { spacing } from '../theme/tokens';

const { PermissionChecker } = NativeModules;

export function PermissionsSetupScreen() {
  const navigation = useNavigation<any>();
  const { colors, mode, text } = useAppTheme();
  const completePermissionsSetup = useSettingsStore((state) => state.completePermissionsSetup);

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
    () =>
      mode === 'dark'
        ? {
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
          }
        : {
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
          },
    [mode]
  );

  const openSettings = async (action: string, key: string) => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(action);
        // We do not set completed here blindly anymore.
        // The AppState listener above will re-verify the permission when they return.
      } catch (e) {
        console.warn('Could not open settings', e);
        Alert.alert('Error', 'Could not open the settings screen automatically. Please grant it manually.');
      }
    } else {
      setCompleted((prev) => ({ ...prev, [key]: true }));
    }
  };

  const allCompleted = Object.values(completed).every((v) => v === true);

  const handleFinish = () => {
    if (!allCompleted) return;
    completePermissionsSetup();
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

const styles = StyleSheet.create({
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
