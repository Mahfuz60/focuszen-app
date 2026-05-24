import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export function WaveProgress({ progress, size, color, mode }: { progress: number, size: number, color: string, mode: 'dark' | 'light' }) {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  const radius = size / 2;
  const fillLevel = size * (1 - progress);

  // Translate wave horizontally for wave effect
  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size],
  }) as any;

  const bottomColor = mode === 'dark' ? '#0c4a6e' : '#bae6fd';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: radius }}>
      {/* Background Outer Ring */}
      <View style={[StyleSheet.absoluteFill, { 
        borderRadius: radius, 
        borderWidth: 1, 
        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(14, 165, 233, 0.12)',
        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(14, 165, 233, 0.03)'
      }]} />

      {/* Masked Wave container */}
      <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', position: 'absolute' }}>
        <Animated.View style={{
          position: 'absolute',
          top: fillLevel - 10, // offset so wave peaks are visible
          left: 0,
          width: size * 2,
          height: size + 30,
          transform: [{ translateX }],
        }}>
          <Svg width={size * 2} height={size + 30} viewBox={`0 0 ${size * 2} ${size + 30}`}>
            <Defs>
              <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={mode === 'dark' ? '#fff' : '#e0f2fe'} stopOpacity="0.4" />
                <Stop offset="0.2" stopColor={color} stopOpacity="0.8" />
                <Stop offset="1" stopColor={bottomColor} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            {/* Draw a double wave cycle path */}
            <Path
              d={`M0,15 Q${size * 0.25},0 ${size * 0.5},15 T${size},15 T${size * 1.5},15 T${size * 2},15 V${size + 30} H0 Z`}
              fill="url(#waterGrad)"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}
