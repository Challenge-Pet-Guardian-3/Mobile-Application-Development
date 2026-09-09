import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTrainings } from '../../../hooks/useTrainings';

interface TrilhaBannerProgressoProps {
  trail: ReturnType<typeof useTrainings>['trail'];
}

export function TrilhaBannerProgresso({ trail }: TrilhaBannerProgressoProps) {
  const { trilhaAtual, progressoPercent } = trail;
  const categoriaTexto = trilhaAtual?.categoria ? trilhaAtual.categoria.toUpperCase() : 'TREINAMENTO';
  const progresso = progressoPercent ?? 0;

  return (
    <View style={[styles.duoBanner, { backgroundColor: trilhaAtual?.cor || '#58CC02' }]}>
      <View style={styles.duoBannerContent}>
        <Text style={styles.duoBannerTag}>SEÇÃO ATUAL • {categoriaTexto}</Text>
        <Text style={styles.duoBannerTitle}>{trilhaAtual?.titulo}</Text>
        <Text style={styles.duoBannerDesc}>{trilhaAtual?.descricao}</Text>

        {/* Barra de Progresso Duolingo */}
        <View style={styles.duoProgressWrapper}>
          <View style={styles.duoProgressBar}>
            <View style={[styles.duoProgressFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={styles.duoProgressText}>{progresso}% Completo</Text>
        </View>
      </View>

      <View style={styles.duoBannerMascot}>
        <FontAwesome5 name="graduation-cap" size={38} color="#FFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  duoBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  duoBannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  duoBannerTag: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  duoBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
    marginBottom: 4,
  },
  duoBannerDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 17,
    marginBottom: 12,
  },
  duoBannerMascot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duoProgressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  duoProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  duoProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 5,
  },
  duoProgressText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
