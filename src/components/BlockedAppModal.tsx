import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ScreenPalette } from '../theme/screenPalettes';

const { width } = Dimensions.get('window');

type BlockedAppModalProps = {
  visible: boolean;
  appName: string;
  reason: string;
  onClose: () => void;
  palette: ScreenPalette;
};

export function BlockedAppModal({ visible, appName, reason, onClose, palette }: BlockedAppModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="shield-alert" size={48} color="#ef4444" />
          </View>
          
          <Text style={[styles.title, { color: palette.text }]}>Focus Protected</Text>
          <Text style={[styles.appName, { color: palette.accent }]}>{appName} is currently blocked</Text>
          
          <View style={styles.reasonBox}>
            <Ionicons name="information-circle-outline" size={18} color={palette.textSoft} />
            <Text style={[styles.reasonText, { color: palette.textSoft }]}>{reason}</Text>
          </View>
          
          <Text style={styles.motivationText}>
            "The secret of change is to focus all of your energy, not on fighting the old, but on building the new."
          </Text>

          <Pressable 
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: palette.accent, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={styles.buttonText}>Stay Focused</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: width - 48,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    marginBottom: 24,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  motivationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
});
