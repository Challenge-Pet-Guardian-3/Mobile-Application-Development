import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaregiverCard } from '../../../components/CaregiverCard';
import { shadows } from '../../../utils/shadow';
import { usePetDetail } from '../../../hooks/usePetDetail';
import { useSession } from '../../../hooks/useSession';

interface PetCaregiversSectionProps {
  pet: ReturnType<typeof usePetDetail>['pet'];
  user: ReturnType<typeof useSession>['user'];
  onInvite: () => void;
}

export function PetCaregiversSection({ pet, user, onInvite }: PetCaregiversSectionProps) {
  const caregiversCount = pet?.caregiversCount ?? pet?.caregivers?.length ?? 0;
  const isPrincipal = Boolean(pet?.isPrincipal);
  const temCuidadores = (pet?.caregivers?.length ?? 0) > 0;

  return (
    <View style={styles.sectionBox}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="people" size={18} color="#2563EB" />
          <Text style={styles.sectionTitle}>
            Rede de Cuidado ({caregiversCount})
          </Text>
        </View>
        {isPrincipal && (
          <TouchableOpacity
            style={styles.btnInvite}
            onPress={onInvite}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={13} color="#2563EB" />
            <Text style={styles.btnInviteText}>Convidar</Text>
          </TouchableOpacity>
        )}
      </View>

      {!temCuidadores ? (
        user && (
          <CaregiverCard
            nome={user?.nome || 'Tutor'}
            email={user?.email}
            roleText={isPrincipal ? 'Responsável Principal' : 'Co-cuidador'}
            isCurrentUser
            isPrincipal={isPrincipal}
          />
        )
      ) : (
        pet?.caregivers?.map((c) => (
          <CaregiverCard
            key={c.usuarioId}
            nome={c.nome}
            email={c.email}
            isPrincipal={c.responsavelPrincipal}
            isCurrentUser={c.isCurrentUser}
            onTransfer={c.onTransfer}
            onRemove={c.onRemove}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...shadows.sm,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  btnInvite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  btnInviteText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 11,
  },
});
