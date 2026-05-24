import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { ClipPath, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { DRINK_TYPES, DrinkType, useBodyCareStore } from '../stores/useBodyCareStore';
import { createHydrationAddModalStyles } from '../styles/BodyCareScreen.styles';

type HydrationAddModalProps = {
  visible: boolean;
  initialType?: DrinkType;
  onClose: () => void;
  onAdd: (amount: number, type: DrinkType) => void;
  palette: any;
};

export function HydrationAddModal({ visible, initialType, onClose, onAdd, palette }: HydrationAddModalProps) {
  const { totalWaterToday, waterGoalMl } = useBodyCareStore();
  const { width } = useWindowDimensions();
  const [selectedType, setSelectedType] = useState<DrinkType>(initialType || 'Water');
  const [volume, setVolume] = useState(250);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Realistic defaults for different drinks
  useEffect(() => {
    if (visible) {
      const type = initialType || 'Water';
      setSelectedType(type);
      
      let defaultVolume = 250;
      if (type === 'Coffee' || type === 'Tea') defaultVolume = 200;
      if (type === 'Juice') defaultVolume = 330;
      if (type === 'Milk') defaultVolume = 200;
      
      setVolume(defaultVolume);
      
      // Calculate scroll position (10ml per 10px shift, starting from 100ml)
      const scrollPos = (defaultVolume - 100); 
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollPos, animated: true });
      }, 100);
    }
  }, [visible, initialType]);

  const styles = useMemo(
    () => createHydrationAddModalStyles(palette),
    [palette]
  );

  // Ruler markings (100ml to 1000ml)
  const markings = Array.from({ length: 91 }, (_, i) => 100 + i * 10);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / 10);
        const newVolume = 100 + index * 10;
        if (newVolume !== volume && newVolume >= 100 && newVolume <= 1000) {
          setVolume(newVolume);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  );

  const selectedDrink = DRINK_TYPES.find(d => d.type === selectedType) || DRINK_TYPES[0];
  const goalRatio = Math.min(((totalWaterToday || 0) / Math.max(waterGoalMl || 2500, 1)) * 100, 100);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: palette.text }]}>Add Drink</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <View style={{ width: 100, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <View style={{ width: `${Number.isFinite(goalRatio) ? goalRatio : 0}%`, height: '100%', borderRadius: 2, backgroundColor: palette.blue }} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>
                  {Math.round(Number.isFinite(goalRatio) ? goalRatio : 0)}% of goal
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={palette.textSoft} />
            </Pressable>
          </View>

          {/* Beverage Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.typeScroll}
            contentContainerStyle={styles.typeScrollContent}
          >
            {DRINK_TYPES.map(d => (
              <Pressable 
                key={d.type} 
                onPress={() => setSelectedType(d.type as DrinkType)}
                style={styles.typeItem}
              >
                <View style={[
                  styles.typeIconShell,
                  { 
                    borderColor: selectedType === d.type ? d.color : 'transparent',
                    backgroundColor: selectedType === d.type ? `${d.color}15` : 'rgba(255,255,255,0.03)' 
                  },
                  selectedType === d.type && styles.typeIconShellActive,
                ]}>
                  <Image source={{ uri: d.imageUri }} style={styles.typeImageIcon} />
                </View>
                <Text style={[styles.typeLabel, { color: selectedType === d.type ? d.color : palette.textSoft }]}>{d.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Visual Glass & Amount */}
          <View style={styles.visualContainer}>
            <View style={styles.amountCard}>
              <View style={styles.amountRow}>
                <View style={styles.glassFrame}>
                  <Svg width="80" height="100" viewBox="0 0 60 80">
                    <Defs>
                      <ClipPath id="clip">
                        <Path d="M10,5 L50,5 L45,75 L15,75 Z" />
                      </ClipPath>
                      <LinearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={selectedDrink.color} stopOpacity="0.9" />
                        <Stop offset="1" stopColor={selectedDrink.color} stopOpacity="0.5" />
                      </LinearGradient>
                    </Defs>
                    {/* Glass Body */}
                    <Path d="M10,5 L50,5 L45,75 L15,75 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    
                    {/* Water Fill */}
                    <Rect 
                      x="0" 
                      y={80 - (volume / 1000) * 80} 
                      width="60" 
                      height="80" 
                      fill="url(#liquidGrad)" 
                      clipPath="url(#clip)"
                    />
                    {/* Top Rim */}
                    <Path d="M10,5 L50,5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                  </Svg>
                </View>

                <View style={styles.volumeBadge}>
                   <Text style={styles.volumeVal}>{volume}</Text>
                   <Text style={styles.volumeUnit}>ml</Text>
                   <Text style={styles.drinkName}>{selectedType}</Text>
                </View>
              </View>

              {/* Ruler */}
              <View style={styles.rulerContainer}>
                <View style={[
                  styles.indicator, 
                  { backgroundColor: selectedDrink.color, shadowColor: selectedDrink.color }
                ]} />
                <Animated.ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={10}
                  decelerationRate="fast"
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  contentContainerStyle={[styles.rulerContent, { paddingHorizontal: width / 2 - 20 }]}
                >
                  {markings.map((m, i) => (
                    <View key={i} style={styles.markingWrapper}>
                      <View style={[
                        styles.mark,
                        { 
                          backgroundColor: volume === m ? selectedDrink.color : i % 5 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', 
                          height: i % 10 === 0 ? 30 : i % 5 === 0 ? 18 : 10,
                          width: volume === m ? 2.5 : 1.5
                        }
                      ]} />
                      {i % 10 === 0 && (
                        <Text style={[
                          styles.markText, 
                          { color: volume === m ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: volume === m ? 11 : 9 }
                        ]}>{m}</Text>
                      )}
                    </View>
                  ))}
                </Animated.ScrollView>
              </View>
            </View>
          </View>

          {/* Quick Presets Row */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
             {[250, 350, 500].map(ml => (
               <Pressable 
                 key={ml} 
                 onPress={() => {
                   setVolume(ml);
                   scrollViewRef.current?.scrollTo({ x: ml - 100, animated: true });
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                 }}
                 style={{ 
                   flex: 1, height: 38, borderRadius: 12, 
                   backgroundColor: volume === ml ? `${selectedDrink.color}25` : 'rgba(255,255,255,0.04)',
                   borderWidth: 1, borderColor: volume === ml ? selectedDrink.color : 'transparent',
                   alignItems: 'center', justifyContent: 'center'
                 }}
               >
                 <Text style={{ fontSize: 11, fontWeight: '800', color: volume === ml ? '#fff' : 'rgba(255,255,255,0.6)' }}>{ml}ml</Text>
               </Pressable>
             ))}
          </View>

          <Pressable 
            onPress={() => {
              onAdd(volume, selectedType);
              onClose();
            }} 
            style={[styles.addBtn, { backgroundColor: selectedDrink.color, shadowColor: selectedDrink.color }]}
          >
            <Text style={styles.addBtnText}>Log {volume}ml {selectedType}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
