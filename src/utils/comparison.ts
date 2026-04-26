import { UsageComparison, UsageEntry } from '../types/models';
import { aggregateUsageMinutes } from './usage';

export function calculateComparison(entries: UsageEntry[], benchmark: UsageComparison): UsageComparison {
  const totals = aggregateUsageMinutes(entries);
  const totalUserMinutes = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const differencePercent = Math.round(((totalUserMinutes - benchmark.totalBenchmarkMinutes) / benchmark.totalBenchmarkMinutes) * 100);

  return {
    ...benchmark,
    totalUserMinutes,
    differencePercent,
    narrative:
      differencePercent <= 0
        ? `You use social apps ${Math.abs(differencePercent)}% less than the average benchmark.`
        : `You use social apps ${differencePercent}% more than the average benchmark.`,
    snapshots: benchmark.snapshots.map((snapshot) => {
      const minutesUsed = totals[snapshot.appName] ?? 0;
      return {
        ...snapshot,
        minutesUsed,
        deltaMinutes: minutesUsed - snapshot.benchmarkMinutes,
      };
    }),
  };
}
