import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing, typography } from '../theme/tokens';

type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export function ScreenContainer({ title, subtitle, right, children }: ScreenContainerProps) {
  const { colors, text } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: text.primary }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: text.secondary }]}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 24,
  },
});
