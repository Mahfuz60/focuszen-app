import { AppControlTarget, FocusSession, StudySession, UsageEntry } from '../types/models';

export type InsightsRange = 'day' | 'week' | 'month' | 'year';
export type InsightsMetric = 'focus' | 'social';

export type InsightsBucket = {
  key: string;
  label: string;
  shortLabel: string;
  startIso: string;
  endIso: string;
  minutes: number;
};

export type InsightsHero = {
  buckets: InsightsBucket[];
  totalMinutes: number;
  averageMinutes: number;
  previousTotalMinutes: number;
  changePercent: number;
  periodLabel: string;
  bestBucket: InsightsBucket | null;
};

export type TopAppInsight = {
  appName: AppControlTarget;
  minutes: number;
  opens: number;
  share: number;
};

export type StudyInsight = {
  totalMinutes: number;
  averageMinutes: number;
  sessionCount: number;
  bestSubject: string | null;
  bestSessionMinutes: number;
};

export type FocusBalanceInsight = {
  focusMinutes: number;
  socialMinutes: number;
  studyMinutes: number;
  ratio: number;
};

export type InsightsDashboard = {
  hero: InsightsHero;
  topApps: TopAppInsight[];
  study: StudyInsight;
  balance: FocusBalanceInsight;
  usageEntriesInRange: UsageEntry[];
  studySessionsInRange: StudySession[];
};

type BuildInsightsDashboardInput = {
  range: InsightsRange;
  metric: InsightsMetric;
  anchorDate: Date;
  focusSessions: FocusSession[];
  studySessions: StudySession[];
  usageEntries: UsageEntry[];
};

type Bounds = {
  start: Date;
  end: Date;
};

type BucketSeed = {
  key: string;
  label: string;
  shortLabel: string;
  start: Date;
  end: Date;
};

const DAY_LABELS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function getLatestInsightsAnchorDate({
  focusSessions,
  studySessions,
  usageEntries,
}: Pick<BuildInsightsDashboardInput, 'focusSessions' | 'studySessions' | 'usageEntries'>) {
  const timestamps = [
    ...focusSessions.map((session) => getFocusSessionDate(session).getTime()),
    ...studySessions.map((session) => new Date(session.startedAt).getTime()),
    ...usageEntries.map((entry) => new Date(entry.date).getTime()),
  ].filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return new Date();
  }

  return new Date(Math.max(...timestamps));
}

export function shiftInsightsAnchorDate(anchorDate: Date, range: InsightsRange, delta: number) {
  const shifted = new Date(anchorDate);

  if (range === 'day') {
    shifted.setDate(shifted.getDate() + delta);
    return shifted;
  }

  if (range === 'week') {
    shifted.setDate(shifted.getDate() + delta * 7);
    return shifted;
  }

  if (range === 'month') {
    shifted.setMonth(shifted.getMonth() + delta);
    return shifted;
  }

  shifted.setFullYear(shifted.getFullYear() + delta);
  return shifted;
}

export function buildInsightsDashboard({
  range,
  metric,
  anchorDate,
  focusSessions,
  studySessions,
  usageEntries,
}: BuildInsightsDashboardInput): InsightsDashboard {
  const currentBounds = getPeriodBounds(anchorDate, range);
  const previousAnchorDate = shiftInsightsAnchorDate(anchorDate, range, -1);
  const previousBounds = getPeriodBounds(previousAnchorDate, range);
  const currentUsage = usageEntries.filter((entry) => isDateWithinBounds(new Date(entry.date), currentBounds));
  const previousUsage = usageEntries.filter((entry) => isDateWithinBounds(new Date(entry.date), previousBounds));
  const currentFocus = focusSessions.filter((session) =>
    isDateWithinBounds(getFocusSessionDate(session), currentBounds)
  );
  const previousFocus = focusSessions.filter((session) =>
    isDateWithinBounds(getFocusSessionDate(session), previousBounds)
  );
  const currentStudy = studySessions.filter((session) =>
    isDateWithinBounds(new Date(session.startedAt), currentBounds)
  );

  const currentMetricRecords =
    metric === 'focus'
      ? currentFocus.map((session) => ({
          date: getFocusSessionDate(session),
          minutes: session.completedMinutes,
        }))
      : currentUsage.map((entry) => ({
          date: new Date(entry.date),
          minutes: entry.minutesUsed,
        }));

  const previousMetricTotal =
    metric === 'focus'
      ? previousFocus.reduce((total, session) => total + session.completedMinutes, 0)
      : previousUsage.reduce((total, entry) => total + entry.minutesUsed, 0);

  const buckets = buildBucketSeeds(range, currentBounds).map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    shortLabel: bucket.shortLabel,
    startIso: bucket.start.toISOString(),
    endIso: bucket.end.toISOString(),
    minutes: currentMetricRecords
      .filter((record) => isDateWithinBounds(record.date, { start: bucket.start, end: bucket.end }))
      .reduce((total, record) => total + record.minutes, 0),
  }));

  const totalMinutes = buckets.reduce((total, bucket) => total + bucket.minutes, 0);
  const bestBucket = [...buckets].sort((left, right) => right.minutes - left.minutes)[0] ?? null;
  const focusMinutes = currentFocus.reduce((total, session) => total + session.completedMinutes, 0);
  const socialMinutes = currentUsage.reduce((total, entry) => total + entry.minutesUsed, 0);
  const studyMinutes = currentStudy.reduce((total, session) => total + session.durationMinutes, 0);
  const topApps = buildTopApps(currentUsage);

  return {
    hero: {
      buckets,
      totalMinutes,
      averageMinutes: buckets.length > 0 ? Math.round(totalMinutes / buckets.length) : 0,
      previousTotalMinutes: previousMetricTotal,
      changePercent: calculateChangePercent(totalMinutes, previousMetricTotal),
      periodLabel: formatPeriodLabel(range, currentBounds),
      bestBucket: bestBucket && bestBucket.minutes > 0 ? bestBucket : null,
    },
    topApps,
    study: {
      totalMinutes: studyMinutes,
      averageMinutes: currentStudy.length > 0 ? Math.round(studyMinutes / currentStudy.length) : 0,
      sessionCount: currentStudy.length,
      bestSubject: getBestStudySession(currentStudy)?.subject ?? null,
      bestSessionMinutes: getBestStudySession(currentStudy)?.durationMinutes ?? 0,
    },
    balance: {
      focusMinutes,
      socialMinutes,
      studyMinutes,
      ratio: socialMinutes === 0 ? focusMinutes : Number((focusMinutes / socialMinutes).toFixed(2)),
    },
    usageEntriesInRange: currentUsage,
    studySessionsInRange: currentStudy,
  };
}

function buildTopApps(entries: UsageEntry[]) {
  const totals = new Map<AppControlTarget, TopAppInsight>();
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutesUsed, 0);

  entries.forEach((entry) => {
    const existing = totals.get(entry.appName);

    if (existing) {
      existing.minutes += entry.minutesUsed;
      existing.opens += entry.opens;
      return;
    }

    totals.set(entry.appName, {
      appName: entry.appName,
      minutes: entry.minutesUsed,
      opens: entry.opens,
      share: 0,
    });
  });

  return [...totals.values()]
    .map((entry) => ({
      ...entry,
      share: totalMinutes > 0 ? Math.round((entry.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((left, right) => {
      const minutesDelta = right.minutes - left.minutes;

      if (minutesDelta !== 0) {
        return minutesDelta;
      }

      const opensDelta = right.opens - left.opens;

      if (opensDelta !== 0) {
        return opensDelta;
      }

      return left.appName.localeCompare(right.appName);
    });
}

function getBestStudySession(sessions: StudySession[]) {
  return [...sessions].sort((left, right) => right.durationMinutes - left.durationMinutes)[0];
}

function getFocusSessionDate(session: FocusSession) {
  return new Date(session.endedAt ?? session.startedAt);
}

function calculateChangePercent(currentTotal: number, previousTotal: number) {
  if (previousTotal === 0) {
    return currentTotal === 0 ? 0 : 100;
  }

  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

function buildBucketSeeds(range: InsightsRange, bounds: Bounds): BucketSeed[] {
  if (range === 'day') {
    return Array.from({ length: 24 }, (_, hour) => {
      const start = new Date(bounds.start);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      end.setMilliseconds(end.getMilliseconds() - 1);

      return {
        key: `${hour}`,
        label: formatHourLabel(hour),
        shortLabel: formatHourShortLabel(hour),
        start,
        end,
      };
    });
  }

  if (range === 'week') {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const start = new Date(bounds.start);
      start.setDate(bounds.start.getDate() + dayIndex);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      end.setMilliseconds(end.getMilliseconds() - 1);

      return {
        key: `${dayIndex}`,
        label: DAY_LABELS[dayIndex],
        shortLabel: DAY_LABELS[dayIndex],
        start,
        end,
      };
    });
  }

  if (range === 'month') {
    const seeds: BucketSeed[] = [];
    const firstWeekStart = startOfWeek(bounds.start);
    let bucketStart = new Date(firstWeekStart);
    let index = 1;

    while (bucketStart <= bounds.end) {
      const start = new Date(bucketStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setMilliseconds(end.getMilliseconds() - 1);
      seeds.push({
        key: `week-${index}`,
        label: `W${index}`,
        shortLabel: `W${index}`,
        start,
        end,
      });
      bucketStart = new Date(start);
      bucketStart.setDate(start.getDate() + 7);
      index += 1;
    }

    return seeds;
  }

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const start = new Date(bounds.start);
    start.setMonth(monthIndex, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(monthIndex + 1, 1);
    end.setMilliseconds(end.getMilliseconds() - 1);

    return {
      key: `${monthIndex}`,
      label: MONTH_LABELS[monthIndex],
      shortLabel: MONTH_LABELS[monthIndex],
      start,
      end,
    };
  });
}

function formatPeriodLabel(range: InsightsRange, bounds: Bounds) {
  if (range === 'day') {
    return formatDate(bounds.start, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (range === 'week') {
    const startLabel = formatDate(bounds.start, { month: 'short', day: 'numeric' });
    const endLabel = formatDate(bounds.end, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} - ${endLabel}`;
  }

  if (range === 'month') {
    return formatDate(bounds.start, { month: 'long', year: 'numeric' });
  }

  return formatDate(bounds.start, { year: 'numeric' });
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour} ${period}`;
}

function formatHourShortLabel(hour: number) {
  const period = hour >= 12 ? 'p' : 'a';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}${period}`;
}

function getPeriodBounds(anchorDate: Date, range: InsightsRange): Bounds {
  const start =
    range === 'day'
      ? startOfDay(anchorDate)
      : range === 'week'
        ? startOfWeek(anchorDate)
        : range === 'month'
          ? startOfMonth(anchorDate)
          : startOfYear(anchorDate);
  const end = shiftInsightsAnchorDate(start, range, 1);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return { start, end };
}

function startOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const daysFromSaturday = (start.getDay() + 1) % 7;
  start.setDate(start.getDate() - daysFromSaturday);
  return start;
}

function startOfMonth(date: Date) {
  const start = startOfDay(date);
  start.setDate(1);
  return start;
}

function startOfYear(date: Date) {
  const start = startOfDay(date);
  start.setMonth(0, 1);
  return start;
}

function isDateWithinBounds(date: Date, bounds: Bounds) {
  return date >= bounds.start && date <= bounds.end;
}
