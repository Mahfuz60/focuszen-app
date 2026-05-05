import { UsageComparison, UsageEntry } from '../types/models';

/**
 * Calculates usage comparison metrics against benchmarks.
 */
export function calculateComparison(
  entries: UsageEntry[],
  baseBenchmark: UsageComparison
): UsageComparison {
  if (!entries || entries.length === 0) {
    return baseBenchmark;
  }

  const totalUserMinutes = entries.reduce((sum, entry) => sum + entry.minutesUsed, 0);
  const totalBenchmarkMinutes = baseBenchmark.totalBenchmarkMinutes || 300; // Default benchmark
  const differencePercent =
    totalBenchmarkMinutes > 0
      ? ((totalBenchmarkMinutes - totalUserMinutes) / totalBenchmarkMinutes) * 100
      : 0;

  let narrative = 'Keep focusing! You are doing great.';
  if (differencePercent > 10) {
    narrative = `Excellent! You are ${Math.round(differencePercent)}% below typical distraction levels today.`;
  } else if (differencePercent < -10) {
    narrative = `Careful! Your usage is ${Math.round(Math.abs(differencePercent))}% higher than your goal. Time to focus?`;
  }

  return {
    ...baseBenchmark,
    totalUserMinutes,
    totalBenchmarkMinutes,
    differencePercent,
    narrative,
    snapshots: baseBenchmark.snapshots, // Keep existing snapshots structure
  };
}
