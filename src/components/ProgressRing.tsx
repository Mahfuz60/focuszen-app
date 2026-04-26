import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../hooks/useAppTheme';

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  valueLabel: string;
  caption: string;
  trackColor?: string;
  progressColor?: string;
  progressGradientColors?: [string, string];
  valueColor?: string;
  captionColor?: string;
};

export function ProgressRing({
  size = 180,
  strokeWidth = 14,
  progress,
  valueLabel,
  caption,
  trackColor,
  progressColor,
  progressGradientColors,
  valueColor,
  captionColor,
}: ProgressRingProps) {
  const { colors, text } = useAppTheme();
  const clamped = Math.max(0, Math.min(progress, 1));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} rotation={-90}>
        {progressGradientColors && (
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={progressGradientColors[0]} />
              <Stop offset="100%" stopColor={progressGradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressGradientColors ? 'url(#progressGradient)' : (progressColor ?? colors.focus)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={[circumference, circumference]}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.value, { color: valueColor ?? text.primary }]}>{valueLabel}</Text>
        <Text style={[styles.caption, { color: captionColor ?? text.secondary }]}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
  },
  caption: {
    fontSize: 15,
  },
});
