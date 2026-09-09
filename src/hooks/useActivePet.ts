import { useState, useMemo, useEffect, useCallback } from 'react';
import { PetResponse } from '../types/pet';

export interface UseActivePetResult {
  activePet: PetResponse | undefined;
  selectedPetId: number | undefined;
  selectPet: (id: number | undefined) => void;
  setSelectedPetId: React.Dispatch<React.SetStateAction<number | undefined>>;
  hasPets: boolean;
}

/**
 * Hook reutilizável para gerenciar a seleção e resolução do pet ativo a partir de uma lista de pets.
 */
export function useActivePet(pets: PetResponse[], initialPetId?: number): UseActivePetResult {
  const [selectedPetId, setSelectedPetId] = useState<number | undefined>(initialPetId);

  useEffect(() => {
    if (initialPetId !== undefined) {
      setSelectedPetId(initialPetId);
    }
  }, [initialPetId]);

  const selectPet = useCallback((id?: number) => {
    setSelectedPetId(id);
  }, []);

  const activePet: PetResponse | undefined = useMemo(() => {
    if (pets.length === 0) return undefined;
    if (selectedPetId !== undefined && selectedPetId !== null) {
      const found = pets.find((p) => p.id === selectedPetId);
      if (found) return found;
    }
    return pets[0];
  }, [pets, selectedPetId]);

  return {
    activePet,
    selectedPetId,
    selectPet,
    setSelectedPetId,
    hasPets: pets.length > 0,
  };
}
