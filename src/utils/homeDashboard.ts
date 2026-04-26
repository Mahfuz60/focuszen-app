import { AppControlTarget, FocusSession, PlannerTask, Streak, StudySession, SuggestionCard, UsageEntry } from '../types/models';
import { isSameDay } from './date';

type ActiveFocusSession = {
  startedAt: string;
  presetMinutes: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  deepWork: boolean;
  linkedTaskId?: string;
};

type BuildHomeDashboardInput = {
  selectedDate: string;
  nowIso: string;
  focusSessions: FocusSession[];
  studySessions: StudySession[];
  usageEntries: UsageEntry[];
  tasks: PlannerTask[];
  activeSession: ActiveFocusSession | null;
  streak: Streak;
  suggestions: SuggestionCard[];
};

type HomePrimaryAction =
  | { kind: 'resume-focus'; label: string; target: 'Focus' }
  | { kind: 'start-focus'; label: string; target: 'Focus'; taskId?: string }
  | { kind: 'plan-day'; label: string; target: 'Planner' }
  | { kind: 'open-control'; label: string; target: 'Control'; appName?: AppControlTarget };

export type HomeDashboard = {
  greeting: string;
  selectedDateLabel: string;
  summary: {
    focusMinutes: number;
    studyMinutes: number;
    socialMinutes: number;
    completedTasks: number;
    totalTasks: number;
    streakDays: number;
  };
  primaryAction: HomePrimaryAction;
  activeSessionTask: PlannerTask | null;
  featuredFocusTask: PlannerTask | null;
  nextTask: PlannerTask | null;
  todayTasks: PlannerTask[];
  topDistraction: UsageEntry | null;
  suggestion: SuggestionCard | null;
};

export function buildHomeDashboard({
  selectedDate,
  nowIso,
  focusSessions,
  studySessions,
  usageEntries,
  tasks,
  activeSession,
  streak,
  suggestions,
}: BuildHomeDashboardInput): HomeDashboard {
  const selectedTasks = tasks
    .filter((task) => isSameDay(task.scheduledDate, selectedDate))
    .sort((left, right) => {
      if (left.completed !== right.completed) {
        return left.completed ? 1 : -1;
      }

      return left.startTime.localeCompare(right.startTime);
    });
  const focusMinutes = focusSessions
    .filter((session) => session.endedAt && isSameDay(session.endedAt, selectedDate))
    .reduce((total, session) => total + session.completedMinutes, 0);
  const studyMinutes = studySessions
    .filter((session) => isSameDay(session.endedAt, selectedDate))
    .reduce((total, session) => total + session.durationMinutes, 0);
  const socialEntries = usageEntries
    .filter((entry) => isSameDay(entry.date, selectedDate))
    .sort((left, right) => right.minutesUsed - left.minutesUsed);
  const socialMinutes = socialEntries.reduce((total, entry) => total + entry.minutesUsed, 0);
  const suggestedFocusTask = selectedTasks.find(
    (task) => !task.completed && task.focusPresetMinutes != null
  ) ?? null;
  const nextTask = selectedTasks.find((task) => !task.completed) ?? null;
  const activeSessionTask =
    selectedTasks.find((task) => task.id === activeSession?.linkedTaskId) ?? null;

  return {
    greeting: getGreeting(nowIso),
    selectedDateLabel: formatSelectedDateLabel(selectedDate, nowIso),
    summary: {
      focusMinutes,
      studyMinutes,
      socialMinutes,
      completedTasks: selectedTasks.filter((task) => task.completed).length,
      totalTasks: selectedTasks.length,
      streakDays: streak.current,
    },
    primaryAction: buildPrimaryAction({
      activeSession,
      tasks: selectedTasks,
      topDistraction: socialEntries[0] ?? null,
    }),
    activeSessionTask,
    featuredFocusTask: activeSessionTask ?? suggestedFocusTask ?? nextTask,
    nextTask,
    todayTasks: selectedTasks,
    topDistraction: socialEntries[0] ?? null,
    suggestion: suggestions[0] ?? null,
  };
}

function buildPrimaryAction({
  activeSession,
  tasks,
  topDistraction,
}: {
  activeSession: ActiveFocusSession | null;
  tasks: PlannerTask[];
  topDistraction: UsageEntry | null;
}): HomePrimaryAction {
  if (activeSession) {
    return {
      kind: 'resume-focus',
      label: 'Resume focus',
      target: 'Focus',
    };
  }

  const suggestedTask = tasks.find((task) => !task.completed && task.focusPresetMinutes != null);

  if (suggestedTask) {
    return {
      kind: 'start-focus',
      label: 'Start planned focus',
      target: 'Focus',
      taskId: suggestedTask.id,
    };
  }

  if (topDistraction) {
    return {
      kind: 'open-control',
      label: 'Protect your attention',
      target: 'Control',
      appName: topDistraction.appName,
    };
  }

  return {
    kind: 'plan-day',
    label: 'Plan your day',
    target: 'Planner',
  };
}

function getGreeting(nowIso: string) {
  const hour = new Date(nowIso).getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function formatSelectedDateLabel(selectedDate: string, nowIso: string) {
  if (isSameDay(selectedDate, nowIso)) {
    return 'Today';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(selectedDate));
}
