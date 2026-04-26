export type QuoteTone = 'islamic' | 'english';
export type PurifyLanguage = 'en' | 'bn';
export type PurifySourceType = 'quran' | 'hadith' | 'motivation';

export type PurifyQuote = {
  id: string;
  body: string;
  tone: QuoteTone;
  sourceType: PurifySourceType;
  ref: string;
  collection?: string;
  grade?: string;
  authentic?: boolean;
};

type ActivePurifySession = {
  startedAt: string;
  presetMinutes: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  deepWork: boolean;
};

type BuildPurifySnapshotInput = {
  activeSession: ActivePurifySession | null;
  streakDays: number;
  hourlyQuote: PurifyQuote;
  language?: PurifyLanguage;
};

type PurifySnapshot = {
  timerLabel: string;
  sessionState: string;
  progressPercent: number;
  dayLabel: string;
  quoteToneLabel: string;
  quoteSourceLabel: string;
};

type PurifyScreenCopy = {
  title: string;
  subtitle: string;
  languageToggleEn: string;
  languageToggleBn: string;
  openFocusLabel: string;
  resetLabel: string;
  startLabel: string;
  timerIdleLabel: string;
  timerIdleState: string;
};

type PurifyQuoteSeed = {
  id: string;
  bodyEn: string;
  bodyBn: string;
  tone: QuoteTone;
  sourceType: PurifySourceType;
  ref: string;
  collection?: string;
  collectionBn?: string;
  grade?: string;
  gradeBn?: string;
  authentic?: boolean;
};

const SCREEN_COPY: Record<PurifyLanguage, PurifyScreenCopy> = {
  en: {
    title: 'Self-Purified',
    subtitle: 'Build self-discipline. Step away from harmful habits.',
    languageToggleEn: 'EN',
    languageToggleBn: 'BN',
    openFocusLabel: 'Open focus',
    resetLabel: 'Reset streak',
    startLabel: 'Start',
    timerIdleLabel: '00:00',
    timerIdleState: 'Begin with one clean second.',
  },
  bn: {
    title: 'নিজেকে পরিশুদ্ধ',
    subtitle: 'আত্মনিয়ন্ত্রণ গড়ে তোলো। ক্ষতিকর অভ্যাস থেকে দূরে থাকো।',
    languageToggleEn: 'EN',
    languageToggleBn: 'বাং',
    openFocusLabel: 'ফোকাস খুলুন',
    resetLabel: 'স্ট্রিক রিসেট',
    startLabel: 'শুরু',
    timerIdleLabel: '০০:০০',
    timerIdleState: 'একটি পরিষ্কার সেকেন্ড দিয়ে শুরু করুন।',
  },
};

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBanglaDigits(value: number | string) {
  return value
    .toString()
    .split('')
    .map((character) => {
      if (character >= '0' && character <= '9') {
        return BANGLA_DIGITS[Number(character)];
      }

      return character;
    })
    .join('');
}

function localizeRef(ref: string, language: PurifyLanguage) {
  return language === 'bn' ? toBanglaDigits(ref) : ref;
}

function getDayLabel(streakDays: number, language: PurifyLanguage) {
  if (language === 'bn') {
    return streakDays > 0 ? `${toBanglaDigits(streakDays)} দিন` : 'প্রথম দিন শুরু করুন';
  }

  return streakDays > 0 ? `${streakDays} day streak` : 'Begin your first day';
}

function getSessionStateLabel(isPaused: boolean, language: PurifyLanguage) {
  if (language === 'bn') {
    return isPaused ? 'নিয়ত ধরে বিরতিতে' : 'পরিশুদ্ধির পথে';
  }

  return isPaused ? 'Paused with intention' : 'In purification';
}

function getIdleStateLabel(language: PurifyLanguage) {
  return language === 'bn' ? 'কোনো সক্রিয় সেশন নেই' : 'No active session';
}

function getIdleTimerLabel(language: PurifyLanguage) {
  return language === 'bn' ? 'এখন শুরু' : 'Start now';
}

function getQuoteToneLabel(tone: QuoteTone, language: PurifyLanguage) {
  if (language === 'bn') {
    return tone === 'islamic' ? 'ইসলামিক অনুপ্রেরণা' : 'বিশ্ব অনুপ্রেরণা';
  }

  return tone === 'islamic' ? 'Islamic reminder' : 'English motivation';
}

export function formatPurifyQuoteSource(
  quote: PurifyQuote,
  language: PurifyLanguage = 'en'
) {
  const ref = localizeRef(quote.ref, language);

  if (quote.sourceType === 'quran') {
    return ref;
  }

  if (quote.sourceType === 'hadith') {
    const collection = quote.collection ?? '';
    const grade = quote.grade?.trim();

    if (collection && grade) {
      return `${collection} • ${ref} • ${grade}`;
    }

    if (collection) {
      return `${collection} • ${ref}`;
    }

    return ref;
  }

  return language === 'bn' ? 'বিশ্ব অনুপ্রেরণা' : 'Original motivation';
}

export function isAuthenticIslamicQuote(quote: PurifyQuote) {
  if (quote.sourceType === 'quran') {
    return true;
  }

  if (quote.sourceType === 'hadith') {
    return quote.authentic === true;
  }

  return false;
}

export function getHourlyQuote(quotes: PurifyQuote[], hour: number) {
  if (!quotes.length) {
    throw new Error('Purify quotes are required.');
  }

  return quotes[Math.abs(hour) % quotes.length];
}

export function formatPurifyTimer(
  totalSeconds: number,
  language: PurifyLanguage = 'en'
) {
  const safeTotal = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeTotal / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeTotal % 60).toString().padStart(2, '0');
  const value = `${minutes}:${seconds}`;

  return language === 'bn' ? toBanglaDigits(value) : value;
}

export function getPurifyScreenCopy(language: PurifyLanguage) {
  return SCREEN_COPY[language];
}

export function buildPurifySnapshot({
  activeSession,
  streakDays,
  hourlyQuote,
  language = 'en',
}: BuildPurifySnapshotInput): PurifySnapshot {
  if (!activeSession) {
    return {
      timerLabel: getIdleTimerLabel(language),
      sessionState: getIdleStateLabel(language),
      progressPercent: 0,
      dayLabel: getDayLabel(streakDays, language),
      quoteToneLabel: getQuoteToneLabel(hourlyQuote.tone, language),
      quoteSourceLabel: formatPurifyQuoteSource(hourlyQuote, language),
    };
  }

  const totalSeconds = activeSession.presetMinutes * 60;
  const progressPercent = totalSeconds
    ? Math.round((activeSession.elapsedSeconds / totalSeconds) * 100)
    : 0;

  return {
    timerLabel: formatPurifyTimer(activeSession.remainingSeconds, language),
    sessionState: getSessionStateLabel(activeSession.paused, language),
    progressPercent: Math.min(Math.max(progressPercent, 0), 100),
    dayLabel: getDayLabel(streakDays, language),
    quoteToneLabel: getQuoteToneLabel(hourlyQuote.tone, language),
    quoteSourceLabel: formatPurifyQuoteSource(hourlyQuote, language),
  };
}

const PURIFY_QUOTES_SEED: PurifyQuoteSeed[] = [
  {
    id: 'quran-sabr-2153',
    bodyEn: 'Seek help through patience and prayer. Indeed, Allah is with the patient.',
    bodyBn: 'ধৈর্য ও সালাতের মাধ্যমে সাহায্য চাও। নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সঙ্গে আছেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 2:153',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-striving-2969',
    bodyEn: 'Those who strive for Us, We will surely guide them to Our ways.',
    bodyBn: 'যারা আমার পথে চেষ্টা করে, আমি অবশ্যই তাদেরকে আমার পথগুলো দেখাই।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 29:69',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-taqwa-652',
    bodyEn: 'Whoever fears Allah, He will make a way out for them.',
    bodyBn: 'যে আল্লাহকে ভয় করে, আল্লাহ তার জন্য বের হওয়ার পথ করে দেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 65:2',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-rest-1328',
    bodyEn: 'Surely in the remembrance of Allah do hearts find rest.',
    bodyBn: 'নিশ্চয়ই আল্লাহর স্মরণেই হৃদয় প্রশান্তি পায়।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 13:28',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-ease-945',
    bodyEn: 'Indeed, with hardship comes ease.',
    bodyBn: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি আছে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 94:5',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'hadith-intention-bukhari-1',
    bodyEn: 'Actions are judged by intentions.',
    bodyBn: 'কর্মের মূল্য নিয়তের উপর নির্ভর করে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 1',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-beneficial-muslim-2664',
    bodyEn: 'Pursue what benefits you. Seek Allah’s help. Do not give up.',
    bodyBn: 'যা তোমার উপকারে আসে তা অর্জনে চেষ্টা করো, আল্লাহর সাহায্য চাও, আর হাল ছেড়ো না।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 2664',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-consistent-bukhari-6465',
    bodyEn: 'The most beloved deeds to Allah are those done regularly, even if small.',
    bodyBn: 'আল্লাহর নিকট সবচেয়ে প্রিয় আমল হলো নিয়মিত আমল, যদিও তা অল্প হয়।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6465',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-quran-bukhari-5027',
    bodyEn: 'The best of you are those who learn the Quran and teach it.',
    bodyBn: 'তোমাদের মধ্যে সর্বোত্তম তারা, যারা কুরআন শেখে এবং শেখায়।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 5027',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-smile-tirmidhi-1956',
    bodyEn: 'Smiling at your brother is charity.',
    bodyBn: 'তোমার ভাইয়ের দিকে হাসিমুখে তাকানোও সদকা।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Tirmidhi 1956',
    collection: 'Jami at-Tirmidhi',
    collectionBn: 'জামে আত-তিরমিজি',
    grade: 'Hasan',
    gradeBn: 'হাসান',
    authentic: true,
  },

  {
    id: 'discipline-beats-mood',
    bodyEn: 'Discipline keeps going when mood walks away.',
    bodyBn: 'মনের ইচ্ছা থামলেও শৃঙ্খলা তোমাকে এগিয়ে নেয়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'hour-by-hour',
    bodyEn: 'One clean hour can reset the direction of an entire day.',
    bodyBn: 'একটি পরিষ্কার ঘণ্টা পুরো দিনের দিক বদলে দিতে পারে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'small-choices',
    bodyEn: 'Every strong life is built from repeated small refusals.',
    bodyBn: 'শক্তিশালী জীবন গড়ে ওঠে ছোট ছোট সঠিক সিদ্ধান্তের পুনরাবৃত্তি থেকে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'start-before-ready',
    bodyEn: 'Start before you feel ready.',
    bodyBn: 'প্রস্তুত না লাগলেও শুরু করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'slow-is-progress',
    bodyEn: 'Slow progress is still progress.',
    bodyBn: 'ধীর অগ্রগতিও অগ্রগতি।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-one-decision',
    bodyEn: 'Protect one good decision at a time.',
    bodyBn: 'একবারে একটি ভালো সিদ্ধান্তকে রক্ষা করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'clarity-after-action',
    bodyEn: 'Clarity often comes after action.',
    bodyBn: 'স্বচ্ছতা অনেক সময় কাজের পর আসে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'tiny-win-momentum',
    bodyEn: 'A tiny win still changes momentum.',
    bodyBn: 'ছোট জয়ও গতি বদলে দেয়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'consistency-beats-intensity',
    bodyEn: 'Consistency beats intensity that fades.',
    bodyBn: 'ম্লান হয়ে যাওয়া তীব্রতার চেয়ে ধারাবাহিকতা শক্তিশালী।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'win-the-morning',
    bodyEn: 'Win the morning. The rest gets easier.',
    bodyBn: 'সকাল জিতে নাও। বাকিটা সহজ হবে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'next-right-thing',
    bodyEn: 'Do the next right thing.',
    bodyBn: 'পরের সঠিক কাজটি করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'restart-counts',
    bodyEn: 'A restart counts. Use it.',
    bodyBn: 'নতুন শুরু মূল্যবান। ব্যবহার করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'finish-one-block',
    bodyEn: 'Finish one block. Then begin another.',
    bodyBn: 'একটি অংশ শেষ করো। তারপর আরেকটি শুরু করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-evening',
    bodyEn: 'A clean evening protects tomorrow morning.',
    bodyBn: 'পরিষ্কার সন্ধ্যা আগামী সকালের সুরক্ষা।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'less-scroll-more-life',
    bodyEn: 'Less scrolling. More living.',
    bodyBn: 'কম স্ক্রল। বেশি জীবন।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'done-beats-imagined',
    bodyEn: 'Finished beats imagined.',
    bodyBn: 'কল্পনার চেয়ে শেষ করা কাজ মূল্যবান।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'one-thing-deeply',
    bodyEn: 'Do one thing deeply.',
    bodyBn: 'একটি কাজ গভীরভাবে করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'small-rules-strong-days',
    bodyEn: 'Small rules create strong days.',
    bodyBn: 'ছোট নিয়ম শক্ত দিন তৈরি করে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'written-reset',
    bodyEn: 'A written reset beats a guilty spiral.',
    bodyBn: 'লিখিত নতুন শুরু অপরাধবোধের ঘূর্ণির চেয়ে ভালো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'repeat-become',
    bodyEn: 'What you repeat, you become.',
    bodyBn: 'যা তুমি বারবার করো, তুমিই তা হয়ে ওঠো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },

  {
    id: 'quran-tawakkul-33',
    bodyEn: 'Whoever relies upon Allah, then He is enough for them.',
    bodyBn: 'যে আল্লাহর উপর ভরসা করে, তার জন্য তিনিই যথেষ্ট।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 65:3',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-shukr-147',
    bodyEn: 'If you are grateful, I will surely increase you.',
    bodyBn: 'তোমরা কৃতজ্ঞ হলে আমি অবশ্যই তোমাদের আরও বাড়িয়ে দেব।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 14:7',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-prayer-protects-2945',
    bodyEn: 'Prayer restrains from shameful and unjust deeds.',
    bodyBn: 'নিশ্চয়ই সালাত অশ্লীলতা ও অন্যায় থেকে বিরত রাখে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 29:45',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-allah-sees-9614',
    bodyEn: 'Does he not know that Allah sees?',
    bodyBn: 'সে কি জানে না যে আল্লাহ দেখছেন?',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 96:14',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-allah-loves-good-3134',
    bodyEn: 'And Allah loves the doers of good.',
    bodyBn: 'আর আল্লাহ সৎকর্মশীলদের ভালোবাসেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 3:134',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-after-hardship-946',
    bodyEn: 'Indeed, with hardship comes ease.',
    bodyBn: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি আছে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 94:6',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-allah-with-you-4735',
    bodyEn: 'Do not weaken and do not grieve. Allah is with you.',
    bodyBn: 'দুর্বল হয়ো না, দুঃখ করো না। আল্লাহ তোমাদের সঙ্গে আছেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 47:35',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-lower-gaze-men-2430',
    bodyEn: 'Tell the believing men to lower their gaze and guard their chastity.',
    bodyBn: 'মুমিন পুরুষদের বলুন তারা যেন দৃষ্টি সংযত রাখে এবং লজ্জাস্থান হিফাজত করে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 24:30',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-lower-gaze-women-2431',
    bodyEn: 'Tell the believing women to lower their gaze and guard their chastity.',
    bodyBn: 'মুমিন নারীদের বলুন তারা যেন দৃষ্টি সংযত রাখে এবং লজ্জাস্থান হিফাজত করে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 24:31',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-no-despair-3953',
    bodyEn: 'Do not despair of the mercy of Allah.',
    bodyBn: 'আল্লাহর রহমত থেকে নিরাশ হয়ো না।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 39:53',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },

  {
    id: 'hadith-truth-bukhari-6094',
    bodyEn: 'Truthfulness leads to righteousness, and righteousness leads to Paradise.',
    bodyBn: 'সত্যবাদিতা সৎকর্মে নিয়ে যায়, আর সৎকর্ম জান্নাতে নিয়ে যায়।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6094',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-modesty-muslim-35b',
    bodyEn: 'Modesty is a branch of faith.',
    bodyBn: 'লজ্জাশীলতা ঈমানের একটি শাখা।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 35b',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-strong-believer-muslim-2664',
    bodyEn: 'The strong believer is better and more beloved to Allah than the weak believer.',
    bodyBn: 'শক্তিশালী মুমিন দুর্বল মুমিনের চেয়ে উত্তম এবং আল্লাহর কাছে অধিক প্রিয়।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 2664',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-prayer-on-time-bukhari-527',
    bodyEn: 'The most beloved deed to Allah is prayer on time.',
    bodyBn: 'আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো সময়মতো সালাত আদায় করা।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 527',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-no-anger-bukhari-6116',
    bodyEn: 'Do not become angry.',
    bodyBn: 'রাগ করো না।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6116',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-ease-bukhari-6125',
    bodyEn: 'Make things easy and do not make them difficult.',
    bodyBn: 'কাজ সহজ করো, কঠিন করো না।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6125',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-good-speech-bukhari-6018',
    bodyEn: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    bodyBn: 'যে আল্লাহ ও আখিরাতে ঈমান রাখে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6018',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-allah-hearts-muslim-2564c',
    bodyEn: 'Allah looks at your hearts and your deeds.',
    bodyBn: 'আল্লাহ তোমাদের হৃদয় ও আমলের দিকে তাকান।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 2564c',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-every-good-deed-muslim-1005',
    bodyEn: 'Every good deed is charity.',
    bodyBn: 'প্রতিটি ভালো কাজই সদকা।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 1005',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-brother-love-bukhari-13',
    bodyEn: 'None of you truly believes until he loves for his brother what he loves for himself.',
    bodyBn: 'তোমাদের কেউ পূর্ণ মুমিন হবে না, যতক্ষণ না সে নিজের জন্য যা ভালোবাসে তা তার ভাইয়ের জন্যও ভালোবাসে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 13',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },

  {
    id: 'protect-the-first-step',
    bodyEn: 'The first clean choice is often the hardest and the most important.',
    bodyBn: 'প্রথম পরিষ্কার সিদ্ধান্তটাই অনেক সময় সবচেয়ে কঠিন এবং সবচেয়ে গুরুত্বপূর্ণ।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'small-control-big-peace',
    bodyEn: 'Small self-control creates big peace.',
    bodyBn: 'ছোট আত্মনিয়ন্ত্রণ বড় প্রশান্তি আনে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'pause-breaks-pattern',
    bodyEn: 'A short pause can break a bad pattern.',
    bodyBn: 'একটি ছোট বিরতি খারাপ অভ্যাসের ধারা ভেঙে দিতে পারে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-tonight',
    bodyEn: 'Protect tonight and tomorrow gets easier.',
    bodyBn: 'আজ রাতকে রক্ষা করো, কাল সহজ হবে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'urge-is-not-order',
    bodyEn: 'An urge is not a command.',
    bodyBn: 'তাড়না কোনো আদেশ নয়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'structure-beats-chaos',
    bodyEn: 'Simple structure beats emotional chaos.',
    bodyBn: 'সহজ কাঠামো আবেগের বিশৃঙ্খলাকে হারায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'clean-room-clean-mind',
    bodyEn: 'A cleaner room often helps build a cleaner mind.',
    bodyBn: 'পরিষ্কার ঘর অনেক সময় পরিষ্কার মন গড়তে সাহায্য করে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'delay-the-impulse',
    bodyEn: 'Delay the impulse and weaken its power.',
    bodyBn: 'তাড়নাকে দেরি করাও, তার শক্তি কমে যাবে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-phone-boundary',
    bodyEn: 'What stays out of reach loses part of its control.',
    bodyBn: 'যা হাতের বাইরে থাকে, তার নিয়ন্ত্রণও কমে যায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'one-obedient-minute',
    bodyEn: 'One obedient minute can rescue the next hour.',
    bodyBn: 'একটি অনুগত মিনিট পরের ঘণ্টাটাকে বাঁচাতে পারে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'momentum-likes-repetition',
    bodyEn: 'Momentum loves repetition.',
    bodyBn: 'গতি পুনরাবৃত্তিকে ভালোবাসে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'reduce-the-trigger',
    bodyEn: 'Reduce the trigger before testing your willpower.',
    bodyBn: 'নিজের ইচ্ছাশক্তি পরীক্ষার আগে প্ররোচনাটাই কমাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-what-you-see',
    bodyEn: 'What you watch repeatedly eventually shapes what you want.',
    bodyBn: 'যা তুমি বারবার দেখো, তা একসময় তোমার চাওয়াকেও গড়ে দেয়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'calm-is-a-skill',
    bodyEn: 'Calm is a skill you can practice.',
    bodyBn: 'শান্ত থাকা এমন একটি দক্ষতা, যা অনুশীলন করা যায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'return-fast',
    bodyEn: 'The faster you return, the less a slip can grow.',
    bodyBn: 'যত দ্রুত ফিরে আসবে, তত কম একটি ভুল বড় হতে পারবে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-next-ten-minutes',
    bodyEn: 'Do not manage forever. Manage the next ten minutes.',
    bodyBn: 'সারাজীবনকে সামলাতে যেও না, পরের দশ মিনিটকে সামলাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'inner-strength-looks-quiet',
    bodyEn: 'Real self-mastery often looks quiet from the outside.',
    bodyBn: 'সত্যিকারের আত্মনিয়ন্ত্রণ বাইরে থেকে অনেক সময় নীরব দেখায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'consistency-builds-identity',
    bodyEn: 'Consistency does not just change days. It changes identity.',
    bodyBn: 'ধারাবাহিকতা শুধু দিন বদলায় না, পরিচয়ও বদলায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-gap',
    bodyEn: 'Growth often lives in the gap between urge and action.',
    bodyBn: 'তাড়না আর কাজের মাঝের ফাঁকেই অনেক সময় উন্নতি বাস করে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'one-clean-no',
    bodyEn: 'One clean no can protect many future yeses.',
    bodyBn: 'একটি পরিষ্কার না অনেক ভবিষ্যতের হ্যাঁকে রক্ষা করতে পারে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },

  {
    id: 'quran-remember-me-2152',
    bodyEn: 'So remember Me; I will remember you.',
    bodyBn: 'তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 2:152',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-allah-knows-hearts-3351',
    bodyEn: 'Allah knows what is within your hearts.',
    bodyBn: 'আল্লাহ তোমাদের অন্তরের কথা জানেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 33:51',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-be-patient-3200',
    bodyEn: 'O you who believe, be patient and endure.',
    bodyBn: 'হে মুমিনগণ, ধৈর্য ধরো এবং স্থির থাকো।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 3:200',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-avoid-immorality-1732',
    bodyEn: 'Do not approach immorality.',
    bodyBn: 'অশ্লীলতার কাছেও যেও না।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 17:32',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-trust-allah-523',
    bodyEn: 'And put your trust in Allah if you are believers.',
    bodyBn: 'তোমরা যদি মুমিন হও, তবে আল্লাহর উপরই ভরসা করো।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 5:23',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },

  {
    id: 'hadith-gentleness-muslim-2593',
    bodyEn: 'Gentleness is not in anything except that it beautifies it.',
    bodyBn: 'নম্রতা কোনো কিছুর মধ্যে থাকলে সেটিকে সুন্দর করে তোলে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 2593',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-avoid-suspicion-bukhari-6066',
    bodyEn: 'Avoid suspicion, for suspicion is the worst of false tales.',
    bodyBn: 'সন্দেহ থেকে দূরে থাকো, কারণ সন্দেহ মিথ্যার সবচেয়ে বড় উৎস।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6066',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-mercy-tirmidhi-1924',
    bodyEn: 'The merciful are shown mercy by the Most Merciful.',
    bodyBn: 'দয়ালুরা পরম দয়ালুর পক্ষ থেকে দয়া পায়।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Tirmidhi 1924',
    collection: 'Jami at-Tirmidhi',
    collectionBn: 'জামে আত-তিরমিজি',
    grade: 'Hasan',
    gradeBn: 'হাসান',
    authentic: true,
  },
  {
    id: 'hadith-remember-allah-tirmidhi-3377',
    bodyEn: 'Remember Allah in ease, He will remember you in hardship.',
    bodyBn: 'সুবিধায় আল্লাহকে স্মরণ করো, কষ্টে তিনি তোমাকে স্মরণ করবেন।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Tirmidhi 3377',
    collection: 'Jami at-Tirmidhi',
    collectionBn: 'জামে আত-তিরমিজি',
    grade: 'Hasan',
    gradeBn: 'হাসান',
    authentic: true,
  },
  {
    id: 'hadith-modesty-good-bukhari-6117',
    bodyEn: 'Modesty brings nothing but good.',
    bodyBn: 'লজ্জাশীলতা শুধুই কল্যাণ বয়ে আনে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 6117',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },

  {
    id: 'control-the-environment',
    bodyEn: 'Control your environment before trying to control your mind.',
    bodyBn: 'মন নিয়ন্ত্রণের আগে পরিবেশ নিয়ন্ত্রণ করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'discipline-over-feelings',
    bodyEn: 'Feelings change. Discipline stays.',
    bodyBn: 'অনুভূতি বদলায়, শৃঙ্খলা থাকে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'avoid-the-first-click',
    bodyEn: 'Most damage starts with one small click.',
    bodyBn: 'বেশিরভাগ ক্ষতি শুরু হয় একটি ছোট ক্লিক দিয়ে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'clean-start-now',
    bodyEn: 'You do not need a new day. You need a clean moment.',
    bodyBn: 'নতুন দিন নয়, একটি পরিষ্কার মুহূর্ত দরকার।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-input',
    bodyEn: 'What you allow in decides what comes out.',
    bodyBn: 'যা তুমি ভেতরে ঢুকতে দাও, সেটাই বাইরে আসে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'small-delay-powerful',
    bodyEn: 'A 5-minute delay can defeat a strong urge.',
    bodyBn: '৫ মিনিট দেরি একটি শক্ত তাড়নাকেও হারাতে পারে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'respect-your-future-self',
    bodyEn: 'Respect your future self by your current choices.',
    bodyBn: 'বর্তমান সিদ্ধান্ত দিয়ে ভবিষ্যতের নিজেকে সম্মান দাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'simple-routine-wins',
    bodyEn: 'Simple routines beat complex plans.',
    bodyBn: 'সহজ রুটিন জটিল পরিকল্পনাকে হারায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-trigger-gap',
    bodyEn: 'The gap between trigger and action is your power zone.',
    bodyBn: 'প্ররোচনা আর কাজের মাঝের ফাঁকটাই তোমার শক্তির জায়গা।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'reset-with-action',
    bodyEn: 'Do one clean action instead of thinking too much.',
    bodyBn: 'বেশি ভাবার বদলে একটি পরিষ্কার কাজ করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'reduce-exposure',
    bodyEn: 'Less exposure means fewer battles.',
    bodyBn: 'কম প্ররোচনা মানে কম যুদ্ধ।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-morning-start',
    bodyEn: 'A clean morning reduces a dirty evening.',
    bodyBn: 'পরিষ্কার সকাল নোংরা সন্ধ্যাকে কমায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'stop-early-win-easy',
    bodyEn: 'Stopping early is easier than stopping late.',
    bodyBn: 'শুরুতেই থামা দেরিতে থামার চেয়ে সহজ।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'train-the-no',
    bodyEn: 'Train your “no” before you need it.',
    bodyBn: 'প্রয়োজনের আগেই নিজের “না” অনুশীলন করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'identity-over-urge',
    bodyEn: 'You are not your urges.',
    bodyBn: 'তুমি তোমার তাড়না নও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'build-barriers',
    bodyEn: 'Add friction to bad habits. Remove friction from good ones.',
    bodyBn: 'খারাপ অভ্যাসে বাধা বাড়াও, ভালো অভ্যাসে বাধা কমাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'repeat-clean-decisions',
    bodyEn: 'Repeat clean decisions until they become automatic.',
    bodyBn: 'পরিষ্কার সিদ্ধান্তগুলো পুনরাবৃত্তি করো যতক্ষণ না তা স্বাভাবিক হয়ে যায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'protect-the-evening-input',
    bodyEn: 'What you consume at night stays longer.',
    bodyBn: 'রাতে যা গ্রহণ করো, তা বেশি সময় থাকে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'focus-on-next-choice',
    bodyEn: 'Do not fix life. Fix the next choice.',
    bodyBn: 'জীবন ঠিক করতে যেও না, পরের সিদ্ধান্তটা ঠিক করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },

  {
    id: 'quran-allah-aware-5711',
    bodyEn: 'And Allah is Aware of what you do.',
    bodyBn: 'তোমরা যা করো আল্লাহ তা অবগত।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 57:11',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-allah-forgives-3953',
    bodyEn: 'Indeed, Allah forgives all sins.',
    bodyBn: 'নিশ্চয়ই আল্লাহ সব গুনাহ ক্ষমা করেন।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 39:53',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-return-to-allah-3954',
    bodyEn: 'Return to your Lord and submit to Him.',
    bodyBn: 'তোমরা তোমাদের রবের দিকে ফিরে আসো এবং তাঁরই অনুগত হও।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 39:54',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-purify-yourself-919',
    bodyEn: 'He has succeeded who purifies himself.',
    bodyBn: 'নিশ্চয়ই সে সফল হয়েছে যে নিজেকে পরিশুদ্ধ করেছে।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 91:9',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },
  {
    id: 'quran-guard-prayers-2238',
    bodyEn: 'Guard strictly the prayers.',
    bodyBn: 'তোমরা সালাতসমূহকে হেফাজত করো।',
    tone: 'islamic',
    sourceType: 'quran',
    ref: 'Quran 2:238',
    collection: 'Quran',
    collectionBn: 'কুরআন',
    authentic: true,
  },

  {
    id: 'hadith-ihsan-muslim-8',
    bodyEn: 'Worship Allah as if you see Him.',
    bodyBn: 'আল্লাহকে এমনভাবে ইবাদত করো যেন তুমি তাঁকে দেখছ।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 8',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-leave-doubt-tirmidhi-2518',
    bodyEn: 'Leave what makes you doubt for what does not.',
    bodyBn: 'যা তোমাকে সন্দেহে ফেলে তা ছেড়ে দাও, যা সন্দেহমুক্ত তা গ্রহণ করো।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Tirmidhi 2518',
    collection: 'Jami at-Tirmidhi',
    collectionBn: 'জামে আত-তিরমিজি',
    grade: 'Hasan Sahih',
    gradeBn: 'হাসান সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-allah-kind-muslim-2593',
    bodyEn: 'Allah is kind and loves kindness.',
    bodyBn: 'আল্লাহ দয়ালু এবং দয়াকে ভালোবাসেন।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Muslim 2593',
    collection: 'Sahih Muslim',
    collectionBn: 'সহিহ মুসলিম',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },
  {
    id: 'hadith-best-people-tirmidhi-2321',
    bodyEn: 'The best people are those most beneficial to others.',
    bodyBn: 'মানুষের মধ্যে উত্তম সেই, যে মানুষের উপকারে আসে।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Tirmidhi 2321',
    collection: 'Jami at-Tirmidhi',
    collectionBn: 'জামে আত-তিরমিজি',
    grade: 'Hasan',
    gradeBn: 'হাসান',
    authentic: true,
  },
  {
    id: 'hadith-allah-helps-bukhari-2442',
    bodyEn: 'Allah helps the servant as long as the servant helps others.',
    bodyBn: 'বান্দা অন্যকে সাহায্য করলে আল্লাহও তাকে সাহায্য করেন।',
    tone: 'islamic',
    sourceType: 'hadith',
    ref: 'Bukhari 2442',
    collection: 'Sahih al-Bukhari',
    collectionBn: 'সহিহ আল-বুখারি',
    grade: 'Sahih',
    gradeBn: 'সহিহ',
    authentic: true,
  },

  {
    id: 'cut-the-path-early',
    bodyEn: 'Cut the path early before it becomes a habit.',
    bodyBn: 'অভ্যাস হওয়ার আগেই পথটি কেটে দাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'see-the-pattern',
    bodyEn: 'Recognize the pattern and break it early.',
    bodyBn: 'প্যাটার্ন চিনে ফেলো এবং দ্রুত ভেঙে দাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'change-the-context',
    bodyEn: 'Change the place, change the outcome.',
    bodyBn: 'পরিবেশ বদলাও, ফলাফল বদলাবে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'discipline-is-freedom',
    bodyEn: 'Discipline is not restriction. It is freedom.',
    bodyBn: 'শৃঙ্খলা বাধা নয়, এটি স্বাধীনতা।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'energy-follows-action',
    bodyEn: 'Energy often follows action, not the other way around.',
    bodyBn: 'শক্তি অনেক সময় কাজের পর আসে, আগে নয়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'reduce-one-trigger',
    bodyEn: 'Remove one trigger today.',
    bodyBn: 'আজ একটি প্ররোচনা সরাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'stand-up-move',
    bodyEn: 'Stand up and move. Break the state.',
    bodyBn: 'উঠে দাঁড়াও, নড়ো—অবস্থা ভেঙে দাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'respect-boundaries',
    bodyEn: 'Boundaries protect your future.',
    bodyBn: 'সীমা তোমার ভবিষ্যৎকে রক্ষা করে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'pause-and-breathe',
    bodyEn: 'Pause. Breathe. Choose again.',
    bodyBn: 'থামো। শ্বাস নাও। আবার বেছে নাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'short-focus-block',
    bodyEn: 'Focus for 10 minutes. Then extend.',
    bodyBn: '১০ মিনিট ফোকাস করো, তারপর বাড়াও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'habit-loop-awareness',
    bodyEn: 'Notice the trigger, routine, reward loop.',
    bodyBn: 'প্ররোচনা-অভ্যাস-ফল চক্রটি লক্ষ্য করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'one-clean-environment',
    bodyEn: 'Design your space for clean decisions.',
    bodyBn: 'পরিষ্কার সিদ্ধান্তের জন্য পরিবেশ গড়ো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'reduce-night-noise',
    bodyEn: 'Lower noise at night to protect clarity.',
    bodyBn: 'রাতে শব্দ কমাও, স্বচ্ছতা বাঁচাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'consistent-sleep',
    bodyEn: 'Sleep discipline strengthens day discipline.',
    bodyBn: 'ঘুমের শৃঙ্খলা দিনের শৃঙ্খলাকে শক্ত করে।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'identity-reminder',
    bodyEn: 'Act like the person you want to become.',
    bodyBn: 'যে হতে চাও, তার মতো আচরণ করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'small-reset-loop',
    bodyEn: 'Reset quickly. Continue calmly.',
    bodyBn: 'দ্রুত রিসেট করো, শান্তভাবে চালিয়ে যাও।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'limit-exposure-window',
    bodyEn: 'Limit exposure time, not just intention.',
    bodyBn: 'শুধু নিয়ত নয়, সময়ও সীমিত করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'build-simple-rules',
    bodyEn: 'Simple rules remove hard decisions.',
    bodyBn: 'সহজ নিয়ম কঠিন সিদ্ধান্ত কমায়।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
  {
    id: 'focus-on-process',
    bodyEn: 'Focus on the process, not perfection.',
    bodyBn: 'পরিপূর্ণতা নয়, প্রক্রিয়ায় ফোকাস করো।',
    tone: 'english',
    sourceType: 'motivation',
    ref: 'Original',
  },
];

function mapSeedToQuote(
  seed: PurifyQuoteSeed,
  language: PurifyLanguage
): PurifyQuote {
  return {
    id: seed.id,
    body: language === 'bn' ? seed.bodyBn : seed.bodyEn,
    tone: seed.tone,
    sourceType: seed.sourceType,
    ref: seed.ref,
    collection:
      language === 'bn' ? seed.collectionBn ?? seed.collection : seed.collection,
    grade: language === 'bn' ? seed.gradeBn ?? seed.grade : seed.grade,
    authentic: seed.authentic,
  };
}

export const PURIFY_QUOTES_EN: PurifyQuote[] = PURIFY_QUOTES_SEED.map((seed) =>
  mapSeedToQuote(seed, 'en')
);

export const PURIFY_QUOTES_BN: PurifyQuote[] = PURIFY_QUOTES_SEED.map((seed) =>
  mapSeedToQuote(seed, 'bn')
);

export function getPurifyQuotes(language: PurifyLanguage) {
  return language === 'bn' ? PURIFY_QUOTES_BN : PURIFY_QUOTES_EN;
}

export function getAuthenticIslamicQuotes(language: PurifyLanguage) {
  return getPurifyQuotes(language).filter(
    (quote) => quote.tone === 'islamic' && isAuthenticIslamicQuote(quote)
  );
}

export function getMotivationQuotes(language: PurifyLanguage) {
  return getPurifyQuotes(language).filter(
    (quote) => quote.sourceType === 'motivation'
  );
}

export function getPurifyQuoteTagLabel(
  quote: PurifyQuote,
  language: PurifyLanguage
) {
  if (language === 'bn') {
    if (quote.sourceType === 'quran') {
      return 'কুরআনের আয়াত';
    }

    if (quote.sourceType === 'hadith') {
      return quote.authentic ? 'সহিহ হাদিস' : 'হাদিস';
    }

    return 'বিশ্ব অনুপ্রেরণা';
  }

  if (quote.sourceType === 'quran') {
    return 'Quran verse';
  }

  if (quote.sourceType === 'hadith') {
    return quote.authentic ? 'Authentic hadith' : 'Hadith';
  }

  return 'World motivation';
}

export function getPurifyQuoteToneAccentKey(quote: PurifyQuote) {
  if (quote.sourceType === 'quran' || quote.sourceType === 'hadith') {
    return 'islamic';
  }

  return 'english';
}

export function buildPurifyQuoteViewModel(
  quote: PurifyQuote,
  language: PurifyLanguage
) {
  return {
    id: quote.id,
    body: quote.body,
    tone: quote.tone,
    tagLabel: getPurifyQuoteTagLabel(quote, language),
    sourceLabel: formatPurifyQuoteSource(quote, language),
    isAuthentic: isAuthenticIslamicQuote(quote),
    accentKey: getPurifyQuoteToneAccentKey(quote),
  };
}