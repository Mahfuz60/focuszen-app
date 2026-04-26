import { UsageEntry } from '../types/models';
import { isSameDay } from './date';

export function getTodayUsageEntries(entries: UsageEntry[], referenceIso: string) {
  return entries.filter((entry) => isSameDay(entry.date, referenceIso));
}

export function aggregateUsageMinutes(entries: UsageEntry[]) {
  return entries.reduce<Record<string, number>>((accumulator, entry) => {
    accumulator[entry.appName] = (accumulator[entry.appName] ?? 0) + entry.minutesUsed;
    return accumulator;
  }, {});
}

export function getMostUsedApp(entries: UsageEntry[]) {
  return [...entries].sort((left, right) => right.minutesUsed - left.minutesUsed)[0];
}

export function getPeakUsageTime(entries: UsageEntry[]) {
  return [...entries].sort((left, right) => right.minutesUsed - left.minutesUsed)[0]?.peakHour ?? 21;
}
