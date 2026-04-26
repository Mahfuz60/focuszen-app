import { AppControlSettings, AppLanguage, UsageEntry } from '../types/models';

type OverviewMetric = {
  label: string;
  value: string;
};

type OverviewFact = {
  label: string;
  value: string;
};

type OverviewSeries = {
  id: string;
  label: string;
  color: string;
  totalMinutes: number;
  values: number[];
};

type BuildControlInsightsOverviewInput = {
  language: AppLanguage;
  anchorDate: Date;
  controls: AppControlSettings[];
  usageEntries: UsageEntry[];
  strictModeEnabled: boolean;
};

const DAY_LABELS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const DAY_LABELS_BN = [
  '\u09B6\u09A8\u09BF',
  '\u09B0\u09AC\u09BF',
  '\u09B8\u09CB\u09AE',
  '\u09AE\u0999\u09CD\u0997\u09B2',
  '\u09AC\u09C1\u09A7',
  '\u09AC\u09C3\u09B9',
  '\u09B6\u09C1\u0995\u09CD\u09B0',
] as const;
const SERIES_COLORS = ['#7b5cff', '#86c8ff', '#f0ac57'] as const;

function toBanglaDigits(value: string) {
  const digits = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
  return value
    .split('')
    .map((character) => {
      const parsed = Number(character);
      return Number.isNaN(parsed) ? character : digits[parsed];
    })
    .join('');
}

function formatNumber(value: number, language: AppLanguage) {
  return language === 'bn' ? toBanglaDigits(String(value)) : String(value);
}

function formatMinutes(value: number, language: AppLanguage) {
  const digits = formatNumber(value, language);
  return language === 'bn' ? `${digits}\u09AE\u09BF` : `${digits}m`;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const daysFromSaturday = (start.getDay() + 1) % 7;
  start.setDate(start.getDate() - daysFromSaturday);
  return start;
}

function countEnabledFeatures(control: AppControlSettings) {
  return Object.values(control.features).filter(Boolean).length;
}

export function buildControlInsightsOverview({
  language,
  anchorDate,
  controls,
  usageEntries,
  strictModeEnabled,
}: BuildControlInsightsOverviewInput) {
  const weekStart = startOfWeek(anchorDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  weekEnd.setMilliseconds(weekEnd.getMilliseconds() - 1);

  const inWeekEntries = usageEntries.filter((entry) => {
    const date = new Date(entry.date);
    return date >= weekStart && date <= weekEnd;
  });

  const totals = new Map<string, number>();
  inWeekEntries.forEach((entry) => {
    totals.set(entry.appName, (totals.get(entry.appName) ?? 0) + entry.minutesUsed);
  });

  const topApps = [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([appName]) => appName);

  const dayLabels = language === 'bn' ? DAY_LABELS_BN : DAY_LABELS_EN;
  const series = topApps.map((appName, index) => {
    const values = Array.from({ length: 7 }, (_, dayIndex) => {
      const bucketDate = new Date(weekStart);
      bucketDate.setDate(weekStart.getDate() + dayIndex);

      return inWeekEntries
        .filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            entry.appName === appName &&
            entryDate.getFullYear() === bucketDate.getFullYear() &&
            entryDate.getMonth() === bucketDate.getMonth() &&
            entryDate.getDate() === bucketDate.getDate()
          );
        })
        .reduce((total, entry) => total + entry.minutesUsed, 0);
    });

    return {
      id: appName.toLowerCase(),
      label: appName,
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      totalMinutes: values.reduce((total, value) => total + value, 0),
      values,
    } as OverviewSeries;
  });

  const protectedApps = controls.filter(
    (control) => control.blocked || countEnabledFeatures(control) > 0 || Boolean(control.timeLimitMinutes)
  ).length;
  const blockedApps = controls.filter((control) => control.blocked).length;
  const totalUsage = inWeekEntries.reduce((total, entry) => total + entry.minutesUsed, 0);
  const topApp = series[0]
    ? `${series[0].label} (${formatMinutes(series[0].totalMinutes, language)})`
    : language === 'bn'
      ? '\u09A8\u09C7\u0987'
      : 'None';

  return {
    title: language === 'bn' ? '\u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2 \u0987\u09A8\u09B8\u09BE\u0987\u099F\u09B8' : 'Control insights',
    subtitle:
      language === 'bn'
        ? '\u09A1\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09CD\u09B6\u09A8 \u0985\u09CD\u09AF\u09BE\u09AA \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09CB\u099F\u09C7\u0995\u09B6\u09A8 \u09B0\u09C1\u09B2 \u098F\u0995 \u09A8\u099C\u09B0\u09C7\u0964'
        : 'Distraction apps and protection rules in one view.',
    metrics: {
      protected: {
        label: language === 'bn' ? '\u09AA\u09CD\u09B0\u09CB\u099F\u09C7\u0995\u09CD\u099F\u09C7\u09A1' : 'Protected',
        value: formatNumber(protectedApps, language),
      } as OverviewMetric,
      blocked: {
        label: language === 'bn' ? '\u09AC\u09CD\u09B2\u0995\u09A1' : 'Blocked',
        value: formatNumber(blockedApps, language),
      } as OverviewMetric,
      usage: {
        label: language === 'bn' ? '\u0987\u0989\u099C\u09C7\u099C' : 'Usage',
        value: formatMinutes(totalUsage, language),
      } as OverviewMetric,
    },
    facts: {
      topApp: {
        label: language === 'bn' ? '\u09B6\u09C0\u09B0\u09CD\u09B7 \u0985\u09CD\u09AF\u09BE\u09AA' : 'Top app',
        value: topApp,
      } as OverviewFact,
      strict: {
        label: language === 'bn' ? '\u09B8\u09CD\u099F\u09CD\u09B0\u09BF\u0995\u09CD\u099F \u09AE\u09CB\u09A1' : 'Strict mode',
        value:
          language === 'bn'
            ? strictModeEnabled
              ? '\u099A\u09BE\u09B2\u09C1'
              : '\u09AC\u09A8\u09CD\u09A7'
            : strictModeEnabled
              ? 'On'
              : 'Off',
      } as OverviewFact,
    },
    xLabels: [...dayLabels],
    series,
  };
}
