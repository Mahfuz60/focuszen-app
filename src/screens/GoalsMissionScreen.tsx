import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { ProgressRing } from '../components/ProgressRing';
import { SectionHeader } from '../components/SectionHeader';
import { MetricPill } from '../components/MetricPill';
import { useAppTheme } from '../hooks/useAppTheme';
import { useGoalsStore } from '../stores/useGoalsStore';
import { spacing, typography } from '../theme/tokens';
import { goalsMissionStyles as styles } from '../styles/GoalsMissionScreen.styles';

export function GoalsMissionScreen() {
  const { colors } = useAppTheme();
  const goals = useGoalsStore((state) => state.goals);
  const badges = useGoalsStore((state) => state.badges);
  const streak = useGoalsStore((state) => state.streak);

  return (
    <ScreenContainer
      title="Goals & Mission"
      subtitle="Weekly and monthly progress, milestone rewards, and your current level ladder."
      right={<MetricPill label="Gamified" tone="amber" />}
    >
      <SurfaceCard>
        <SectionHeader title="Levels" />
        <View style={styles.levels}>
          {['Seedling', 'Focus Pro', 'Deep Worker', 'Zen Master'].map((level) => (
            <MetricPill key={level} label={level} tone={level === 'Focus Pro' ? 'focus' : 'blue'} />
          ))}
        </View>
        <Text style={[styles.supportText, { color: colors.textMuted }]}>Unlock conditions are persisted locally with badge progress.</Text>
      </SurfaceCard>

      {(goals || []).map((goal, index) => {
        const progress = Math.min(1, goal.current / goal.target);
        return (
          <SurfaceCard key={goal.id} delay={index * 70}>
            <View style={styles.goalRow}>
              <ProgressRing size={120} strokeWidth={10} progress={progress} valueLabel={`${Math.round(progress * 100)}%`} caption={goal.period} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.heading, { color: colors.text }]}>{goal.title}</Text>
                <Text style={[styles.supportText, { color: colors.textMuted }]}>{goal.description}</Text>
                <Text style={[styles.metricLabel, { color: colors.text }]}>{goal.current} / {goal.target}</Text>
              </View>
            </View>
          </SurfaceCard>
        );
      })}

      <SurfaceCard delay={220}>
        <SectionHeader title="Milestones & badges" />
        <View style={styles.badges}>
          {(badges || []).map((badge) => (
            <MetricPill key={badge.id} label={`${badge.label} ${badge.progress}%`} tone={badge.unlocked ? 'focus' : 'blue'} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard delay={280}>
        <SectionHeader title="Streak engine" />
        <Text style={[styles.metricValue, { color: colors.amber }]}>{streak.current} day streak</Text>
        <Text style={[styles.supportText, { color: colors.textMuted }]}>Best streak: {streak.best} days. Completing focus blocks and routines feeds unlock progress.</Text>
      </SurfaceCard>
    </ScreenContainer>
  );
}


