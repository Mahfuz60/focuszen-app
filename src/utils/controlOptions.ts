import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppControlSettings, AppControlTarget, AppFeatureKey } from '../types/models';

export type ControlOptionDescriptor = {
  key: AppFeatureKey;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const APP_DISPLAY_NAMES: Partial<Record<AppControlTarget, string>> = {
  WhatsApp: 'WhatsApp Messenger',
};

const APP_PRIORITY_ORDER: Partial<Record<AppControlTarget, number>> = {
  YouTube: 0,
  Facebook: 1,
};

const APP_OPTION_MAP: Record<AppControlTarget, ControlOptionDescriptor[]> = {
  YouTube: [
    { key: 'blockShorts', label: 'Block shorts', icon: 'play-outline' },
    { key: 'blockSearch', label: 'Block video search', icon: 'search-outline' },
    { key: 'blockPictureInPicture', label: 'Block picture-in-picture', icon: 'tablet-landscape-outline' },
    { key: 'blockComments', label: 'Block comments', icon: 'chatbox-ellipses-outline' },
  ],
  Instagram: [
    { key: 'blockExplore', label: 'Block explore', icon: 'compass-outline' },
    { key: 'blockReels', label: 'Block reels', icon: 'film-outline' },
    { key: 'blockStories', label: 'Block stories', icon: 'albums-outline' },
  ],
  Facebook: [
    { key: 'blockFeed', label: 'Block feed', icon: 'newspaper-outline' },
    { key: 'blockStories', label: 'Block stories', icon: 'albums-outline' },
    { key: 'blockReels', label: 'Block reels', icon: 'film-outline' },
  ],
  Snapchat: [
    { key: 'blockSpotlight', label: 'Block spotlight', icon: 'flashlight-outline' },
    { key: 'blockStories', label: 'Block stories', icon: 'albums-outline' },
  ],
  TikTok: [
    { key: 'blockSearch', label: 'Block search', icon: 'search-outline' },
    { key: 'blockComments', label: 'Block comments', icon: 'chatbox-ellipses-outline' },
     { key: 'blockReels', label: 'Block reels', icon: 'film-outline' },
  ],
  Telegram: [{ key: 'blockChannels', label: 'Block channels', icon: 'grid-outline' }],
  Line: [{ key: 'blockVoom', label: 'Block voom', icon: 'play-forward-outline' }],
  Messenger: [{ key: 'blockStories', label: 'Block stories', icon: 'albums-outline' }],
  WhatsApp: [
    { key: 'blockStatus', label: 'Block status', icon: 'radio-button-on-outline' },
    { key: 'blockChannels', label: 'Block channels', icon: 'grid-outline' },
  ],
  X: [{ key: 'blockExplore', label: 'Block explore tab', icon: 'search-outline' }],
};

export function getControlOptionDescriptors(appName: AppControlTarget) {
  return APP_OPTION_MAP[appName] ?? [];
}

export function getAppDisplayName(appName: AppControlTarget) {
  return APP_DISPLAY_NAMES[appName] ?? appName;
}

export function countEnabledOptions(control: AppControlSettings) {
  return Object.values(control.features).filter(Boolean).length + (control.blocked ? 1 : 0);
}

export function sortControlsByUsage(controls: AppControlSettings[]) {
  return [...controls].sort((left, right) => {
    const leftPriority = APP_PRIORITY_ORDER[left.appName] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = APP_PRIORITY_ORDER[right.appName] ?? Number.MAX_SAFE_INTEGER;
    const priorityDelta = leftPriority - rightPriority;

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const usageDelta = right.todayUsageMinutes - left.todayUsageMinutes;

    if (usageDelta !== 0) {
      return usageDelta;
    }

    return getAppDisplayName(left.appName).localeCompare(getAppDisplayName(right.appName));
  });
}
