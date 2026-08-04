// =====================================================
// Hook: useOfflineStatus
// =====================================================
// Monitora o status de conexão do navegador em tempo real.
// Retorna true quando o usuário está offline.
// Seção 6 da spec: "Deixar claro na UI quando offline."
// =====================================================

'use client';

import { useState, useEffect } from 'react';

export function useOfflineStatus(): boolean {
  // Inicializa com o estado atual do navegador
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Atualiza o estado inicial no client (navigator pode não existir no SSR)
    setIsOffline(!navigator.onLine);

    // Handlers que atualizam o estado quando a conexão muda
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Registra os listeners nos eventos nativos do navegador
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Cleanup ao desmontar o componente
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return isOffline;
}
