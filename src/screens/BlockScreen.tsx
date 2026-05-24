import React, { useEffect } from 'react';
import { View, Text, Pressable, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppBrandIcon } from '../components/AppBrandIcon';
import { AppControlTarget } from '../types/models';
import { useSettingsStore } from '../stores/useSettingsStore';
import { styles } from '../styles/BlockScreen.styles';

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
