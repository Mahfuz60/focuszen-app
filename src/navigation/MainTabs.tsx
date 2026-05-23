import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from '../screens/HomeScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { DailyPlannerScreen } from '../screens/DailyPlannerScreen';
import { ControlScreen } from '../screens/ControlScreen';
import { PurifyScreen } from '../screens/PurifyScreen';
import { MainTabParamList } from '../types/navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/tokens';

const Tab = createBottomTabNavigator<MainTabParamList>();

const fontFamily = {
  extraBold: 'Roboto_800ExtraBold',
  black: 'Roboto_900Black',
} as const;

const tabIcons: Record<
  keyof MainTabParamList,
  {
    active: React.ComponentProps<typeof Ionicons>['name'];
    inactive: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Focus: { active: 'timer', inactive: 'timer-outline' },
  Planner: { active: 'calendar', inactive: 'calendar-outline' },
  Control: { active: 'options', inactive: 'options-outline' },
  Purify: { active: 'leaf', inactive: 'leaf-outline' },
};

const tabAccentPalettes = {
  Home: { activeIcon: '#10b981' },
  Control: { activeIcon: '#06b6d4' },
  Focus: { activeIcon: '#f59e0b' },
  Purify: { activeIcon: '#8b5cf6' },
  Planner: { activeIcon: '#3b82f6' },
} as const;

export function MainTabs() {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = route.name as keyof MainTabParamList;
        const accent = (tabAccentPalettes as any)[routeName];

        return {
          headerShown: false,
          tabBarActiveTintColor: accent.activeIcon,
          tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 24,
            position: 'absolute',
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)',
            overflow: 'hidden',
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={isDark ? ['#1e1b4b', '#070a13'] : ['#ffffff', '#e0e7ff']}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
          tabBarItemStyle: {
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fontFamily.black,
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabBarIconShell}>
              {focused && (
                <View 
                  style={{
                    position: 'absolute',
                    top: -12,
                    width: 24,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: accent.activeIcon,
                    shadowColor: accent.activeIcon,
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 3,
                  }} 
                />
              )}
              <Ionicons
                name={focused ? tabIcons[routeName].active : tabIcons[routeName].inactive}
                color={focused ? accent.activeIcon : color}
                size={22}
              />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.8 }]}>Home</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Control"
        component={ControlScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.8 }]}>Control</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Focus" 
        component={FocusScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.8 }]}>Focus</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Purify" 
        component={PurifyScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.8 }]}>Purify</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Planner" 
        component={DailyPlannerScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.8 }]}>Planner</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontFamily: fontFamily.black,
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
  },
  tabBarIconShell: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
