import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Svg, Circle } from 'react-native-svg';
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
import { spacing } from '../theme/tokens';


import {
  createPlannerStyles as createStyles,
  getCategoryStyles,
} from '../styles/DailyPlannerScreen.styles';
import { ScreenPalette } from '../theme/screenPalettes';
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



import { FocusCompleteModal } from '../components/FocusCompleteModal';

export function DailyPlannerScreen() {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('dailyPlanner'), [getPalette]);
  const tabBarHeight = useBottomTabBarHeight();
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
  const categoryStyles = useMemo(() => getCategoryStyles(palette), [palette]);
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);

  const plannerView = useMemo(() => buildPlannerViewModel(tasks, selectedDate), [selectedDate, tasks]);
  const suggestions = useMemo(
    () => buildPlannerSuggestions(selectedDate, tasks),
    [selectedDate, tasks]
  );

  const [draft, setDraft] = useState<PlannerTaskDraft>(() => createPlannerDraft(selectedDate));
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

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

    setShowCompleteModal(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={palette.backgroundTop} />

      <AnimatedThemeBackdrop
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        mode={mode}
        primaryGlow={mode === 'dark' ? (palette.greenSoft ?? 'rgba(0,255,157,0.1)') : 'rgba(31, 165, 91, 0.1)'}
        secondaryGlow={mode === 'dark' ? (palette.purpleSoft ?? 'rgba(217,70,239,0.1)') : 'rgba(140, 92, 255, 0.08)'}
        accentGlow={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.42)'}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
                <Ionicons name="arrow-back" size={18} color={palette.text} />
              </Pressable>

              <Text style={styles.topTitle}>Schedule</Text>

              <Pressable
                onPress={() => navigation.navigate('Insights')}
                style={styles.topIconButton}
              >
                <Ionicons name="settings-outline" size={18} color={palette.text} />
              </Pressable>
            </View>

            <View style={styles.summaryShell}>
              <View style={styles.summaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryTitle}>Today's Agenda</Text>
                  <Text style={styles.summaryText}>{summaryText}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.summaryPercent}>{`${completionPercent}% complete`}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                  </View>
                </View>
              </View>

              {activeSession ? (
                <View style={styles.liveFocusCard}>
                  <View style={styles.liveFocusRing}>
                     <Svg width={64} height={64} viewBox="0 0 64 64">
                       <Circle cx="32" cy="32" r="28" stroke={mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="4" fill="none" />
                       <Circle 
                        cx="32" cy="32" r="28" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - activeSession.remainingSeconds / (activeSession.presetMinutes * 60 || 1))}
                        strokeLinecap="round"
                        transform="rotate(-90 32 32)"
                       />
                     </Svg>
                     <View style={{ position: 'absolute' }}>
                        <Ionicons 
                          name={activeTask ? (getCategoryStyles(palette)[activeTask.category]?.icon || 'flash') : 'flash'} 
                          size={24} 
                          color="#10b981" 
                        />
                     </View>
                  </View>

                  <View style={styles.liveFocusCopy}>
                    <View style={styles.liveFocusChip}>
                      <Text style={styles.liveFocusChipText}>FOCUSING NOW</Text>
                    </View>
                    <Text style={styles.liveFocusTitle}>{activeTask?.title || 'Focus Session'}</Text>
                    <View style={styles.liveFocusMeta}>
                      <Ionicons name="time-outline" size={14} color={palette.textMuted} />
                      <Text style={styles.liveFocusMetaText}>
                        {activeTask ? `${activeTask.startTime} • ${activeTask.durationMinutes} min` : 'Custom focus'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.liveFocusTimerWrap}>
                    <Text style={styles.liveFocusRemaining}>
                      {formatCountdown(activeSession.remainingSeconds)}
                    </Text>
                    <Text style={styles.liveFocusRemainingLabel}>remaining</Text>
                  </View>

                  <Pressable
                    onPress={activeSession.paused ? resumeSession : pauseSession}
                    style={styles.liveFocusButton}
                  >
                    <Ionicons 
                      name={activeSession.paused ? 'play-outline' : 'pause-outline'} 
                      size={20} 
                      color="#10b981" 
                    />
                    <Text style={styles.liveFocusButtonText}>
                      {activeSession.paused ? 'Resume' : 'Pause'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.suggestionsShell}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={styles.suggestionsLabel}>Suggested for you</Text>
                  <Text style={{ fontSize: 13, color: palette.green, fontWeight: '700' }}>See all</Text>
                </View>

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
                          name={suggestion.added ? 'checkmark-circle' : 'add'}
                          size={suggestion.added ? 20 : 24}
                          color={suggestion.added ? palette.green : palette.backgroundTop}
                        />
                      </Pressable>
                    </View>
                  );
                })}

                <Pressable
                  onPress={() => setComposerOpen((current) => !current)}
                  style={[styles.addCustomButton, { borderStyle: 'dashed', backgroundColor: mode === 'dark' ? 'transparent' : '#f0fdf4' }]}
                >
                  <Text style={styles.addCustomButtonText}>Add custom task</Text>
                </Pressable>
              </View>
            </View>

            {composerOpen ? (
              <LinearGradient
                colors={mode === 'dark' ? ['rgba(31, 165, 91, 0.12)', 'rgba(30, 32, 44, 0.95)'] : ['rgba(31, 165, 91, 0.05)', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.composerCard}
              >
                <View style={styles.composerHeader}>
                  <Text style={styles.composerTitle}>
                    {editingTaskId ? 'Update task' : 'Add custom task'}
                  </Text>
                  <Pressable 
                    onPress={() => setComposerOpen(false)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={styles.composerHide}>Hide</Text>
                  </Pressable>
                </View>

                <View style={styles.inputShell}>
                  <Text style={styles.inputLabel}>Task name</Text>
                  <TextInput
                    value={draft.title}
                    onChangeText={(value) => patchDraft('title', value)}
                    placeholder="E.g. Morning Meditation"
                    placeholderTextColor={palette.textSoft}
                    style={styles.primaryInput}
                    selectionColor={palette.green}
                  />
                </View>

                <View style={styles.inlineInputs}>
                  <View style={[styles.inputShell, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Start time</Text>
                    <TextInput
                      value={draft.startTime}
                      onChangeText={(value) => patchDraft('startTime', value)}
                      placeholder="09:00 AM"
                      placeholderTextColor={palette.textSoft}
                      style={styles.secondaryInput}
                      selectionColor={palette.green}
                    />
                  </View>

                  <View style={[styles.inputShell, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Duration</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput
                        value={draft.durationMinutes}
                        onChangeText={handleDurationChange}
                        keyboardType="number-pad"
                        placeholder="45"
                        placeholderTextColor={palette.textSoft}
                        style={[styles.secondaryInput, { flex: 1 }]}
                        selectionColor={palette.green}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputShell}>
                  <Text style={styles.inputLabel}>Deep focus duration (min)</Text>
                  <TextInput
                    value={draft.focusPresetMinutes}
                    onChangeText={(value) =>
                      patchDraft('focusPresetMinutes', normalizePlannerNumberInput(value))
                    }
                    keyboardType="number-pad"
                    placeholder="45"
                    placeholderTextColor={palette.textSoft}
                    style={styles.secondaryInput}
                    selectionColor={palette.green}
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
                          active ? { 
                            backgroundColor: categoryStyle.bg, 
                            borderColor: categoryStyle.text,
                            shadowColor: categoryStyle.text,
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 2
                          } : null,
                        ]}
                      >
                        <Ionicons name={categoryStyle.icon} size={16} color={active ? categoryStyle.text : palette.textMuted} />
                        <Text style={[
                          styles.categoryChipLabel, 
                          { color: active ? categoryStyle.text : palette.textMuted }
                        ]}>
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable 
                  onPress={handleSubmitTask} 
                  style={({ pressed }) => [
                    styles.saveButton,
                    { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
                  ]}
                >
                  <Text style={styles.saveButtonText}>
                    {editingTaskId ? 'Save Changes' : 'Create task'}
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
                  <View key={task.id} style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
                    <View style={styles.taskTop}>
                      <View style={styles.taskIdentity}>
                        <View style={[styles.taskIconWrap, { backgroundColor: categoryStyle.bg }]}>
                          <Ionicons
                            name={categoryStyle.icon}
                            size={20}
                            color={categoryStyle.text}
                          />
                        </View>

                        <View style={styles.taskCopy}>
                          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                            {task.title}
                          </Text>
                          <Text style={styles.taskMeta}>
                            {`${task.startTime} • ${task.durationMinutes} min`}
                            {activeSession && activeSession.linkedTaskId === task.id && (
                              <Text style={{ color: palette.green }}>
                                {` • Live ${formatCountdown(activeSession.remainingSeconds)}`}
                              </Text>
                            )}
                          </Text>
                        </View>
                      </View>

                      {task.completed ? (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={palette.green} />
                          <Text style={styles.completedBadgeText}>Done</Text>
                        </View>
                      ) : (
                        <Pressable style={styles.openButton}>
                          <Text style={styles.openButtonText}>Open</Text>
                          <Ionicons name="chevron-forward" size={14} color={palette.blue} />
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.actionsGrid}>
                      <PlannerQuickAction
                        icon={task.completed ? 'refresh-outline' : 'checkmark-done-outline'}
                        label={task.completed ? 'Undo' : 'Complete'}
                        tone="success"
                        onPress={() => toggleTaskCompleted(task.id)}
                        palette={palette}
                        styles={styles}
                      />
                      {!task.completed && (
                        <>
                          <PlannerQuickAction
                            icon="play-outline"
                            label="Start focus"
                            tone="primary"
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
                        </>
                      )}
                      <PlannerQuickAction
                        icon="trash-outline"
                        label="Delete"
                        tone="danger"
                        onPress={() => deleteTask(task.id)}
                        palette={palette}
                        styles={styles}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        <FocusCompleteModal
          visible={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
        />
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
  tone?: 'default' | 'success' | 'danger' | 'primary';
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
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickAction,
        isDanger ? styles.quickActionDanger : 
        isSuccess ? styles.quickActionSuccess : 
        isPrimary ? styles.quickActionPrimary : null,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isDanger ? palette.red : isSuccess ? palette.green : isPrimary ? palette.blue : palette.text}
      />
      <Text
        style={[
          styles.quickActionLabel,
          isDanger ? { color: palette.red } : 
          isSuccess ? { color: palette.green } : 
          isPrimary ? { color: palette.blue } : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
