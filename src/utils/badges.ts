import { Badge, Goal, Streak } from '../types/models';

/**
 * Evaluates goal progress and streak to unlock badges.
 */
export function unlockBadges(
  badges: Badge[],
  goals: Goal[],
  streak: Streak,
  timestamp: string
): Badge[] {
  return (badges || []).map((badge) => {
    if (badge.unlocked) return badge;

    let progress = 0;
    let unlocked = false;

    // Badge logic based on seed data IDs
    switch (badge.id) {
      case 'badge-study': {
        const studyGoal = goals.find((g) => g.metric === 'study-hours');
        if (studyGoal) {
          progress = (studyGoal.current / studyGoal.target) * 100;
          unlocked = studyGoal.current >= studyGoal.target;
        }
        break;
      }
      case 'badge-balance': {
        const socialGoal = goals.find((g) => g.metric === 'social-reduction');
        if (socialGoal) {
          progress = (socialGoal.current / socialGoal.target) * 100;
          unlocked = socialGoal.current >= socialGoal.target;
        }
        break;
      }
      case 'badge-focus': {
        const focusGoal = goals.find((g) => g.metric === 'focus-sessions');
        if (focusGoal) {
          progress = (focusGoal.current / focusGoal.target) * 100;
          unlocked = focusGoal.current >= focusGoal.target;
        }
        break;
      }
      case 'badge-streak': {
        // Requirements for Zen Master streak badge
        const streakRequirement = 14; 
        progress = (streak.current / streakRequirement) * 100;
        unlocked = streak.current >= streakRequirement;
        break;
      }
      default:
        break;
    }

    // Only update if progress increased or unlocked
    if (unlocked || progress > badge.progress) {
      return {
        ...badge,
        unlocked: unlocked || badge.unlocked,
        unlockedAt: unlocked && !badge.unlocked ? timestamp : badge.unlockedAt,
        progress: Math.min(Math.round(progress), 100),
      };
    }

    return badge;
  });
}
