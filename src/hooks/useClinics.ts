import { useQuery } from '@tanstack/react-query';
import { ClinicService } from '../services/clinics';
import { queryKeys } from '../lib/queryKeys';
import { FiltroClinica } from '../types/clinic';

export function useClinics(filtro?: FiltroClinica) {
  return useQuery({
    queryKey: queryKeys.clinics.search(filtro?.termoBusca, filtro?.somente24h),
    queryFn: () => ClinicService.getClinicas(filtro),
  });
}
