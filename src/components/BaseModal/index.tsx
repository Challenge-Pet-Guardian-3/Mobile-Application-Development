import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  DimensionValue,
  Keyboard,
  useWindowDimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  maxHeight?: DimensionValue;
}

export function BaseModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  maxHeight = 450,
}: BaseModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isKeyboardVisible = keyboardHeight > 0;

  // Altura dinâmica para que o conteúdo do modal JAMAIS ultrapasse o topo ou vaze a tela
  const dynamicBodyMaxHeight = useMemo(() => {
    if (isKeyboardVisible) {
      const available = windowHeight - keyboardHeight - (Platform.OS === 'ios' ? 200 : 170);
      const target = typeof maxHeight === 'number' ? maxHeight : 450;
      return Math.max(140, Math.min(target, available));
    }
    const target = typeof maxHeight === 'number' ? maxHeight : 450;
    return Math.min(target, windowHeight * 0.7);
  }, [isKeyboardVisible, keyboardHeight, windowHeight, maxHeight]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            isKeyboardVisible && {
              justifyContent: 'flex-start',
              paddingTop: Platform.OS === 'ios' ? 56 : 38,
              paddingBottom: 10,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <View style={styles.header}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                  </View>
                  {showCloseButton ? (
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={20} color="#64748B" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: dynamicBodyMaxHeight }}
                  contentContainerStyle={styles.body}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    elevation: 10,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  body: {
    paddingVertical: 2,
  },
});
