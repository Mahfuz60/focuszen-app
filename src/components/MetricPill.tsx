import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../theme/tokens';

type MetricPillProps = {
  label: string;
  tone?: 'focus' | 'amber' | 'red' | 'blue';
};

export function MetricPill({ label, tone = 'blue' }: MetricPillProps) {
  const { colors } = useAppTheme();

  const palette = {
    focus: { bg: colors.focusSoft, text: colors.focus },
    amber: { bg: colors.amberSoft, text: colors.amber },
    red: { bg: colors.redSoft, text: colors.red },
    blue: { bg: colors.blueSoft, text: colors.blue },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
});
