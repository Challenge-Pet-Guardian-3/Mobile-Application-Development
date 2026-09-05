import { useQuery } from '@tanstack/react-query';
import { ClinicService } from '../services/clinics';
import { queryKeys } from '../lib/queryKeys';
import { FiltroClinica } from '../types/clinic';

export function useClinics(filtro?: FiltroClinica) {
  return useQuery({
    queryKey: queryKeys.clinics.all,
    queryFn: () => ClinicService.getClinicas(),
    select: (clinicas) => ClinicService.filtrarClinicas(clinicas, filtro),
    staleTime: 1000 * 60 * 10,
  });
}

