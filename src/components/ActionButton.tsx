import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../theme/tokens';

type ActionButtonProps = {
  label: string;
  onPress?: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
};

export function ActionButton({ label, onPress, tone = 'primary' }: ActionButtonProps) {
  const { colors, text } = useAppTheme();
  const palette = {
    primary: { bg: colors.focus, text: text.inverse },
    secondary: { bg: colors.surfaceMuted, text: text.primary },
    danger: { bg: colors.redSoft, text: colors.red },
  }[tone];

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.body,
    fontWeight: '800',
  },
});
