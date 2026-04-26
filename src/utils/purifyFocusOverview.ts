import { AppLanguage, FocusSession, StudySession, UsageEntry } from '../types/models';
import { buildInsightsDashboard } from './insightsAnalytics';

type OverviewMetric = {
  label: string;
  value: string;
};

type OverviewFact = {
  label: string;
  value: string;
};

type OverviewChartItem = {
  label: string;
  value: number;
};

type OverviewSeries = {
  id: string;
  label: string;
  color: string;
  totalMinutes: number;
  values: number[];
};

type BuildPurifyFocusOverviewInput = {
  language: AppLanguage;
  range: 'week' | 'month' | 'year';
  anchorDate: Date;
  focusSessions: FocusSession[];
  studySessions: StudySession[];
  usageEntries: UsageEntry[];
};

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

function formatMinutes(value: number, language: AppLanguage) {
  const digits = language === 'bn' ? toBanglaDigits(String(value)) : String(value);
  return language === 'bn' ? `${digits}\u09AE\u09BF` : `${digits}m`;
}

export function buildPurifyFocusOverview({
  language,
  range,
  anchorDate,
  focusSessions,
  studySessions,
  usageEntries,
}: BuildPurifyFocusOverviewInput) {
  const dashboard = buildInsightsDashboard({
    range,
    metric: 'focus',
    anchorDate,
    focusSessions,
    studySessions,
    usageEntries,
  });

  const bestDayLabel = dashboard.hero.bestBucket?.label ?? (language === 'bn' ? '\u09A8\u09C7\u0987' : 'None');
  const topAppLabel = dashboard.topApps[0]?.appName ?? (language === 'bn' ? '\u09A8\u09C7\u0987' : 'None');

  return {
    title: language === 'bn' ? '\u09AB\u09CB\u0995\u09BE\u09B8 \u0993\u09AD\u09BE\u09B0\u09AD\u09BF\u0989' : 'Focus overview',
    subtitle:
      language === 'bn'
        ? '\u09AB\u09CB\u0995\u09BE\u09B8, \u09AA\u09A1\u09BC\u09BE\u09B6\u09CB\u09A8\u09BE, \u098F\u09AC\u0982 \u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09A1\u09BE\u099F\u09BE \u098F\u0995 \u09A8\u099C\u09B0\u09C7\u0964'
        : 'Focus, study, and social data in one view.',
    metrics: {
      focus: {
        label: language === 'bn' ? '\u09AB\u09CB\u0995\u09BE\u09B8' : 'Focus',
        value: formatMinutes(dashboard.balance.focusMinutes, language),
      } as OverviewMetric,
      study: {
        label: language === 'bn' ? '\u09AA\u09A1\u09BC\u09BE\u09B6\u09CB\u09A8\u09BE' : 'Study',
        value: formatMinutes(dashboard.balance.studyMinutes, language),
      } as OverviewMetric,
      social: {
        label: language === 'bn' ? '\u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2' : 'Social',
        value: formatMinutes(dashboard.balance.socialMinutes, language),
      } as OverviewMetric,
    },
    bestDay: {
      label: language === 'bn' ? '\u09B8\u09C7\u09B0\u09BE \u09A6\u09BF\u09A8' : 'Best day',
      value: bestDayLabel,
    } as OverviewFact,
    topApp: {
      label: language === 'bn' ? '\u09B6\u09C0\u09B0\u09CD\u09B7 \u0985\u09CD\u09AF\u09BE\u09AA' : 'Top app',
      value: topAppLabel,
    } as OverviewFact,
    series: [
      {
        id: 'focus',
        label: language === 'bn' ? '\u09AB\u09CB\u0995\u09BE\u09B8' : 'Focus',
        color: '#7b5cff',
        totalMinutes: dashboard.balance.focusMinutes,
        values: dashboard.hero.buckets.map((bucket) => bucket.minutes),
      },
      {
        id: 'study',
        label: language === 'bn' ? '\u09AA\u09A1\u09BC\u09BE\u09B6\u09CB\u09A8\u09BE' : 'Study',
        color: '#86c8ff',
        totalMinutes: dashboard.balance.studyMinutes,
        values: dashboard.hero.buckets.map((bucket) => {
          const bucketStart = new Date(bucket.startIso);
          const bucketEnd = new Date(bucket.endIso);

          return studySessions
            .filter((session) => {
              const startedAt = new Date(session.startedAt);
              return startedAt >= bucketStart && startedAt <= bucketEnd;
            })
            .reduce((total, session) => total + session.durationMinutes, 0);
        }),
      },
    ] as OverviewSeries[],
    chartItems: dashboard.hero.buckets.map((bucket) => ({
      label: bucket.shortLabel,
      value: bucket.minutes,
    })) as OverviewChartItem[],
  };
}
