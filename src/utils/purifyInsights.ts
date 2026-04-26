import { AppLanguage, PurifyMilestoneKey } from '../types/models';
import { getPurifyMilestoneDays } from './purifyProgress';

type StageCopy = {
  title: string;
  description: string;
};

type StageDefinition = {
  id: string;
  minDays: number;
  maxDays: number | null;
  copy: Record<AppLanguage, StageCopy>;
};

type PurifyInsightsInput = {
  currentDays: number;
  bestDays: number;
  lifetimeDays: number;
  reachedMilestones: PurifyMilestoneKey[];
  language: AppLanguage;
};

type PurifyInsightStage = {
  id: string;
  title: string;
  description: string;
  rangeLabel: string;
  active: boolean;
  highlight: boolean;
};

type SummaryItem = {
  label: string;
  value: string;
};

type MilestoneState = 'reached' | 'next' | 'locked';

type PurifyInsightMilestone = {
  key: PurifyMilestoneKey;
  days: number;
  label: string;
  title: string;
  state: MilestoneState;
};

const STAGES: StageDefinition[] = [
  {
    id: 'novice',
    minDays: 1,
    maxDays: 2,
    copy: {
      en: {
        title: 'Novice',
        description: 'Trying to survive the early fight with harmful urges.',
      },
      bn: {
        title: 'নবীন',
        description: 'ক্ষতিকর তাড়না থেকে বাঁচতে শুরুর লড়াই করছে।',
      },
    },
  },
  {
    id: 'courageous',
    minDays: 3,
    maxDays: 7,
    copy: {
      en: {
        title: 'Courageous',
        description: 'Showing real courage by staying away from harmful habits.',
      },
      bn: {
        title: 'সাহসী',
        description: 'ক্ষতিকর অভ্যাস থেকে দূরে থেকে সাহসের পরিচয় দিচ্ছে।',
      },
    },
  },
  {
    id: 'alert',
    minDays: 8,
    maxDays: 14,
    copy: {
      en: {
        title: 'Alert',
        description: 'Staying watchful and guarding the heart every day.',
      },
      bn: {
        title: 'সতর্ক',
        description: 'প্রতিদিন সতর্ক থেকে নিজের হৃদয়কে রক্ষা করছে।',
      },
    },
  },
  {
    id: 'purified',
    minDays: 15,
    maxDays: 24,
    copy: {
      en: {
        title: 'Purified',
        description: 'Already moving farther away from harmful patterns.',
      },
      bn: {
        title: 'পরিশুদ্ধ',
        description: 'ক্ষতিকর অভ্যাস থেকে অনেকটাই দূরে সরে গেছে।',
      },
    },
  },
  {
    id: 'self-purified',
    minDays: 25,
    maxDays: 44,
    copy: {
      en: {
        title: 'Self-Purified',
        description: 'Working hard to become free from harmful habits.',
      },
      bn: {
        title: 'নিজেকে পরিশুদ্ধ',
        description: 'ক্ষতিকর অভ্যাস থেকে মুক্ত হওয়ার জন্য কঠোর চেষ্টা করছে।',
      },
    },
  },
  {
    id: 'god-fearing',
    minDays: 45,
    maxDays: 89,
    copy: {
      en: {
        title: 'God-Fearing',
        description: 'Trying to walk carefully with reverence and restraint.',
      },
      bn: {
        title: 'খোদাভীরু',
        description: 'আল্লাহর ভয় মেনে চলার চেষ্টা করছে।',
      },
    },
  },
  {
    id: 'truthful',
    minDays: 90,
    maxDays: 149,
    copy: {
      en: {
        title: 'The Truthful',
        description: 'Walking longer on the path of sincerity and truth.',
      },
      bn: {
        title: 'সত্যবাদী',
        description: 'সত্য ও আন্তরিকতার পথে আরও দূর এগিয়ে গেছে।',
      },
    },
  },
  {
    id: 'guidance',
    minDays: 150,
    maxDays: 219,
    copy: {
      en: {
        title: 'Path of Guidance',
        description: 'Living with stronger direction and clearer guidance.',
      },
      bn: {
        title: 'হিদায়াতের পথ',
        description: 'আল্লাহর হিদায়াতের পথে আরও দৃঢ়ভাবে আছে।',
      },
    },
  },
  {
    id: 'connected',
    minDays: 220,
    maxDays: 364,
    copy: {
      en: {
        title: 'Connected to Creator',
        description: 'Building a deeper relationship with the Creator.',
      },
      bn: {
        title: 'স্রষ্টার সাথে সংযুক্ত',
        description: 'আল্লাহর সাথে গভীর সম্পর্ক স্থাপন করেছে।',
      },
    },
  },
  {
    id: 'guardian',
    minDays: 365,
    maxDays: null,
    copy: {
      en: {
        title: 'Guardian of the Heart',
        description: 'Protecting the heart with long-term discipline and faith.',
      },
      bn: {
        title: 'হৃদয়ের রক্ষক',
        description: 'দীর্ঘমেয়াদি শৃঙ্খলা ও ঈমান দিয়ে হৃদয়কে রক্ষা করছে।',
      },
    },
  },
];

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

function formatNumber(value: number, language: AppLanguage) {
  return language === 'bn' ? toBanglaDigits(String(value)) : String(value);
}

function formatRangeLabel(stage: StageDefinition, language: AppLanguage) {
  if (stage.maxDays === null) {
    return language === 'bn'
      ? `${formatNumber(stage.minDays, language)}+ দিন`
      : `${stage.minDays}+ days`;
  }

  return language === 'bn'
    ? `${formatNumber(stage.minDays, language)} থেকে ${formatNumber(stage.maxDays, language)} দিন`
    : `${stage.minDays} to ${stage.maxDays} days`;
}

function getActiveStage(currentDays: number) {
  return (
    STAGES.find((stage) => {
      if (stage.maxDays === null) {
        return currentDays >= stage.minDays;
      }

      return currentDays >= stage.minDays && currentDays <= stage.maxDays;
    }) ?? STAGES[0]
  );
}

const MILESTONE_STAGE_MAP: Record<PurifyMilestoneKey, string> = {
  '7-days': 'Courageous',
  '14-days': 'Alert',
  '30-days': 'Self-Purified',
  '90-days': 'The Truthful',
  '365-days': 'Guardian of the Heart',
};

function formatMilestoneLabel(days: number, language: AppLanguage) {
  return language === 'bn'
    ? `${formatNumber(days, language)} দিন`
    : `${days} days`;
}

export function buildPurifyInsights({
  currentDays,
  bestDays,
  lifetimeDays,
  reachedMilestones,
  language,
}: PurifyInsightsInput) {
  const normalizedDays = Math.max(0, currentDays);
  const hasProgress = normalizedDays > 0;
  const activeStage = getActiveStage(hasProgress ? normalizedDays : 1);
  const activeStageIndex = STAGES.findIndex((stage) => stage.id === activeStage.id);
  const nextStage = STAGES[hasProgress ? activeStageIndex + 1 : 0] ?? null;
  const reachedCount = hasProgress ? activeStageIndex + 1 : 0;
  const stages: PurifyInsightStage[] = STAGES.map((stage) => ({
    id: stage.id,
    title: stage.copy[language].title,
    description: stage.copy[language].description,
    rangeLabel: formatRangeLabel(stage, language),
    active: stage.id === activeStage.id && hasProgress,
    highlight: stage.id === activeStage.id && hasProgress,
  }));
  const milestoneOrder: PurifyMilestoneKey[] = ['7-days', '14-days', '30-days', '90-days', '365-days'];
  const nextMilestoneKey =
    milestoneOrder.find((milestone) => getPurifyMilestoneDays(milestone) > normalizedDays) ?? null;
  const milestones: PurifyInsightMilestone[] = milestoneOrder.map((milestone) => {
    const days = getPurifyMilestoneDays(milestone);
    let state: MilestoneState = 'locked';

    if (reachedMilestones.includes(milestone) || normalizedDays >= days) {
      state = 'reached';
    } else if (nextMilestoneKey === milestone) {
      state = 'next';
    }

    return {
      key: milestone,
      days,
      label: formatMilestoneLabel(days, language),
      title: language === 'bn' ? formatMilestoneLabel(days, language) : MILESTONE_STAGE_MAP[milestone],
      state,
    };
  });

  return {
    title: language === 'bn' ? 'পিউরিফাই ইনসাইটস' : 'Purify Insights',
    subtitle:
      language === 'bn'
        ? 'আপনার পরিশুদ্ধির অগ্রগতি ধাপে ধাপে দেখুন।'
        : 'See your self-purified progress stage by stage.',
    summary: {
      current: {
        label: language === 'bn' ? 'বর্তমান স্ট্রিক' : 'Current streak',
        value: formatNumber(normalizedDays, language),
      } as SummaryItem,
      best: {
        label: language === 'bn' ? 'সেরা স্ট্রিক' : 'Best streak',
        value: formatNumber(bestDays, language),
      } as SummaryItem,
      lifetime: {
        label: language === 'bn' ? 'মোট দিন' : 'Lifetime days',
        value: formatNumber(lifetimeDays, language),
      } as SummaryItem,
    },
    activeStage: stages[activeStageIndex],
    nextStage: nextStage
      ? {
          title: nextStage.copy[language].title,
          description: nextStage.copy[language].description,
          rangeLabel: formatRangeLabel(nextStage, language),
        }
      : null,
    reachedCount,
    motivationLine:
      language === 'bn'
        ? 'ধাপে ধাপে এগোনোই সত্যিকারের জয়।'
        : 'Steady progress is the real victory.',
    milestones,
    stages,
  };
}
