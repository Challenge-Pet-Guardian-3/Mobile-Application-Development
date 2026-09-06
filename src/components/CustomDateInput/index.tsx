import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../CustomInput';
import { formatarDataHojeBr } from '../../utils/petUtils';

interface CustomDateInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeDate: (dateFormatted: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  editable?: boolean;
  showTime?: boolean;
  quickTimePresets?: boolean;
}

const TIME_PRESETS = [
  { label: '08:00', hora: '08:00' },
  { label: '12:00', hora: '12:00' },
  { label: '14:00', hora: '14:00' },
  { label: '18:00', hora: '18:00' },
  { label: '20:00', hora: '20:00' },
  { label: '23:59', hora: '23:59' },
];

export const CustomDateInput = memo(function CustomDateInput({
  label = 'Data',
  placeholder,
  value,
  onChangeDate,
  error,
  containerStyle,
  editable = true,
  showTime = false,
  quickTimePresets = false,
}: CustomDateInputProps) {
  const defaultPlaceholder = showTime ? 'DD/MM/AAAA HH:mm' : 'DD/MM/AAAA';

  const handleChangeText = (text: string) => {
    if (!showTime) {
      const digits = text.replace(/\D/g, '').slice(0, 8);
      let formatted = digits;
      if (digits.length > 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
      } else if (digits.length > 2) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
      onChangeDate(formatted);
      return;
    }

    const digits = text.replace(/\D/g, '').slice(0, 12);
    let formatted = digits;
    if (digits.length > 10) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
    } else if (digits.length > 8) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    onChangeDate(formatted);
  };

  const handleApplyPresetTime = (hora: string) => {
    const dataPart = value.includes(' ')
      ? value.split(' ')[0]
      : (value.length >= 10 ? value.slice(0, 10) : formatarDataHojeBr());
    onChangeDate(`${dataPart} ${hora}`);
  };

  return (
    <View style={containerStyle}>
      <CustomInput
        label={label}
        placeholder={placeholder || defaultPlaceholder}
        keyboardType="numeric"
        maxLength={showTime ? 16 : 10}
        value={value}
        onChangeText={handleChangeText}
        error={error}
        editable={editable}
        leftIcon={<Ionicons name={showTime ? 'time-outline' : 'calendar-outline'} size={18} color="#64748B" />}
      />

      {showTime && quickTimePresets && (
        <View style={styles.presetsRow}>
          <Text style={styles.presetsLabel}>Horários rápidos sugeridos:</Text>
          <View style={styles.chipsContainer}>
            {TIME_PRESETS.map((p) => {
              const isSelected = value.endsWith(p.hora);
              return (
                <TouchableOpacity
                  key={p.hora}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleApplyPresetTime(p.hora)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  presetsRow: {
    marginTop: -6,
    marginBottom: 12,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 5,
    marginLeft: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
