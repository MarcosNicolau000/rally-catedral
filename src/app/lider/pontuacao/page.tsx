import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { redirect } from 'next/navigation';

export default async function LiderPontuacaoPage() {
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const perfilRes = await services.usuario.obterLogado.execute();

  if (!perfilRes.ok || !perfilRes.value.tribo_id) {
    redirect('/login');
  }

  const triboId = perfilRes.value.tribo_id;

  const [triboRes, lancamentosRes, rankingTribosRes] = await Promise.all([
    services.repos.triboRepo.buscarPorId(triboId),
    services.lancamento.listar.execute(triboId),
    services.repos.rankingRepo.obterRankingTribos(),
  ]);

  const tribo = triboRes;
  const lancamentos = lancamentosRes.ok ? lancamentosRes.value : [];
  const rankingTribo = rankingTribosRes.find((t) => t.tribo_id === triboId);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Minha Tribo: {tribo?.nome || '—'}</h1>
        <p className="page-subtitle">Acompanhe a pontuação e os lançamentos da sua tribo</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>PONTUAÇÃO TOTAL DA TRIBO</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
            {rankingTribo?.pontos_total ?? 0} pts
          </div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>LANÇAMENTOS REALIZADOS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
            {lancamentos.length}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Histórico de Lançamentos da Tribo</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Quantidade</th>
                <th>Pontos Obtidos</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(item.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td>{item.quantidade}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    +{item.pontos_calculados} pts
                  </td>
                  <td>
                    {item.origem === 'bonus_confronto' ? (
                      <span className="badge badge-gold">🏆 Bônus de Confronto</span>
                    ) : (
                      <span className="badge badge-active">Missão</span>
                    )}
                  </td>
                </tr>
              ))}

              {lancamentos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                      Sua tribo ainda não registrou pontos neste Rally!
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Acesse o menu <strong>+ Novo Lançamento</strong> para pontuar nas missões ativas.
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
