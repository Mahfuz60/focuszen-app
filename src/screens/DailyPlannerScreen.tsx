import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedThemeBackdrop } from '../components/AnimatedThemeBackdrop';
import { useAppTheme } from '../hooks/useAppTheme';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useFocusStore } from '../stores/useFocusStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { radius, spacing, typography } from '../theme/tokens';
import type { PlannerCategory, PlannerTask } from '../types/models';
import {
  buildPlannerDraftFromTask,
  buildPlannerSuggestions,
  buildPlannerTaskFromDraft,
  buildPlannerTaskFromSuggestion,
  buildPlannerViewModel,
  createPlannerDraft,
  normalizePlannerNumberInput,
  plannerCategories,
  PlannerTaskDraft,
  syncPlannerDuration,
} from '../utils/planner';

const darkPalette = {
  backgroundTop: '#0d0b1a',
  backgroundBottom: '#171026',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSoft: 'rgba(255, 255, 255, 0.05)',
  stroke: 'rgba(255, 255, 255, 0.15)',
  text: '#ffffff',
  textMuted: '#cbd5e1',
  textSoft: '#94a3b8',
  white: '#ffffff',
  green: '#00ff9d',
  purple: '#d946ef',
  blue: '#38bdf8',
  chipActive: 'rgba(0, 255, 157, 0.15)',
  chipBorder: 'rgba(0, 255, 157, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  greenSoft: 'rgba(0, 255, 157, 0.15)',
  purpleSoft: 'rgba(217, 70, 239, 0.15)',
  gold: '#fbbf24',
  goldSoft: 'rgba(251, 191, 36, 0.15)',
  blueSoft: 'rgba(56, 189, 248, 0.15)',
  red: '#ef4444',
  redSoft: 'rgba(239, 68, 68, 0.15)',
};

const lightPalette = {
  backgroundTop: '#e8f5e9',
  backgroundBottom: '#f3e5f5',
  surface: 'rgba(255, 255, 255, 0.75)',
  surfaceSoft: 'rgba(255, 255, 255, 0.45)',
  surfaceMuted: 'rgba(255, 255, 255, 0.25)',
  stroke: 'rgba(0, 0, 0, 0.06)',
  text: '#020617',
  textMuted: '#475569',
  textSoft: '#94a3b8',
  green: '#00c853',
  greenSoft: 'rgba(0, 200, 83, 0.12)',
  purple: '#aa00ff',
  purpleSoft: 'rgba(170, 0, 255, 0.1)',
  gold: '#ffab00',
  goldSoft: 'rgba(255, 171, 0, 0.1)',
  blue: '#2962ff',
  blueSoft: 'rgba(41, 98, 255, 0.1)',
  red: '#d50000',
  redSoft: 'rgba(213, 0, 0, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

type ScreenPalette = typeof darkPalette;

function getCategoryStyles(
  palette: ScreenPalette
): Record<PlannerCategory, { icon: React.ComponentProps<typeof Ionicons>['name']; bg: string; text: string }> {
  return {
    Study: { icon: 'book-outline', bg: palette.blueSoft, text: palette.blue },
    Work: { icon: 'briefcase-outline', bg: palette.greenSoft, text: palette.green },
    Health: { icon: 'body-outline', bg: palette.goldSoft, text: palette.gold },
    Personal: { icon: 'sparkles-outline', bg: palette.purpleSoft, text: palette.purple },
  };
}

type PlannerQuickActionProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  tone?: 'neutral' | 'success' | 'danger';
  onPress: () => void;
  palette: ScreenPalette;
  styles: ReturnType<typeof createStyles>;
};

function PlannerQuickAction({
  icon,
  label,
  tone = 'neutral',
  onPress,
  palette,
  styles,
}: PlannerQuickActionProps) {
  const toneStyle = {
    neutral: {
      backgroundColor: palette.surfaceMuted,
      color: palette.text,
    },
    success: {
      backgroundColor: palette.greenSoft,
      color: palette.green,
    },
    danger: {
      backgroundColor: palette.redSoft,
      color: palette.red,
    },
  }[tone];

  return (
    <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: toneStyle.backgroundColor }]}>
      <Ionicons name={icon} size={15} color={toneStyle.color} />
      <Text style={[styles.quickActionLabel, { color: toneStyle.color }]}>{label}</Text>
    </Pressable>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function DailyPlannerScreen() {
  const { mode, text } = useAppTheme();
  const navigation = useNavigation<any>();
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const tasks = usePlannerStore((state) => state.tasks);
  const addTask = usePlannerStore((state) => state.addTask);
  const updateTask = usePlannerStore((state) => state.updateTask);
  const toggleTaskCompleted = usePlannerStore((state) => state.toggleTaskCompleted);
  const deleteTask = usePlannerStore((state) => state.deleteTask);
  const markTaskInProgressFromFocus = usePlannerStore((state) => state.markTaskInProgressFromFocus);
  const activeSession = useFocusStore((state) => state.activeSession);
  const startSession = useFocusStore((state) => state.startSession);
  const pauseSession = useFocusStore((state) => state.pauseSession);
  const resumeSession = useFocusStore((state) => state.resumeSession);
  const tick = useFocusStore((state) => state.tick);
  const completeSession = useFocusStore((state) => state.completeSession);
  const cancelSession = useFocusStore((state) => state.cancelSession);
  const incrementGoalMetric = useGoalsStore((state) => state.incrementGoalMetric);
  const registerCompletion = useGoalsStore((state) => state.registerCompletion);
  const refreshBadges = useGoalsStore((state) => state.refreshBadges);
  const palette = useMemo<ScreenPalette>(
    () =>
      mode === 'dark'
        ? {
            ...darkPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          }
        : {
            ...lightPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          },
    [mode, text]
  );
  const categoryStyles = useMemo(() => getCategoryStyles(palette), [palette]);
  const styles = useMemo(() => createStyles(palette), [palette]);

  const plannerView = useMemo(() => buildPlannerViewModel(tasks, selectedDate), [selectedDate, tasks]);
  const suggestions = useMemo(
    () => buildPlannerSuggestions(selectedDate, tasks),
    [selectedDate, tasks]
  );

  const [draft, setDraft] = useState<PlannerTaskDraft>(() => createPlannerDraft(selectedDate));
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, tasks]
  );
  const categoryGlows = useMemo(
    () => ({
      Study: mode === 'dark' ? ['rgba(0, 176, 255, 0.15)', 'rgba(0, 176, 255, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(41, 98, 255, 0.12)'],
      Work: mode === 'dark' ? ['rgba(0, 255, 157, 0.15)', 'rgba(0, 255, 157, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(0, 200, 83, 0.12)'],
      Health: mode === 'dark' ? ['rgba(255, 171, 0, 0.15)', 'rgba(255, 171, 0, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(255, 171, 0, 0.12)'],
      Personal: mode === 'dark' ? ['rgba(213, 0, 249, 0.15)', 'rgba(213, 0, 249, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(170, 0, 255, 0.12)'],
    }),
    [mode]
  );

  const completionPercent = plannerView.summary.completionRate;
  const progressWidth = `${completionPercent}%` as `${number}%`;
  const summaryText =
    plannerView.visibleTasks.length === 0
      ? 'No tasks planned yet.'
      : plannerView.nextTask
        ? `${plannerView.summary.pendingTasks} tasks left. Next at ${plannerView.nextTask.startTime}.`
        : 'Everything is complete for this day.';
  const statusBarStyle = mode === 'dark' ? 'light-content' : 'dark-content';

  useEffect(() => {
    if (!activeSession || activeSession.paused) {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, tick]);

  useEffect(() => {
    if (!activeSession || activeSession.paused || activeSession.remainingSeconds > 0) {
      return;
    }

    handleCompleteSession();
  }, [activeSession]);

  function patchDraft<Key extends keyof PlannerTaskDraft>(key: Key, value: PlannerTaskDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleDurationChange(value: string) {
    setDraft((current) => syncPlannerDuration(current, value));
  }

  function resetDraft() {
    setDraft(createPlannerDraft(selectedDate));
    setEditingTaskId(null);
  }

  function openComposer(task?: PlannerTask) {
    if (task) {
      setEditingTaskId(task.id);
      setDraft(buildPlannerDraftFromTask(task));
    } else {
      resetDraft();
    }

    setComposerOpen(true);
  }

  function handleSubmitTask() {
    try {
      const task = buildPlannerTaskFromDraft(
        draft,
        selectedDate,
        editingTaskId ?? `task-${Date.now()}`,
        editingTask ?? undefined
      );

      if (editingTaskId) {
        updateTask(editingTaskId, task);
      } else {
        addTask(task);
      }

      resetDraft();
      setComposerOpen(false);
    } catch (error) {
      Alert.alert(
        'Check task details',
        error instanceof Error ? error.message : 'Task could not be saved.'
      );
    }
  }

  function handleAddSuggestion(index: number) {
    const suggestion = suggestions[index];

    if (!suggestion || suggestion.added) {
      return;
    }

    addTask(buildPlannerTaskFromSuggestion(suggestion, selectedDate, `task-${Date.now()}-${index}`));
  }

  function handleStartFocus(task: PlannerTask) {
    if (!task.focusPresetMinutes) {
      Alert.alert('No focus time', 'Add a focus duration first, then start this session.');
      return;
    }

    startSession(task.focusPresetMinutes, task.id);
    navigation.navigate('MainTabs', { screen: 'Focus' });
  }

  function handleCompleteSession() {
    const completed = completeSession();

    if (!completed) {
      cancelSession();
      return;
    }

    incrementGoalMetric('focus-sessions', 1);
    registerCompletion();
    refreshBadges();

    if (completed.linkedTaskId) {
      markTaskInProgressFromFocus(completed.linkedTaskId);
    }

    Alert.alert('Focus complete', 'Session saved and your linked task was updated.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={mode === 'dark' ? palette.greenSoft : 'rgba(31, 165, 91, 0.1)'}
        secondaryGlow={mode === 'dark' ? palette.purpleSoft : 'rgba(140, 92, 255, 0.08)'}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.42)'}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
                <Ionicons name="arrow-back" size={18} color={palette.text} />
              </Pressable>

              <Text style={styles.topTitle}>Planner</Text>

              <Pressable
                onPress={() => setComposerOpen((current) => !current)}
                style={styles.topIconButton}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={palette.text} />
              </Pressable>
            </View>

            <LinearGradient
              colors={mode === 'dark' ? ['rgba(0, 255, 157, 0.15)', 'rgba(0, 255, 157, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(0, 200, 83, 0.15)']}
              style={styles.summaryShell}
            >
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Today planner</Text>
                <Text style={styles.summaryPercent}>{`${completionPercent}% complete`}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressWidth }]} />
              </View>

              <Text style={styles.summaryText}>{summaryText}</Text>

              {activeSession ? (
                <View style={styles.liveFocusCard}>
                  <View style={styles.liveFocusCopy}>
                    <Text style={styles.liveFocusLabel}>Focus live</Text>
                    <Text style={styles.liveFocusTime}>
                      {formatCountdown(activeSession.remainingSeconds)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={activeSession.paused ? resumeSession : pauseSession}
                    style={styles.liveFocusButton}
                  >
                    <Text style={styles.liveFocusButtonText}>
                      {activeSession.paused ? 'Resume' : 'Pause'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.suggestionsShell}>
                <Text style={styles.suggestionsLabel}>Suggested for you</Text>

                {suggestions.map((suggestion, index) => {
                  const categoryStyle = categoryStyles[suggestion.category];

                  return (
                    <View key={suggestion.id} style={styles.suggestionCard}>
                      <View style={[styles.suggestionIconWrap, { backgroundColor: categoryStyle.bg }]}>
                        <Ionicons
                          name={categoryStyle.icon}
                          size={16}
                          color={categoryStyle.text}
                        />
                      </View>

                      <View style={styles.suggestionCopy}>
                        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                        <Text style={styles.suggestionMeta}>
                          {`${suggestion.routineLabel} | ${suggestion.durationMinutes} min`}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => handleAddSuggestion(index)}
                        disabled={suggestion.added}
                        style={[
                          styles.addSuggestionButton,
                          suggestion.added ? styles.addSuggestionButtonDisabled : null,
                        ]}
                      >
                        <Ionicons
                          name={suggestion.added ? 'checkmark' : 'add'}
                          size={18}
                          color={palette.backgroundTop}
                        />
                      </Pressable>
                    </View>
                  );
                })}

                <Pressable
                  onPress={() => setComposerOpen((current) => !current)}
                  style={styles.addCustomButton}
                >
                  <Text style={styles.addCustomButtonText}>Add custom task</Text>
                </Pressable>
              </View>
            </LinearGradient>

            {composerOpen ? (
              <LinearGradient
                colors={mode === 'dark' ? ['rgba(0, 176, 255, 0.15)', 'rgba(0, 176, 255, 0.02)'] : ['rgba(255, 255, 255, 0.65)', 'rgba(41, 98, 255, 0.12)']}
                style={styles.composerCard}
              >
                <View style={styles.composerHeader}>
                  <Text style={styles.composerTitle}>
                    {editingTaskId ? 'Edit task' : 'Add custom task'}
                  </Text>
                  <Pressable onPress={() => setComposerOpen(false)}>
                    <Text style={styles.composerHide}>Hide</Text>
                  </Pressable>
                </View>

                <View style={styles.inputShell}>
                  <Text style={styles.inputLabel}>Task name</Text>
                  <TextInput
                    value={draft.title}
                    onChangeText={(value) => patchDraft('title', value)}
                    placeholder="Write your task"
                    placeholderTextColor={palette.textSoft}
                    style={styles.primaryInput}
                  />
                </View>

                <View style={styles.inlineInputs}>
                  <View style={[styles.inputShell, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Start time</Text>
                    <TextInput
                      value={draft.startTime}
                      onChangeText={(value) => patchDraft('startTime', value)}
                      placeholder="09:00"
                      placeholderTextColor={palette.textSoft}
                      style={styles.secondaryInput}
                    />
                  </View>

                  <View style={[styles.inputShell, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Minutes</Text>
                    <TextInput
                      value={draft.durationMinutes}
                      onChangeText={handleDurationChange}
                      keyboardType="number-pad"
                      placeholder="45"
                      placeholderTextColor={palette.textSoft}
                      style={styles.secondaryInput}
                    />
                  </View>
                </View>

                <View style={styles.inputShell}>
                  <Text style={styles.inputLabel}>Focus minutes</Text>
                  <TextInput
                    value={draft.focusPresetMinutes}
                    onChangeText={(value) =>
                      patchDraft('focusPresetMinutes', normalizePlannerNumberInput(value))
                    }
                    keyboardType="number-pad"
                    placeholder="45"
                    placeholderTextColor={palette.textSoft}
                    style={styles.secondaryInput}
                  />
                </View>

                <View style={styles.categoriesWrap}>
                  {plannerCategories.map((category) => {
                    const categoryStyle = categoryStyles[category];
                    const active = draft.category === category;

                    return (
                      <Pressable
                        key={category}
                        onPress={() => patchDraft('category', category)}
                        style={[
                          styles.categoryChip,
                          active ? { backgroundColor: categoryStyle.bg, borderColor: categoryStyle.text } : null,
                        ]}
                      >
                        <Ionicons name={categoryStyle.icon} size={15} color={categoryStyle.text} />
                        <Text style={[styles.categoryChipLabel, { color: categoryStyle.text }]}>
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable onPress={handleSubmitTask} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>
                    {editingTaskId ? 'Save task' : 'Create task'}
                  </Text>
                </Pressable>
              </LinearGradient>
            ) : null}

            <View style={styles.tasksSectionHeader}>
              <Text style={styles.tasksSectionTitle}>Today queue</Text>
              <Text style={styles.tasksSectionMeta}>{`${plannerView.summary.pendingTasks} open`}</Text>
            </View>

            {plannerView.visibleTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tasks planned for this day yet.</Text>
              </View>
            ) : (
              plannerView.visibleTasks.map((task) => {
                const categoryStyle = categoryStyles[task.category];

                return (
                  <LinearGradient
                    key={task.id}
                    colors={categoryGlows[task.category] || categoryGlows.Work}
                    style={styles.taskCard}
                  >
                    <View style={styles.taskTop}>
                      <View style={styles.taskIdentity}>
                        <View style={[styles.taskIconWrap, { backgroundColor: categoryStyle.bg }]}>
                          <Ionicons
                            name={categoryStyle.icon}
                            size={18}
                            color={categoryStyle.text}
                          />
                        </View>

                        <View style={styles.taskCopy}>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          <Text style={styles.taskMeta}>
                            {`${task.startTime} | ${task.durationMinutes} min`}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          task.completed
                            ? styles.statusBadgeDone
                            : styles.statusBadgeOpen,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            task.completed
                              ? styles.statusBadgeTextDone
                              : styles.statusBadgeTextOpen,
                          ]}
                        >
                          {task.completed ? 'Done' : 'Open'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionsGrid}>
                      <PlannerQuickAction
                        icon={task.completed ? 'refresh-outline' : 'checkmark-outline'}
                        label={task.completed ? 'Undo' : 'Complete'}
                        tone="success"
                        onPress={() => toggleTaskCompleted(task.id)}
                        palette={palette}
                        styles={styles}
                      />
                      <PlannerQuickAction
                        icon="play-outline"
                        label="Start focus"
                        onPress={() => handleStartFocus(task)}
                        palette={palette}
                        styles={styles}
                      />
                      <PlannerQuickAction
                        icon="create-outline"
                        label="Edit"
                        onPress={() => openComposer(task)}
                        palette={palette}
                        styles={styles}
                      />
                      <PlannerQuickAction
                        icon="trash-outline"
                        label="Delete"
                        tone="danger"
                        onPress={() => deleteTask(task.id)}
                        palette={palette}
                        styles={styles}
                      />
                    </View>
                  </LinearGradient>
                );
              })
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </AnimatedThemeBackdrop>
    </SafeAreaView>
  );
}

function createStyles(palette: ScreenPalette) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  topTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.text,
  },
  summaryShell: {
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
    shadowColor: palette.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  summaryPercent: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textMuted,
  },
  progressTrack: {
    marginTop: spacing.md,
    height: 8,
    borderRadius: radius.round,
    overflow: 'hidden',
    backgroundColor: palette.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.round,
    backgroundColor: palette.green,
  },
  summaryText: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    color: palette.textMuted,
  },
  liveFocusCard: {
    marginTop: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surfaceSoft,
  },
  liveFocusCopy: {
    gap: 2,
  },
  liveFocusLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textMuted,
  },
  liveFocusTime: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  liveFocusButton: {
    minHeight: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: palette.greenSoft,
  },
  liveFocusButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.green,
  },
  suggestionsShell: {
    marginTop: spacing.xl,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  suggestionsLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: palette.textSoft,
  },
  suggestionCard: {
    marginTop: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceSoft,
  },
  suggestionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCopy: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  suggestionMeta: {
    marginTop: 4,
    fontSize: 14,
    color: palette.textMuted,
  },
  addSuggestionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  addSuggestionButtonDisabled: {
    opacity: 0.58,
  },
  addCustomButton: {
    marginTop: spacing.xl,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
    borderWidth: 1,
    borderColor: palette.green,
  },
  addCustomButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.green,
  },
  composerCard: {
    marginTop: spacing.lg,
    borderRadius: 24,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  composerHide: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textMuted,
  },
  inputShell: {
    marginTop: spacing.md,
  },
  inputLabel: {
    marginBottom: spacing.xs,
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textMuted,
  },
  primaryInput: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.surfaceSoft,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  secondaryInput: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.surfaceSoft,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  categoriesWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: palette.stroke,
    backgroundColor: palette.surfaceSoft,
  },
  categoryChipLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: spacing.lg,
    minHeight: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.backgroundTop,
  },
  tasksSectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tasksSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  tasksSectionMeta: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textMuted,
  },
  emptyCard: {
    borderRadius: 22,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  emptyText: {
    fontSize: 15,
    color: palette.textMuted,
  },
  taskCard: {
    marginBottom: spacing.md,
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  taskTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  taskIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCopy: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: palette.text,
  },
  taskMeta: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 19,
    color: palette.textMuted,
  },
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  statusBadgeOpen: {
    backgroundColor: palette.surfaceMuted,
  },
  statusBadgeDone: {
    backgroundColor: palette.greenSoft,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadgeTextOpen: {
    color: palette.textMuted,
  },
  statusBadgeTextDone: {
    color: palette.green,
  },
  actionsGrid: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    minHeight: 40,
    minWidth: '47%',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quickActionLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  });
}
