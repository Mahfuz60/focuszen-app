import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G, Mask } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  }, []);

  const radius = size / 2;
  const fillLevel = size * (1 - progress);

  // Robust path logic
  const wavePath = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `M-40,${fillLevel} C${size * 0.2},${fillLevel - 20} ${size * 0.5},${fillLevel + 20} ${size},${fillLevel} V${size} H-40 Z`,
      `M-40,${fillLevel} C${size * 0.2},${fillLevel + 20} ${size * 0.5},${fillLevel - 20} ${size},${fillLevel} V${size} H-40 Z`
    ]
  });

  const bottomColor = mode === 'dark' ? '#0c4a6e' : '#bae6fd';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Outer Ring */}
      <View style={[StyleSheet.absoluteFill, { 
        borderRadius: radius, 
        borderWidth: 1, 
        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(14, 165, 233, 0.12)',
        backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(14, 165, 233, 0.03)'
      }]} />

      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={mode === 'dark' ? '#fff' : '#e0f2fe'} stopOpacity="0.4" />
            <Stop offset="0.2" stopColor={color} stopOpacity="0.8" />
            <Stop offset="1" stopColor={bottomColor} stopOpacity="1" />
          </LinearGradient>
          <Mask id="circleMask">
            <Circle cx={radius} cy={radius} r={radius} fill="white" />
          </Mask>
        </Defs>

        <G mask="url(#circleMask)">
          {/* Subtle bubbles */}
          <Circle cx={size * 0.3} cy={size * 0.6} r="4" fill="#fff" opacity="0.1" />
          <Circle cx={size * 0.7} cy={size * 0.5} r="6" fill="#fff" opacity="0.05" />
          
          <AnimatedPath 
            d={wavePath as any} 
            fill="url(#waterGrad)" 
          />
        </G>
      </Svg>
    </View>
  );
}
