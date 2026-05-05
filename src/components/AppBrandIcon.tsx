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

import { useAppTheme } from '../hooks/useAppTheme';

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

function getBrandConfig(appName: AppControlTarget | string, mode: 'light' | 'dark'): BrandConfig {
  const isDark = mode === 'dark';
  const fixedBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 1)';
  
  switch (normalizeAppName(appName)) {
    case 'YouTube':
      return { 
        icon: siYoutube, 
        iconColor: isDark ? '#FF0000' : '#FFFFFF', 
        background: isDark ? fixedBg : '#FF0000' 
      };
    case 'Instagram':
      return { 
        icon: siInstagram, 
        iconColor: '#FFFFFF', 
        gradient: isDark ? ['#E4405F', '#FD1D1D', '#F56040'] : ['#833AB4', '#E1306C', '#F77737']
      };
    case 'Facebook':
      return { 
        icon: siFacebook, 
        iconColor: isDark ? '#1877F2' : '#FFFFFF', 
        background: isDark ? fixedBg : '#1877F2' 
      };
    case 'Snapchat':
      return { 
        icon: siSnapchat, 
        iconColor: '#333333', 
        background: '#FFFC00' 
      };
    case 'TikTok':
      return { 
        icon: siTiktok, 
        iconColor: isDark ? '#FFFFFF' : '#000000', 
        background: isDark ? fixedBg : '#FFFFFF' 
      };
    case 'Telegram':
      return { 
        icon: siTelegram, 
        iconColor: isDark ? '#24A1DE' : '#FFFFFF', 
        background: isDark ? fixedBg : '#24A1DE' 
      };
    case 'Line':
      return { 
        icon: siLine, 
        iconColor: isDark ? '#06C755' : '#FFFFFF', 
        background: isDark ? fixedBg : '#06C755' 
      };
    case 'Messenger':
      return { 
        icon: siMessenger, 
        iconColor: isDark ? '#00B2FF' : '#FFFFFF', 
        background: isDark ? fixedBg : '#00B2FF' 
      };
    case 'WhatsApp':
      return { 
        icon: siWhatsapp, 
        iconColor: isDark ? '#25D366' : '#FFFFFF', 
        background: isDark ? fixedBg : '#25D366' 
      };
    case 'X':
      return { 
        icon: siX, 
        iconColor: '#FFFFFF', 
        background: '#000000' 
      };
    default:
      return { 
        icon: siAppstore, 
        iconColor: isDark ? '#5b8dff' : '#FFFFFF', 
        background: isDark ? fixedBg : '#5b8dff' 
      };
  }
}

export function getAppColor(appName: AppControlTarget | string): string {
  // Use a default mode for color getting
  return getBrandConfig(appName, 'light').background || '#5b8dff';
}

export function AppBrandIcon({ appName, size = 36 }: AppBrandIconProps) {
  const { mode } = useAppTheme();
  const config = getBrandConfig(appName, mode);
  const shellStyle = [
    styles.shell,
    {
      width: size,
      height: size,
      borderRadius: size * 0.28,
    },
  ];
  const iconSize = size * 0.58;

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
