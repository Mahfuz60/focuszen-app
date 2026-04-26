import { FocusSession, Routine, Streak } from '../types/models';
import { isSameDay } from './date';

export function calculateStreak(streak: Streak, completedAtIso: string): Streak {
  if (!streak.lastCompletedDate) {
    return { current: 1, best: Math.max(streak.best, 1), lastCompletedDate: completedAtIso };
  }

  if (isSameDay(streak.lastCompletedDate, completedAtIso)) {
    return { ...streak, lastCompletedDate: completedAtIso };
  }

  const previous = new Date(streak.lastCompletedDate);
  const current = new Date(completedAtIso);
  const differenceInDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
  const currentCount = differenceInDays === 1 ? streak.current + 1 : 1;

  return {
    current: currentCount,
    best: Math.max(streak.best, currentCount),
    lastCompletedDate: completedAtIso,
  };
}

export function deriveRoutineCompletionRate(routine: Routine) {
  if (routine.steps.length === 0) {
    return 0;
  }

  const completed = routine.steps.filter((step) => step.completed).length;
  return completed / routine.steps.length;
}

export function countCompletedFocusSessions(sessions: FocusSession[]) {
  return sessions.filter((session) => session.status === 'completed').length;
}
