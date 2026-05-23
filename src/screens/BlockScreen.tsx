import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppBrandIcon } from '../components/AppBrandIcon';
import { AppControlTarget } from '../types/models';
import { spacing } from '../theme/tokens';
import { useSettingsStore } from '../stores/useSettingsStore';

type BlockScreenRouteProp = RouteProp<RootStackParamList, 'BlockScreen'>;
type BlockScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BlockScreen'>;

export function BlockScreen() {
  const route = useRoute<BlockScreenRouteProp>();
  const navigation = useNavigation<BlockScreenNavigationProp>();
  const { mode, colors } = useAppTheme();
  
  const rawAppName = route.params?.appName || 'App';
  const appName = rawAppName as AppControlTarget;

  const strictModeEnabled = useSettingsStore((state) => state.settings?.strictModeEnabled ?? false);

  // Prevent back button from escaping if strict mode is on? 
  // Actually, back button should just act as "Close app"
  useEffect(() => {
    const onBackPress = () => {
      handleClose();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  const handleClose = () => {
    // Navigating to MainTabs effectively leaves the blocked app
    navigation.replace('MainTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC' }]}>
      {/* Decorative background blur / glow */}
      <View style={[styles.glowBlob, { backgroundColor: colors.focus, opacity: mode === 'dark' ? 0.15 : 0.1 }]} />
      
      <View style={styles.content}>
        <View style={[styles.iconContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <AppBrandIcon appName={appName} size={64} />
          <View style={[styles.shieldBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.focus} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Time to Focus
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{appName}</Text> is blocked right now to help you stay productive.
        </Text>

        {strictModeEnabled && (
          <View style={[styles.strictModeBadge, { backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons name="lock-closed" size={14} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={[styles.strictModeText, { color: mode === 'dark' ? '#FCA5A5' : '#DC2626' }]}>
              Strict Mode is Active
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.button, 
            { backgroundColor: colors.focus },
            pressed && { opacity: 0.9 }
          ]} 
          onPress={handleClose}
        >
          <Text style={styles.buttonText}>Got It, Close App</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '30%',
    filter: 'blur(80px)', // React Native 0.73+ supports this on some platforms, otherwise it's just a soft blob
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  shieldBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Roboto_700Bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  strictModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: spacing.md,
  },
  strictModeText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 13,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.xxl,
    zIndex: 1,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto_600SemiBold',
    letterSpacing: 0.2,
  },
});
