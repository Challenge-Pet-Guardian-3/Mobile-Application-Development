import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Interface flexível para aceitar tanto do usePets quanto do useHome
export interface PetHealthData {
  id?: number | string;
  nome?: string;
  peso?: number | string | null;
  ultimaVacina?: string | null;
  ultimaConsulta?: string | null;
  [key: string]: any;
}

interface HealthHistoryCardProps {
  pets: PetHealthData[];
}

function formatarData(data?: string | null) {
  if (!data || !String(data).trim()) return 'Não informado';
  const limpa = String(data).trim();
  
  if (limpa.includes('-')) {
    const [ano, mes, dia] = limpa.split('-');
    if (ano && mes && dia && ano.length === 4) {
      return `${dia}/${mes}/${ano}`;
    }
  }
  return limpa;
}

function formatarPeso(peso?: number | string | null) {
  if (peso === null || peso === undefined || peso === '') return 'Não informado';
  const numLimpo = String(peso).replace(/[^\d.,]/g, '').replace(',', '.');
  const valor = parseFloat(numLimpo);
  return isNaN(valor) ? 'Não informado' : `${valor} kg`;
}

export const HealthHistoryCard = memo(function HealthHistoryCard({ pets }: HealthHistoryCardProps) {
  if (!pets || pets.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Histórico Clínico</Text>
      {pets.map((pet, index) => (
        <View 
          key={pet.id ?? index} 
          style={index === pets.length - 1 ? styles.lastPetItem : styles.petItem}
        >
          <Text style={styles.petName}>{pet.nome || 'Pet sem nome'}</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <MaterialCommunityIcons name="weight" size={22} color="#1CB0F6" />
              <Text style={styles.value}>{formatarPeso(pet.peso)}</Text>
              <Text style={styles.label}>Peso</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.item}>
              <MaterialCommunityIcons name="needle" size={22} color="#FF9600" />
              <Text style={styles.value}>{formatarData(pet.ultimaVacina)}</Text>
              <Text style={styles.label}>Vacina</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.item}>
              <FontAwesome5 name="stethoscope" size={18} color="#58CC02" />
              <Text style={styles.value}>{formatarData(pet.ultimaConsulta)}</Text>
              <Text style={styles.label}>Consulta</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B',
    marginBottom: 16
  },
  petItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 15
  },
  lastPetItem: {
    marginBottom: 0,
    borderBottomWidth: 0,
    paddingBottom: 0
  },
  petName: { 
    fontWeight: '700', 
    fontSize: 15, 
    color: '#334155', 
    marginBottom: 8 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  item: { 
    alignItems: 'center', 
    flex: 1 
  },
  value: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    marginTop: 6 
  },
  label: { 
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 2 
  },
  divider: { 
    width: 1, 
    height: 36, 
    backgroundColor: '#E2E8F0' 
  }
});