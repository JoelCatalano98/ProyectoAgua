import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook para acceder al contexto global de autenticación.
 * Provee user, token, isAuthenticated, login y logout.
 *
 * @returns {{ user: object|null, token: string|null, isAuthenticated: boolean, login: Function, logout: Function }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
