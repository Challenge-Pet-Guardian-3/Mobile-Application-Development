import React from 'react';
import { View, StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PremiumLockCard } from '../../components/PremiumLockCard';
import { TrainingTrail } from './components/TrainingTrail';
import { LessonDetailModal } from './components/LessonDetailModal';
import { useTrainings } from '../../hooks/useTrainings';
import { SeletorPetTreinamento } from './components/SeletorPetTreinamento';
import { TrilhasGamificacaoHeader } from './components/TrilhasGamificacaoHeader';
import { TrilhaBannerProgresso } from './components/TrilhaBannerProgresso';
import { SeletorTrilhasPills } from './components/SeletorTrilhasPills';
import { TrilhasEmptyState } from './components/TrilhasEmptyState';

export default function TrainingEducationScreen() {
  const { status, pet, trail, actions } = useTrainings();
  const { petAtivo } = pet;
  const { trilhaAtual } = trail;

  // Se o usuário for Comum, exibe mensagem amigável sobre o recurso Premium
  if (status.isUserComum) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPad}>
          <Header title="Trilhas & Treinamento" />
        </View>
        <PremiumLockCard
          title="Trilhas de Adestramento Premium ⭐"
          description="As trilhas gamificadas de adestramento, lições interativas e ganho de XP acelerado são exclusivas para assinantes Premium."
          benefits={[
            'Módulos educativos completos com IA',
            'Lições práticas e acompanhamento de XP',
            'Assistente inteligente ilimitado',
          ]}
          iconName="crown"
        />
      </View>
    );
  }

  const temTrilhas = (trail?.trilhas?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status.isFetching && !status.isLoadingTrilhas}
            onRefresh={actions.refetch}
            tintColor="#58CC02"
          />
        }
      >
        <View style={styles.headerPad}>
          <Header title="Trilhas & Treinamento" />
        </View>

        {/* Seletor de Pets da Família */}
        <SeletorPetTreinamento pet={pet} />

        {status.isLoadingTrilhas ? (
          <View style={{ paddingVertical: 40 }}>
            <LoadingSpinner message="Buscando trilhas do pet..." size="small" />
          </View>
        ) : !temTrilhas ? (
          <TrilhasEmptyState petAtivo={petAtivo} />
        ) : (
          <>
            {/* Top Bar de Gamificação (Lições, XP e Status) */}
            <TrilhasGamificacaoHeader trail={trail} pet={pet} />

            {/* Banner da Trilha com Barra de Progresso Duolingo */}
            <TrilhaBannerProgresso trail={trail} />

            {/* Seletor de Trilhas (Pills) */}
            <SeletorTrilhasPills trail={trail} />

            {/* Trilha Visual com Nós / Trail Estilo Duolingo */}
            <TrainingTrail
              licoes={trilhaAtual?.licoes ?? []}
              corTrilha={trilhaAtual?.cor}
              onSelectLicao={(licao) => trilhaAtual && trail.setLicaoSelecionada({ trilhaId: trilhaAtual.id, licao })}
            />
          </>
        )}
      </ScrollView>

      {/* Modal de Lição Interativa Duolingo */}
      <LessonDetailModal
        visible={Boolean(trail?.licaoSelecionada)}
        licao={trail?.licaoSelecionada?.licao}
        corTrilha={trilhaAtual?.cor}
        isConcluindo={status?.isConcluindo}
        onClose={() => trail.setLicaoSelecionada(undefined)}
        onConcluir={actions.concluirLicao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerPad: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
});
