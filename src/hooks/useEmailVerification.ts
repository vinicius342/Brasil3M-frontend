import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para redirecionamento baseado na verificação de e-mail
 * @param requireEmailVerification - Se true, redireciona para /profile se e-mail não verificado
 * @param redirectPath - Caminho para redirecionamento se não autenticado
 */
export const useEmailVerification = (
  requireEmailVerification: boolean = false, 
  redirectPath: string = '/login'
) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Se não está logado, redireciona para login
    if (!currentUser) {
      navigate(redirectPath);
      return;
    }

    // Se requer verificação de e-mail e não está verificado
    if (requireEmailVerification && !currentUser.emailVerified) {
      navigate('/profile');
      return;
    }
  }, [currentUser, loading, requireEmailVerification, redirectPath, navigate]);

  return {
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    loading
  };
};
