import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { RankingTable } from '@/presentation/components/RankingTable';
import Link from 'next/link';

export const revalidate = 60; // Refresh a cada 60s

export default async function RankingPublicoPage() {
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.ranking.consultarPublico.execute();

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 className="page-title">🏆 Ranking Geral — Rally</h1>
            <p className="page-subtitle">Classificação em tempo real das Nações e Tribos</p>
          </div>
          <Link href="/login" className="btn btn-secondary">
            🔐 Acesso Restrito
          </Link>
        </header>

        {!res.ok ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Exibição Pública Desativada</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              {res.error.message}
            </p>
          </div>
        ) : (
          <div>
            <RankingTable titulo="Classificação por Nações" nacoes={res.value.nacoes} />
            <RankingTable titulo="Classificação por Tribos" tribos={res.value.tribos} />
          </div>
        )}
      </div>
    </div>
  );
}
