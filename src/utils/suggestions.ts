import { SuggestionCard, TimeWindow, UsageEntry, StudySession } from '../types/models';
import { getMostUsedApp, getPeakUsageTime } from './usage';

function inferWindow(hour: number): TimeWindow {
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  if (hour < 21) {
    return 'evening';
  }
  return 'night';
}

export function generateSuggestions(usageEntries: UsageEntry[], studySessions: StudySession[]): SuggestionCard[] {
  const mostUsed = getMostUsedApp(usageEntries);
  const peakUsageHour = getPeakUsageTime(usageEntries);
  const bestStudy = [...studySessions].sort((left, right) => right.durationMinutes - left.durationMinutes)[0];
  const bestStudyHour = bestStudy ? new Date(bestStudy.startedAt).getHours() : 19;
  const suggestions: SuggestionCard[] = [];

  if (mostUsed) {
    suggestions.push({
      id: 'dynamic-social',
      title: `You use ${mostUsed.appName} most at ${peakUsageHour}:00`,
      body: 'Try blocking that app after 10 PM to protect deep work.',
      tone: 'warning',
      actionLabel: 'Block after 10 PM',
      actionTarget: 'Control',
    });
  }

  suggestions.push({
    id: 'dynamic-study',
    title: `You study best in the ${inferWindow(bestStudyHour)}`,
    body: 'Anchor your hardest task in that time window this week.',
    tone: 'positive',
    actionLabel: 'Start focus session',
    actionTarget: 'Focus',
  });

  return suggestions;
}
