import { PlannerCategory, PlannerTask } from '../types/models';

export type PlannerTaskDraft = {
  title: string;
  category: PlannerCategory;
  startTime: string;
  durationMinutes: string;
  focusPresetMinutes: string;
};

type PlannerViewSummary = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalMinutes: number;
  focusMinutes: number;
  completionRate: number;
};

type PlannerViewModel = {
  visibleTasks: PlannerTask[];
  nextTask: PlannerTask | null;
  summary: PlannerViewSummary;
  usesFallbackTasks: boolean;
};

export type PlannerSuggestion = {
  id: string;
  title: string;
  routineLabel: string;
  durationMinutes: number;
  startTime: string;
  category: PlannerCategory;
  focusPresetMinutes?: number;
  icon: string;
};

export const plannerCategories: PlannerCategory[] = ['Study', 'Work', 'Health', 'Personal'];

const TASK_ICONS: Record<PlannerCategory, string> = {
  Study: 'book-outline',
  Work: 'briefcase-outline',
  Health: 'fitness-outline',
  Personal: 'sparkles-outline',
};

function padTime(value: number) {
  return value.toString().padStart(2, '0');
}

function isSamePlannerDay(firstIso: string, secondIso: string) {
  return firstIso.slice(0, 10) === secondIso.slice(0, 10);
}

function sortPlannerTasks(tasks: PlannerTask[]) {
  return [...tasks].sort((left, right) => {
    const leftStamp = `${left.scheduledDate}|${left.startTime}|${left.title}`;
    const rightStamp = `${right.scheduledDate}|${right.startTime}|${right.title}`;

    return leftStamp.localeCompare(rightStamp);
  });
}

function readPositiveMinutes(value: string, label: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`${label} must be greater than 0`);
  }

  return parsedValue;
}

export function normalizePlannerTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim();
}

export function normalizePlannerNumberInput(value: string) {
  return value.replace(/[^0-9]/g, '');
}

export function parseTimeInput(timeStr: string): [number, number] {
  const match = timeStr.trim().match(/^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(?:\s*([AaPp][Mm]))?$/);
  if (!match) throw new Error('Time must use HH:MM or HH:MM AM/PM');
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm) {
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  return [hours, minutes];
}

export function formatAmPm(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${padTime(hours)}:${padTime(minutes)} ${ampm}`;
}

export function createPlannerDraft(selectedDate: string) {
  const now = new Date();

  return {
    title: '',
    category: 'Study' as const,
    startTime: formatAmPm(now),
    durationMinutes: '45',
    focusPresetMinutes: '45',
  };
}

export function buildPlannerDraftFromTask(task: PlannerTask): PlannerTaskDraft {
  return {
    title: task.title,
    category: task.category,
    startTime: task.startTime,
    durationMinutes: String(task.durationMinutes),
    focusPresetMinutes: task.focusPresetMinutes ? String(task.focusPresetMinutes) : '',
  };
}

export function syncPlannerDuration(draft: PlannerTaskDraft, nextDuration: string): PlannerTaskDraft {
  const normalizedDuration = normalizePlannerNumberInput(nextDuration);

  return {
    ...draft,
    durationMinutes: normalizedDuration,
    focusPresetMinutes: normalizedDuration,
  };
}

export function buildPlannerTaskFromDraft(
  draft: PlannerTaskDraft,
  selectedDate: string,
  taskId: string,
  existingTask?: PlannerTask
): PlannerTask {
  const title = normalizePlannerTitle(draft.title);

  if (!title) {
    throw new Error('Task name is required');
  }

  const [hours, minutes] = parseTimeInput(draft.startTime);

  const durationMinutes = readPositiveMinutes(draft.durationMinutes, 'Duration');
  const focusPresetMinutes = draft.focusPresetMinutes.trim()
    ? readPositiveMinutes(draft.focusPresetMinutes, 'Focus time')
    : durationMinutes;

  const scheduledDate = new Date(selectedDate);
  scheduledDate.setUTCHours(hours, minutes, 0, 0);

  return {
    id: taskId,
    title,
    category: draft.category,
    scheduledDate: scheduledDate.toISOString(),
    startTime: draft.startTime,
    durationMinutes,
    completed: existingTask?.completed ?? false,
    focusPresetMinutes,
    icon: TASK_ICONS[draft.category],
  };
}

export function buildPlannerViewModel(tasks: PlannerTask[], selectedDate: string): PlannerViewModel {
  const selectedDayTasks = tasks.filter((task) => isSamePlannerDay(task.scheduledDate, selectedDate));
  const visibleTasks = sortPlannerTasks(selectedDayTasks.length > 0 ? selectedDayTasks : tasks);
  const completedTasks = visibleTasks.filter((task) => task.completed).length;
  const totalTasks = visibleTasks.length;
  const totalMinutes = visibleTasks.reduce((sum, task) => sum + task.durationMinutes, 0);
  const focusMinutes = visibleTasks.reduce((sum, task) => sum + (task.focusPresetMinutes ?? 0), 0);

  return {
    visibleTasks,
    nextTask: visibleTasks.find((task) => !task.completed) ?? null,
    summary: {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      totalMinutes,
      focusMinutes,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    usesFallbackTasks: selectedDayTasks.length === 0 && tasks.length > 0,
  };
}

const plannerSuggestions: PlannerSuggestion[] = [
  {
    id: 'suggestion-priorities',
    title: 'Plan top 3 priorities',
    routineLabel: 'Morning routine',
    durationMinutes: 10,
    startTime: '09:00',
    category: 'Work',
    focusPresetMinutes: 10,
    icon: 'checkmark-done-outline',
  },
  {
    id: 'suggestion-no-phone',
    title: 'No phone after 10 PM',
    routineLabel: 'Night reset',
    durationMinutes: 60,
    startTime: '22:00',
    category: 'Personal',
    focusPresetMinutes: 60,
    icon: 'moon-outline',
  },
  {
    id: 'suggestion-stretch',
    title: 'Stretch',
    routineLabel: 'Morning routine',
    durationMinutes: 10,
    startTime: '07:30',
    category: 'Health',
    focusPresetMinutes: 10,
    icon: 'body-outline',
  },
];

export function buildPlannerSuggestions(selectedDate: string, tasks: PlannerTask[]) {
  const selectedTitles = new Set(
    tasks
      .filter((task) => isSamePlannerDay(task.scheduledDate, selectedDate))
      .map((task) => normalizePlannerTitle(task.title).toLowerCase())
  );

  return plannerSuggestions.map((suggestion) => ({
    ...suggestion,
    added: selectedTitles.has(normalizePlannerTitle(suggestion.title).toLowerCase()),
  }));
}

export function buildPlannerTaskFromSuggestion(
  suggestion: PlannerSuggestion,
  selectedDate: string,
  taskId: string
): PlannerTask {
  const scheduledDate = new Date(selectedDate);
  const [hours, minutes] = suggestion.startTime.split(':').map((value) => Number.parseInt(value, 10));
  scheduledDate.setUTCHours(hours, minutes, 0, 0);

  return {
    id: taskId,
    title: suggestion.title,
    category: suggestion.category,
    scheduledDate: scheduledDate.toISOString(),
    startTime: suggestion.startTime,
    durationMinutes: suggestion.durationMinutes,
    completed: false,
    focusPresetMinutes: suggestion.focusPresetMinutes,
    icon: suggestion.icon,
  };
}
