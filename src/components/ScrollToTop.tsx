import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo sempre que a rota mudar
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
