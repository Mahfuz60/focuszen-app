import { Badge, Goal, Streak } from '../types/models';

export function calculateBadgeProgress(goal: Goal) {
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function unlockBadges(badges: Badge[], goals: Goal[], streak: Streak, nowIso: string) {
  const safeBadges = badges || [];
  const safeGoals = goals || [];
  const safeStreak = streak || { current: 0, best: 0, lastActivityIso: '' };

  return safeBadges.map((badge) => {
    let unlocked = badge.unlocked;
    let progress = badge.progress;

    const matchingGoal = safeGoals.find((goal) => goal.rewardBadgeId === badge.id);
    if (matchingGoal) {
      progress = calculateBadgeProgress(matchingGoal);
      unlocked = progress >= 100;
    }

    if (badge.id === 'badge-streak') {
      progress = Math.min(100, Math.round((safeStreak.current / 14) * 100));
      unlocked = safeStreak.current >= 14;
    }

    return {
      ...badge,
      progress,
      unlocked,
      unlockedAt: unlocked ? badge.unlockedAt ?? nowIso : undefined,
    };
  });
}
