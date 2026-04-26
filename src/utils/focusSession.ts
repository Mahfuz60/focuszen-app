export type ActiveFocusSession = {
  startedAt: string;
  presetMinutes: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  deepWork: boolean;
  linkedTaskId?: string;
};

export function extendActiveFocusSession(
  activeSession: ActiveFocusSession | null,
  extraMinutes: number
) {
  if (!activeSession || extraMinutes <= 0) {
    return activeSession;
  }

  const extraSeconds = extraMinutes * 60;

  return {
    ...activeSession,
    presetMinutes: activeSession.presetMinutes + extraMinutes,
    remainingSeconds: activeSession.remainingSeconds + extraSeconds,
  };
}

export function setActiveFocusSessionTotalMinutes(
  activeSession: ActiveFocusSession | null,
  nextMinutes: number
) {
  if (!activeSession) {
    return activeSession;
  }

  const minimumMinutes = Math.max(15, Math.ceil(activeSession.elapsedSeconds / 60));
  const presetMinutes = Math.max(minimumMinutes, Math.round(nextMinutes));

  return {
    ...activeSession,
    presetMinutes,
    remainingSeconds: Math.max(presetMinutes * 60 - activeSession.elapsedSeconds, 0),
  };
}
