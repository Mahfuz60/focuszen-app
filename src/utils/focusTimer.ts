import { PlannerTask } from '../types/models';

type ActiveFocusSession = {
  startedAt: string;
  presetMinutes: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  deepWork: boolean;
  linkedTaskId?: string;
};

type FocusTimerWatch = {
  state: 'idle' | 'running' | 'paused';
  title: string;
  subtitle: string;
  countdown: string;
  progressPercent: number;
  primaryLabel: 'Start focus' | 'Pause' | 'Resume';
};

export function formatFocusCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function buildFocusTimerWatch(
  activeSession: ActiveFocusSession | null,
  tasks: PlannerTask[]
): FocusTimerWatch {
  if (!activeSession) {
    return {
      state: 'idle',
      title: 'No focus session running',
      subtitle: 'Start a task from your planner to see a live timer here.',
      countdown: '00:00',
      progressPercent: 0,
      primaryLabel: 'Start focus',
    };
  }

  const linkedTask = activeSession.linkedTaskId
    ? tasks.find((task) => task.id === activeSession.linkedTaskId) ?? null
    : null;
  const totalSeconds = activeSession.presetMinutes * 60;
  const progressPercent = totalSeconds
    ? Math.round((activeSession.elapsedSeconds / totalSeconds) * 100)
    : 0;

  return {
    state: activeSession.paused ? 'paused' : 'running',
    title: linkedTask?.title ?? `Focus session ${activeSession.paused ? 'paused' : 'running'}`,
    subtitle: `${activeSession.deepWork ? 'Deep focus' : 'Standard focus'} • ${activeSession.presetMinutes} min preset`,
    countdown: formatFocusCountdown(activeSession.remainingSeconds),
    progressPercent: Math.min(Math.max(progressPercent, 0), 100),
    primaryLabel: activeSession.paused ? 'Resume' : 'Pause',
  };
}
