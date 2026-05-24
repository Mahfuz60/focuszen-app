import { AppLanguage, PurifyMilestoneKey, PurifyState } from '../types/models';

export type PurifyLanguage = AppLanguage;
export type PurifyQuoteTone = 'islamic' | 'english';

const PURIFY_MILESTONES: { key: PurifyMilestoneKey; days: number }[] = [
  { key: '7-days', days: 7 },
  { key: '14-days', days: 14 },
  { key: '30-days', days: 30 },
  { key: '90-days', days: 90 },
  { key: '365-days', days: 365 },
];

export function getPurifyMilestoneDays(milestone: PurifyMilestoneKey) {
  return PURIFY_MILESTONES.find((item) => item.key === milestone)?.days ?? 365;
}

function toBanglaDigits(value: string) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return value
    .split('')
    .map((character) => {
      const parsed = Number(character);
      return Number.isNaN(parsed) ? character : digits[parsed];
    })
    .join('');
}

export function getPurifyElapsedSeconds(startedAt: string, nowIso: string) {
  return Math.max(0, Math.floor((new Date(nowIso).getTime() - new Date(startedAt).getTime()) / 1000));
}

export function formatPurifyElapsed({
  startedAt,
  nowIso,
}: {
  startedAt: string;
  nowIso: string;
}) {
  const elapsedSeconds = getPurifyElapsedSeconds(startedAt, nowIso);
  const remainingSeconds = elapsedSeconds % 86400;
  
  const hours = Math.floor(remainingSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

export function isPurifyBrokenByMissedDay({
  lastCheckInAt,
  nowIso,
}: {
  lastCheckInAt: string;
  nowIso: string;
}) {
  const last = new Date(lastCheckInAt);
  const now = new Date(nowIso);
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor((startOfNow - startOfLast) / 86400000) > 1;
}

export function getReachedPurifyMilestones(currentDays: number, reached: PurifyMilestoneKey[]) {
  return PURIFY_MILESTONES.filter((item) => item.days <= currentDays && !reached.includes(item.key)).map((item) => item.key);
}

export function getNextPurifyMilestone(currentDays: number) {
  return PURIFY_MILESTONES.find((item) => item.days > currentDays)?.key ?? null;
}

export function getPurifyRingProgress(currentDays: number) {
  const nextMilestone = getNextPurifyMilestone(currentDays);

  if (!nextMilestone) {
    return 1;
  }

  const nextDays = getPurifyMilestoneDays(nextMilestone);
  const previousDays = PURIFY_MILESTONES.filter((item) => item.days < nextDays).slice(-1)[0]?.days ?? 0;
  const range = Math.max(1, nextDays - previousDays);
  const covered = Math.max(0, currentDays - previousDays);
  return Math.min(Math.max(covered / range, 0), 1);
}

export function buildPurifyStatus({
  state,
  nowIso,
  language,
}: {
  state: PurifyState;
  nowIso: string;
  language: PurifyLanguage;
}) {
  if (!state.active || !state.startedAt || !state.lastCheckInAt) {
    return {
      active: false,
      currentStreakDays: 0,
      bestStreakDays: state.bestStreakDays,
      elapsedLabel: '00:00:00',
      currentStreakLabel: language === 'bn' ? '০ দিন' : '0 day streak',
      reachedNow: [] as PurifyMilestoneKey[],
    };
  }

  if (isPurifyBrokenByMissedDay({ lastCheckInAt: state.lastCheckInAt, nowIso })) {
    return {
      active: false,
      currentStreakDays: 0,
      bestStreakDays: Math.max(state.bestStreakDays, state.currentStreakDays),
      elapsedLabel: '00:00:00',
      currentStreakLabel: language === 'bn' ? '০ দিন' : '0 day streak',
      reachedNow: [] as PurifyMilestoneKey[],
    };
  }

  const elapsedSeconds = getPurifyElapsedSeconds(state.startedAt, nowIso);
  const currentStreakDays = Math.floor(elapsedSeconds / 86400);
  const currentStreakLabel =
    language === 'bn'
      ? `${toBanglaDigits(String(currentStreakDays))} দিন`
      : `${currentStreakDays} day streak`;

  return {
    active: true,
    currentStreakDays,
    bestStreakDays: Math.max(state.bestStreakDays, currentStreakDays),
    elapsedLabel: formatPurifyElapsed({ startedAt: state.startedAt, nowIso }),
    currentStreakLabel,
    reachedNow: getReachedPurifyMilestones(currentStreakDays, state.reachedMilestones),
  };
}

export function getPurifyMilestoneNotification({
  milestone,
  language,
  quoteTone,
}: {
  milestone: PurifyMilestoneKey;
  language: PurifyLanguage;
  quoteTone: PurifyQuoteTone;
}) {
  const titleMap = {
    en: {
      '7-days': '7 days completed',
      '14-days': '14 days completed',
      '30-days': '30 days completed',
      '90-days': '90 days completed',
      '365-days': '365 days completed',
    },
    bn: {
      '7-days': '৭ দিন পূর্ণ',
      '14-days': '১৪ দিন পূর্ণ',
      '30-days': '৩০ দিন পূর্ণ',
      '90-days': '৯০ দিন পূর্ণ',
      '365-days': '৩৬৫ দিন পূর্ণ',
    },
  };

  const body =
    language === 'bn'
      ? quoteTone === 'islamic'
        ? 'ধৈর্য ধরে থাকুন। আল্লাহ উত্তম প্রতিদান দেন।'
        : 'আপনার শৃঙ্খলা নতুন জীবন গড়ে তুলছে।'
      : quoteTone === 'islamic'
        ? 'Stay patient. Allah rewards steadfast hearts.'
        : 'Your discipline is building a stronger life.';

  return {
    title: titleMap[language][milestone],
    body,
  };
}
