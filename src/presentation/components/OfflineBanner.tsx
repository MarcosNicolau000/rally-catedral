// =====================================================
// Componente: OfflineBanner
// =====================================================
// Exibe um banner fixo no topo quando o usuário está offline.
// Seção 6 da spec: "Deixar claro na UI quando o usuário está offline."
// Lançamentos exigem conexão ativa (autorização é validada no servidor/banco).
// =====================================================

'use client';

import { useOfflineStatus } from '@/presentation/hooks/useOfflineStatus';

export function OfflineBanner() {
  // Hook que monitora o status de conexão em tempo real
  const isOffline = useOfflineStatus();

  // Se estiver online, não renderiza nada
  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
        color: '#fff',
        textAlign: 'center',
        padding: '0.6rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: '1rem' }}>📡</span>
      Você está offline — lançamentos e operações exigem conexão com a internet.
    </div>
  );
}
