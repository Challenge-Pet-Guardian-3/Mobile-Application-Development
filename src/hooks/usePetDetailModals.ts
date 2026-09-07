import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PetResponse } from '../types/pet';
import { HistoricoResponse } from '../types/historico';
import { PetFormData } from '../components/PetFormModal';
import { InviteCaregiverData } from '../components/InviteCaregiverModal';
import { HistoricoFormSubmitData } from '../components/HistoricoFormModal';
import { ActionCallbacks } from './usePetDetail';

interface UsePetDetailModalsProps {
  activePet: PetResponse | undefined;
  isResponsavelPrincipal: boolean;
  salvarEdicaoPet: (formData: PetFormData, callbacks?: ActionCallbacks) => void;
  excluirPet: (callbacks?: ActionCallbacks) => void;
  convidarCuidador: (email: string, callbacks?: ActionCallbacks) => void;
  criarHistorico: (data: { tipoHist: string; dataHist: string }, callbacks?: ActionCallbacks) => void;
  atualizarHistorico: (id: number, data: { tipoHist: string; dataHist: string }, callbacks?: ActionCallbacks) => void;
  excluirHistorico: (id: number, tipoHist: string, callbacks?: ActionCallbacks) => void;
  onGoBack?: () => void;
}

export function usePetDetailModals({
  activePet,
  isResponsavelPrincipal,
  salvarEdicaoPet,
  excluirPet,
  convidarCuidador,
  criarHistorico,
  atualizarHistorico,
  excluirHistorico,
  onGoBack,
}: UsePetDetailModalsProps) {
  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [modalConviteVisivel, setModalConviteVisivel] = useState(false);
  const [modalHistoricoVisivel, setModalHistoricoVisivel] = useState(false);
  const [itemEdicaoHistorico, setItemEdicaoHistorico] = useState<HistoricoResponse | undefined>(undefined);

  const abrirEdicao = useCallback(() => {
    if (!activePet) return;
    if (!isResponsavelPrincipal) {
      Alert.alert('Acesso Negado', 'Somente o tutor principal pode editar as informações deste pet.');
      return;
    }
    setModalEdicaoVisivel(true);
  }, [activePet, isResponsavelPrincipal]);

  const handleSalvarEdicao = useCallback(
    (formData: PetFormData) => {
      salvarEdicaoPet(formData, {
        onSuccess: () => setModalEdicaoVisivel(false),
      });
    },
    [salvarEdicaoPet]
  );

  const handleExcluirPet = useCallback(() => {
    excluirPet({
      onSuccess: () => {
        onGoBack?.();
      },
    });
  }, [excluirPet, onGoBack]);

  const handleConvidarCuidador = useCallback(
    (data: InviteCaregiverData) => {
      convidarCuidador(data.email, {
        onSuccess: () => setModalConviteVisivel(false),
      });
    },
    [convidarCuidador]
  );

  const handleAbrirNovoHistorico = useCallback(() => {
    setItemEdicaoHistorico(undefined);
    setModalHistoricoVisivel(true);
  }, []);

  const handleAbrirEdicaoHistorico = useCallback((item: HistoricoResponse) => {
    setItemEdicaoHistorico(item);
    setModalHistoricoVisivel(true);
  }, []);

  const handleSalvarHistorico = useCallback(
    (data: HistoricoFormSubmitData) => {
      if (itemEdicaoHistorico) {
        atualizarHistorico(itemEdicaoHistorico.id, data, {
          onSuccess: () => setModalHistoricoVisivel(false),
        });
      } else {
        criarHistorico(data, {
          onSuccess: () => setModalHistoricoVisivel(false),
        });
      }
    },
    [itemEdicaoHistorico, atualizarHistorico, criarHistorico]
  );

  const handleExcluirHistorico = useCallback(
    (item: HistoricoResponse) => {
      excluirHistorico(item.id, item.tipoHist);
    },
    [excluirHistorico]
  );

  return {
    edicaoVisivel: modalEdicaoVisivel,
    setEdicaoVisivel: setModalEdicaoVisivel,
    abrirEdicao,
    salvarEdicao: handleSalvarEdicao,
    excluirPet: handleExcluirPet,
    conviteVisivel: modalConviteVisivel,
    setConviteVisivel: setModalConviteVisivel,
    convidarCuidador: handleConvidarCuidador,
    historicoVisivel: modalHistoricoVisivel,
    setHistoricoVisivel: setModalHistoricoVisivel,
    itemEdicaoHistorico,
    abrirNovoHistorico: handleAbrirNovoHistorico,
    abrirEdicaoHistorico: handleAbrirEdicaoHistorico,
    salvarHistorico: handleSalvarHistorico,
    excluirHistorico: handleExcluirHistorico,
  };
}
