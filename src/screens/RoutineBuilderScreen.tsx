import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SurfaceCard } from '../components/SurfaceCard';
import { SectionHeader } from '../components/SectionHeader';
import { ActionButton } from '../components/ActionButton';
import { MetricPill } from '../components/MetricPill';
import { useAppTheme } from '../hooks/useAppTheme';
import { useRoutineStore } from '../stores/useRoutineStore';
import { deriveRoutineCompletionRate } from '../utils/streaks';
import {
  createRoutineStyles as createStyles,
  darkPalette,
  lightPalette,
  ScreenPalette,
} from '../styles/RoutineBuilderScreen.styles';

export function RoutineBuilderScreen() {
  const { mode } = useAppTheme();
  const routines = useRoutineStore((state) => state.routines);
  const toggleRoutineEnabled = useRoutineStore((state) => state.toggleRoutineEnabled);
  const toggleStepCompleted = useRoutineStore((state) => state.toggleStepCompleted);
  const addStep = useRoutineStore((state) => state.addStep);
  const reorderSteps = useRoutineStore((state) => state.reorderSteps);

  const palette = useMemo<ScreenPalette>(
    () => (mode === 'dark' ? darkPalette : lightPalette),
    [mode]
  );
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <ScreenContainer
      title="Routine Builder"
      subtitle="Morning, study, and night routines with local streak tracking."
      right={<MetricPill label="Local routines" tone="focus" />}
    >
      {(routines || []).map((routine, index) => (
        <SurfaceCard key={routine.id} delay={index * 60}>
          <SectionHeader title={routine.name} actionLabel={routine.enabled ? 'Disable' : 'Enable'} onPressAction={() => toggleRoutineEnabled(routine.id)} />
          <Text style={styles.supportText}>
            Active days: {routine.activeDays.join(', ')} · Streak {routine.streakDays} days · {Math.round(deriveRoutineCompletionRate(routine) * 100)}% complete
          </Text>
          <View style={styles.steps}>
            {(routine.steps || []).map((step, stepIndex) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{step.title}</Text>
                  <Text style={styles.supportText}>{step.durationMinutes} minutes</Text>
                </View>
                <ActionButton label={step.completed ? 'Done' : 'Check'} tone="secondary" onPress={() => toggleStepCompleted(routine.id, step.id)} />
                {stepIndex > 0 ? <ActionButton label="Up" tone="secondary" onPress={() => reorderSteps(routine.id, stepIndex, stepIndex - 1)} /> : null}
              </View>
            ))}
          </View>
          <ActionButton
            label="Add step"
            onPress={() =>
              addStep(routine.id, {
                id: `step-${Date.now()}`,
                title: 'New routine step',
                durationMinutes: 15,
                completed: false,
              })
            }
          />
        </SurfaceCard>
      ))}
    </ScreenContainer>
  );
}
