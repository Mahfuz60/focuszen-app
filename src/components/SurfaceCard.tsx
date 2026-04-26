import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, shadows, spacing } from '../theme/tokens';

type SurfaceCardProps = ViewProps & {
  delay?: number;
};

export function SurfaceCard({ delay = 0, style, ...props }: SurfaceCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.text,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
});
