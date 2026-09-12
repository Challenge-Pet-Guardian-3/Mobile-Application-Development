import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView, DimensionValue, Keyboard, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../utils/shadow';
import { colors, layout, borderRadius } from '../../constants/theme';

export type ModalSize = 'sm' | 'md' | 'lg';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  size?: ModalSize;
  maxHeight?: DimensionValue;
}

export function BaseModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  size = 'md',
  maxHeight,
}: BaseModalProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
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

  // Largura máxima e altura calculadas proporcionalmente de acordo com a variante (SOLID & Clean Code)
  const computedMaxWidth = Math.min(layout.modal.width[size], windowWidth - 32);

  const dynamicBodyMaxHeight = useMemo(() => {
    if (typeof maxHeight === 'number') {
      return maxHeight;
    }
    if (isKeyboardVisible) {
      const available = windowHeight - keyboardHeight - (Platform.OS === 'ios' ? 160 : 130);
      return Math.max(160, Math.min(available, windowHeight * 0.45));
    }
    // Proporção ergonômica padrão: 70% da altura da tela para evitar cortes ou overflow
    return Math.min(layout.modal.maxHeightMaxPx, windowHeight * layout.modal.maxHeightRatio);
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
          <View style={[styles.card, { maxWidth: computedMaxWidth }]}>
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
                  <Ionicons name="close" size={20} color={colors.neutral[500]} />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              style={{ maxHeight: dynamicBodyMaxHeight }}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'center',
    padding: 20,
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xxl,
    padding: layout.modal.cardPadding,
    width: '100%',
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
