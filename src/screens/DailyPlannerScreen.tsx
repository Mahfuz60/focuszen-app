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

import {
  createPlannerStyles as createStyles,
  darkPalette,
  getCategoryStyles,
  lightPalette,
  ScreenPalette,
} from '../styles/DailyPlannerScreen.styles';
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
  const palette = useMemo(
    () =>
      mode === 'dark'
        ? ({
            ...darkPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          } as ScreenPalette)
        : ({
            ...lightPalette,
            text: text.primary,
            textMuted: text.secondary,
            textSoft: text.tertiary,
          } as ScreenPalette),
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

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeSession?.linkedTaskId) ?? null,
    [activeSession?.linkedTaskId, tasks]
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

              <Text style={styles.topTitle}>Schedule</Text>

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
                <Text style={styles.summaryTitle}>Today's Agenda</Text>
                <Text style={styles.summaryPercent}>{`${completionPercent}% complete`}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressWidth }]} />
              </View>

              <Text style={styles.summaryText}>{summaryText}</Text>

              {activeSession ? (
                <View style={styles.liveFocusCard}>
                  <View style={styles.liveFocusCopy}>
                    <Text style={styles.liveFocusLabel}>
                      {activeTask ? `Focusing: ${activeTask.title} (Starts: ${activeTask.startTime})` : 'Focus live'}
                    </Text>
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
              <Text style={styles.tasksSectionTitle}>Daily Tasks</Text>
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
                    colors={(categoryGlows as any)[task.category] || categoryGlows.Work}
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
                            {activeSession && activeSession.linkedTaskId === task.id && (
                              <Text style={{ color: palette.green, fontWeight: '800' }}>
                                {` | Live: ${formatCountdown(activeSession.remainingSeconds)}`}
                              </Text>
                            )}
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

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

type PlannerQuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  palette: ScreenPalette;
  styles: any;
  tone?: 'default' | 'success' | 'danger';
};

function PlannerQuickAction({
  icon,
  label,
  onPress,
  palette,
  styles,
  tone = 'default',
}: PlannerQuickActionProps) {
  const isDanger = tone === 'danger';
  const isSuccess = tone === 'success';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        isDanger ? styles.quickActionDanger : isSuccess ? styles.quickActionSuccess : null,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={isDanger ? palette.red : isSuccess ? palette.green : palette.text}
      />
      <Text
        style={[
          styles.quickActionLabel,
          isDanger ? { color: palette.red } : isSuccess ? { color: palette.green } : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
