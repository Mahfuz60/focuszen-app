export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  settings: 'focuszen/settings',
  focus: 'focuszen/focus',
  study: 'focuszen/study',
  usage: 'focuszen/usage',
  control: 'focuszen/control',
  planner: 'focuszen/planner',
  routine: 'focuszen/routine',
  goals: 'focuszen/goals',
  purify: 'focuszen/purify',
  profile: 'focuszen/profile',
  appMeta: 'focuszen/app-meta',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
