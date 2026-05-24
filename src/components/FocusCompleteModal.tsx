import React, { useMemo } from 'react';
import { Modal, Text, View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { createFocusCompleteModalStyles } from '../styles/FocusCompleteModal.styles';

const MOTIVATIONAL_MESSAGES = [
  "Great job! You stayed focused and productive.",
  "One step closer to your goals. Keep it up!",
  "Session complete. Take a well-deserved break!",
  "Consistency is key, and you're nailing it.",
  "You've unlocked a new level of productivity today.",
  "Focused minds achieve great things. Like you.",
  "The secret of success is in your daily routine.",
  "Success is small efforts, repeated daily."
];

type FocusCompleteModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function FocusCompleteModal({ visible, onClose }: FocusCompleteModalProps) {
  const { mode, getPalette } = useAppTheme();
  const palette = useMemo(() => getPalette('focus'), [getPalette]);
  const styles = useMemo(() => createFocusCompleteModalStyles(palette, mode), [palette, mode]);

  const motivation = useMemo(() => {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={48} color={palette.green} />
          </View>

          <Text style={styles.title}>Focus Complete</Text>
          <Text style={styles.message}>
            Your session has been saved and your progress is recorded.
          </Text>

          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>"{motivation}"</Text>
          </View>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
