import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { RankingTable } from '@/presentation/components/RankingTable';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const resRanking = await services.ranking.consultarAdmin.execute();
  const ranking = resRanking.ok ? resRanking.value : { nacoes: [], tribos: [] };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Painel Administrativo</h1>
          <p className="page-subtitle">Visão geral do Rally, pontuações e atalhos de gestão</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/missoes" className="btn btn-primary">
            + Nova Missão
          </Link>
          <Link href="/admin/configuracoes" className="btn btn-gold">
            ⚙️ Gerenciar Rally
          </Link>
        </div>
      </header>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>NAÇÕES CADASTRADAS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-gold)' }}>
            {ranking.nacoes.length}
          </div>
        </div>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TRIBOS PARTICIPANTES</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-primary)' }}>
            {ranking.tribos.length}
          </div>
        </div>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>LÍDER DA COMPETIÇÃO</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', color: '#34d399' }}>
            {ranking.nacoes[0]?.nacao_nome || (
              <Link href="/admin/nacoes" style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', textDecoration: 'underline' }}>
                Nenhuma (Cadastrar Nação)
              </Link>
            )}
          </div>
        </div>

      </div>

      <RankingTable titulo="Classificação Geral de Nações" nacoes={ranking.nacoes} variant="admin" />
      <RankingTable titulo="Classificação Geral de Tribos" tribos={ranking.tribos} variant="admin" />
    </div>
  );
}
