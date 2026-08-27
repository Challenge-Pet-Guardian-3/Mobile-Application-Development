import { useContext } from 'react';
import { AuthContext, AuthContextData } from '../contexts/AuthContext';

export function useSession(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useSession deve ser utilizado dentro de um AuthProvider');
  }

  return context;
}

// Exportar alias useAuth para facilidade de importação
export const useAuth = useSession;
