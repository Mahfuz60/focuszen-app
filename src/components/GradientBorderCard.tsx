import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientBorderCardProps = {
  children: ReactNode;
  colors?: readonly [string, string, ...string[]];
  borderRadius?: number;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  borderWidth?: number;
};

export function GradientBorderCard({
  children,
  colors = ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'],
  borderRadius = 24,
  style,
  innerStyle,
  borderWidth = 1.5,
}: GradientBorderCardProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        { borderRadius },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            borderRadius: borderRadius - borderWidth,
            margin: borderWidth,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    padding: 0,
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
});
