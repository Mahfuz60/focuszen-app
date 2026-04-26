import { AppControlTarget } from '../types/models';

export const SOCIAL_APPS: AppControlTarget[] = [
  'YouTube',
  'Instagram',
  'Facebook',
  'Snapchat',
  'TikTok',
  'Telegram',
  'Line',
  'Messenger',
  'WhatsApp',
  'X',
];

export const APP_PACKAGE_NAMES: Record<AppControlTarget, string> = {
  YouTube: 'com.google.android.youtube',
  Instagram: 'com.instagram.android',
  Facebook: 'com.facebook.katana',
  Snapchat: 'com.snapchat.android',
  TikTok: 'com.zhiliaoapp.musically',
  Telegram: 'org.telegram.messenger',
  Line: 'jp.naver.line.android',
  Messenger: 'com.facebook.orca',
  WhatsApp: 'com.whatsapp',
  X: 'com.twitter.android',
};
