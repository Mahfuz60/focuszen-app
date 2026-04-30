import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
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
  Insights: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Control: { active: 'options', inactive: 'options-outline' },
  Purify: { active: 'leaf', inactive: 'leaf-outline' },
};

const tabAccentPalettes = {
  Home: {
    activeIcon: '#1fa55b',
    activeBg: 'rgba(31, 165, 91, 0.14)',
    activeBorder: 'rgba(31, 165, 91, 0.24)',
    activeGlow: 'rgba(31, 165, 91, 0.18)',
  },
  Control: {
    activeIcon: '#22e45e',
    activeBg: 'rgba(34, 228, 94, 0.14)',
    activeBorder: 'rgba(34, 228, 94, 0.24)',
    activeGlow: 'rgba(34, 228, 94, 0.18)',
  },
  Focus: {
    activeIcon: '#18b874',
    activeBg: 'rgba(24, 184, 116, 0.14)',
    activeBorder: 'rgba(24, 184, 116, 0.24)',
    activeGlow: 'rgba(24, 184, 116, 0.18)',
  },
  Purify: {
    activeIcon: '#8c5cff',
    activeBg: 'rgba(140, 92, 255, 0.14)',
    activeBorder: 'rgba(140, 92, 255, 0.24)',
    activeGlow: 'rgba(140, 92, 255, 0.18)',
  },
  Insights: {
    activeIcon: '#6b86ff',
    activeBg: 'rgba(107, 134, 255, 0.14)',
    activeBorder: 'rgba(107, 134, 255, 0.24)',
    activeGlow: 'rgba(107, 134, 255, 0.18)',
  },
} as const;

function MultilineTabLabel({
  color,
  text,
}: {
  color: string;
  text: string;
}) {
  return <Text style={[styles.multilineLabel, { color }]}>{text}</Text>;
}

export function MainTabs() {
  const { colors, mode } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = route.name as keyof MainTabParamList;
        const accent = tabAccentPalettes[routeName];
        const useDarkTab = mode === 'dark' || routeName === 'Control';

        return {
          headerShown: false,
          tabBarActiveTintColor: accent.activeIcon,
          tabBarInactiveTintColor: useDarkTab ? '#94a3b8' : colors.textMuted,
          tabBarStyle: {
            backgroundColor: useDarkTab
              ? 'rgba(14, 23, 27, 0.94)'
              : 'rgba(255, 255, 255, 0.96)',
            borderTopWidth: 1,
            borderTopColor: useDarkTab ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            height: 92,
            paddingTop: spacing.xs,
            paddingBottom: spacing.sm,
            paddingHorizontal: spacing.sm,
            marginHorizontal: spacing.md,
            marginBottom: spacing.sm,
            borderRadius: 30,
            position: 'absolute',
            shadowColor: useDarkTab ? '#000000' : 'rgba(19,32,24,0.14)',
            shadowOpacity: useDarkTab ? 0.34 : 0.12,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 10 },
            elevation: 14,
          },
          tabBarItemStyle: {
            marginHorizontal: 3,
            borderRadius: 24,
            paddingVertical: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10.5,
            fontFamily: fontFamily.black,
            letterSpacing: 0,
            marginTop: 4,
            textTransform: 'uppercase',
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabBarIconShell,
                focused
                  ? {
                      backgroundColor: accent.activeBg,
                      borderColor: accent.activeBorder,
                      shadowColor: accent.activeGlow,
                      shadowOpacity: 0.18,
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: 'transparent',
                      shadowOpacity: 0,
                    },
              ]}
            >
              <Ionicons
                name={focused ? tabIcons[routeName].active : tabIcons[routeName].inactive}
                color={focused ? accent.activeIcon : color}
                size={focused ? 21 : 20}
              />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Control"
        component={ControlScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <MultilineTabLabel color={color} text={'App\nControl'} />
          ),
        }}
      />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Purify" component={PurifyScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  multilineLabel: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold,
    letterSpacing: 0,
    marginTop: 4,
    lineHeight: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tabBarIconShell: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
});
