import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AnimatedThemeBackdropProps = {
  children: ReactNode;
  colors: readonly [string, string];
  mode: 'light' | 'dark';
  primaryGlow: string;
  secondaryGlow: string;
  accentGlow?: string;
};

export function AnimatedThemeBackdrop({
  children,
  colors,
  mode,
  primaryGlow,
  secondaryGlow,
  accentGlow,
}: AnimatedThemeBackdropProps) {
  const drift = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    driftLoop.start();
    floatLoop.start();
    pulseLoop.start();

    return () => {
      driftLoop.stop();
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, float, pulse]);

  const primaryTransform = useMemo(
    () => [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? -28 : 24] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? 22 : -18] }) },
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
    ],
    [drift, mode, pulse]
  );

  const secondaryTransform = useMemo(
    () => [
      { translateX: float.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? 22 : -24] }) },
      { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? -18 : 18] }) },
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1.02, 0.96] }) },
    ],
    [float, mode, pulse]
  );

  const tertiaryTransform = useMemo(
    () => [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? 18 : -16] }) },
      { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, mode === 'dark' ? -14 : 16] }) },
    ],
    [drift, float, mode]
  );

  const tertiaryGlow = accentGlow ?? (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.45)');

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.background}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.primaryGlow,
          {
            backgroundColor: primaryGlow,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }),
            transform: primaryTransform,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.secondaryGlow,
          {
            backgroundColor: secondaryGlow,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.56, 0.8] }),
            transform: secondaryTransform,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.tertiaryGlow,
          {
            backgroundColor: tertiaryGlow,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.34] }),
            transform: tertiaryTransform,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  primaryGlow: {
    width: 260,
    height: 260,
    top: 72,
    right: -84,
  },
  secondaryGlow: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -72,
  },
  tertiaryGlow: {
    width: 180,
    height: 180,
    top: 260,
    left: '26%',
  },
});
