import { Badge, Goal, Streak } from '../types/models';

export function calculateBadgeProgress(goal: Goal) {
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function unlockBadges(badges: Badge[], goals: Goal[], streak: Streak, nowIso: string) {
  return badges.map((badge) => {
    let unlocked = badge.unlocked;
    let progress = badge.progress;

    const matchingGoal = goals.find((goal) => goal.rewardBadgeId === badge.id);
    if (matchingGoal) {
      progress = calculateBadgeProgress(matchingGoal);
      unlocked = progress >= 100;
    }

    if (badge.id === 'badge-streak') {
      progress = Math.min(100, Math.round((streak.current / 14) * 100));
      unlocked = streak.current >= 14;
    }

    return {
      ...badge,
      progress,
      unlocked,
      unlockedAt: unlocked ? badge.unlockedAt ?? nowIso : undefined,
    };
  });
}
