import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
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
  Home: {
    activeIcon: '#1fa55b',
    activeBg: 'rgba(31, 165, 91, 0.12)',
    activeBorder: 'rgba(31, 165, 91, 0.18)',
    activeGlow: 'rgba(31, 165, 91, 0.14)',
  },
  Control: {
    activeIcon: '#10b981',
    activeBg: 'rgba(16, 185, 129, 0.12)',
    activeBorder: 'rgba(16, 185, 129, 0.18)',
    activeGlow: 'rgba(16, 185, 129, 0.14)',
  },
  Focus: {
    activeIcon: '#059669',
    activeBg: 'rgba(5, 150, 105, 0.12)',
    activeBorder: 'rgba(5, 150, 105, 0.18)',
    activeGlow: 'rgba(5, 150, 105, 0.14)',
  },
  Purify: {
    activeIcon: '#8b5cf6',
    activeBg: 'rgba(139, 92, 246, 0.12)',
    activeBorder: 'rgba(139, 92, 246, 0.18)',
    activeGlow: 'rgba(139, 92, 246, 0.14)',
  },
  Planner: {
    activeIcon: '#3b82f6',
    activeBg: 'rgba(59, 130, 246, 0.12)',
    activeBorder: 'rgba(59, 130, 246, 0.18)',
    activeGlow: 'rgba(59, 130, 246, 0.14)',
  },
} as const;

function MultilineTabLabel({
  color,
  text,
  focused,
}: {
  color: string;
  text: string;
  focused: boolean;
}) {
  return (
    <Text 
      style={[
        styles.multilineLabel, 
        { color, opacity: focused ? 1 : 0.7, transform: [{ translateY: focused ? -1 : 0 }] }
      ]}
    >
      {text}
    </Text>
  );
}

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
          tabBarInactiveTintColor: isDark ? '#94a3b8' : colors.textMuted,
          tabBarStyle: {
            backgroundColor: isDark ? '#111d17' : '#ffffff',
            borderTopWidth: 0,
            height: 84,
            paddingBottom: 24,
            paddingTop: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 32,
            position: 'absolute',
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
          },
          tabBarItemStyle: {
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fontFamily.black,
            marginTop: 2,
            textTransform: 'uppercase',
          },
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabBarIconShell,
                {
                  backgroundColor: focused ? accent.activeBg : 'transparent',
                  borderColor: focused ? accent.activeBorder : 'transparent',
                }
              ]}
            >
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
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.7 }]}>HOME</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Control"
        component={ControlScreen}
        options={{
          tabBarLabel: ({ color, focused }) => (
            <MultilineTabLabel color={color} text={'APP\nCONTROL'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Focus" 
        component={FocusScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.7 }]}>FOCUS</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Purify" 
        component={PurifyScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.7 }]}>PURIFY</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Planner" 
        component={DailyPlannerScreen} 
        options={{
          tabBarLabel: ({ color, focused }) => (
            <Text style={[styles.label, { color, opacity: focused ? 1 : 0.7 }]}>PLANNER</Text>
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
    letterSpacing: 0,
    marginTop: 2,
    textAlign: 'center',
  },
  multilineLabel: {
    fontSize: 9,
    fontFamily: fontFamily.black,
    letterSpacing: 0,
    marginTop: 1,
    lineHeight: 10,
    textAlign: 'center',
  },
  tabBarIconShell: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
});
