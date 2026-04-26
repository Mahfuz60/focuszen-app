import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing, typography } from '../theme/tokens';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onPressAction }: SectionHeaderProps) {
  const { colors, text } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: text.primary }]}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onPressAction}>
          <Text style={[styles.action, { color: colors.blue }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '800',
  },
  action: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
