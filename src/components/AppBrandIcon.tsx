import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  SimpleIcon,
  siAppstore,
  siFacebook,
  siInstagram,
  siLine,
  siMessenger,
  siSnapchat,
  siTelegram,
  siTiktok,
  siWhatsapp,
  siX,
  siYoutube,
} from 'simple-icons';
import { AppControlTarget } from '../types/models';

type AppBrandIconProps = {
  appName: AppControlTarget | string;
  size?: number;
};

type BrandConfig = {
  icon: SimpleIcon;
  iconColor: string;
  background?: string;
  gradient?: readonly [string, string, ...string[]];
};

function normalizeAppName(appName: string): AppControlTarget | 'fallback' {
  const normalized = appName.trim().toLowerCase();
  switch (normalized) {
    case 'youtube':
      return 'YouTube';
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'snapchat':
      return 'Snapchat';
    case 'tiktok':
      return 'TikTok';
    case 'telegram':
      return 'Telegram';
    case 'line':
      return 'Line';
    case 'messenger':
      return 'Messenger';
    case 'whatsapp':
    case 'whatsapp messenger':
      return 'WhatsApp';
    case 'x':
    case 'twitter':
      return 'X';
    default:
      return 'fallback';
  }
}

function getBrandConfig(appName: AppControlTarget | string): BrandConfig {
  const fixedBg = 'rgba(255, 255, 255, 0.08)';
  switch (normalizeAppName(appName)) {
    case 'YouTube':
      return { icon: siYoutube, iconColor: '#FF0000', background: fixedBg };
    case 'Instagram':
      return { icon: siInstagram, iconColor: '#E4405F', background: fixedBg };
    case 'Facebook':
      return { icon: siFacebook, iconColor: '#1877F2', background: fixedBg };
    case 'Snapchat':
      return { icon: siSnapchat, iconColor: '#FFFC00', background: fixedBg };
    case 'TikTok':
      return { icon: siTiktok, iconColor: '#FFFFFF', background: fixedBg };
    case 'Telegram':
      return { icon: siTelegram, iconColor: '#24A1DE', background: fixedBg };
    case 'Line':
      return { icon: siLine, iconColor: '#06C755', background: fixedBg };
    case 'Messenger':
      return { icon: siMessenger, iconColor: '#00B2FF', background: fixedBg };
    case 'WhatsApp':
      return { icon: siWhatsapp, iconColor: '#25D366', background: fixedBg };
    case 'X':
      return { icon: siX, iconColor: '#FFFFFF', background: fixedBg };
    default:
      return { icon: siAppstore, iconColor: '#5b8dff', background: fixedBg };
  }
}

export function AppBrandIcon({ appName, size = 36 }: AppBrandIconProps) {
  const config = getBrandConfig(appName);
  const shellStyle = [
    styles.shell,
    {
      width: size,
      height: size,
      borderRadius: size * 0.34,
    },
  ];
  const iconSize = size * 0.52;

  const iconSvg = (
    <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
      <Path d={config.icon.path} fill={config.iconColor} />
    </Svg>
  );

  if (config.gradient) {
    return <LinearGradient colors={config.gradient} style={shellStyle}>{iconSvg}</LinearGradient>;
  }

  return <View style={[shellStyle, { backgroundColor: config.background }]}>{iconSvg}</View>;
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
