import { useState, useCallback, useMemo } from 'react';
import { Linking, Alert } from 'react-native';
import { useClinics } from './useClinics';

export function useClinicsSearch() {
  const [termoBusca, setTermoBusca] = useState('');
  const [somente24h, setSomente24h] = useState(false);
  const [somenteProntoSocorro, setSomenteProntoSocorro] = useState(false);

  const filtro = useMemo(
    () => ({
      termoBusca,
      somente24h,
      somenteProntoSocorro,
    }),
    [termoBusca, somente24h, somenteProntoSocorro]
  );

  const {
    data: clinicas,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useClinics(filtro);


  const handleLigar = useCallback((telefone: string) => {
    const num = telefone.replace(/\D/g, '');
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Contato', `Telefone da clínica: ${telefone}`);
    });
  }, []);

  const alternar24h = useCallback(() => {
    setSomente24h((prev) => !prev);
  }, []);

  const alternarProntoSocorro = useCallback(() => {
    setSomenteProntoSocorro((prev) => !prev);
  }, []);

  const limparBusca = useCallback(() => {
    setTermoBusca('');
  }, []);

  return {
    clinicas: clinicas || [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    termoBusca,
    setTermoBusca,
    somente24h,
    somenteProntoSocorro,
    alternar24h,
    alternarProntoSocorro,
    limparBusca,
    handleLigar,
  };
}
