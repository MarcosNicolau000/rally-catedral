'use client';

// =====================================================
// Componente: RankingTable
// =====================================================
// Renderiza a tabela de ranking estilizada com medalhas
// e colunas de pontuação total e semanal.
// =====================================================

import { RankingNacao, RankingTribo } from '@/modules/ranking/domain/repositories/RankingRepository';

interface RankingTableProps {
  titulo: string;
  nacoes?: RankingNacao[];
  tribos?: RankingTribo[];
}

export function RankingTable({ titulo, nacoes, tribos }: RankingTableProps) {
  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🏆</span> {titulo}
      </h3>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Pos.</th>
              <th>Nome</th>
              <th style={{ textAlign: 'right' }}>Pontos Semanais</th>
              <th style={{ textAlign: 'right' }}>Pontos Totais</th>
            </tr>
          </thead>
          <tbody>
            {nacoes &&
              nacoes.map((item, index) => {
                const pos = index + 1;
                const badgeClass =
                  pos === 1 ? 'rank-1' : pos === 2 ? 'rank-2' : pos === 3 ? 'rank-3' : 'rank-other';

                return (
                  <tr key={item.nacao_id}>
                    <td>
                      <span className={`rank-badge ${badgeClass}`}>{pos}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.nacao_nome}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      +{item.pontos_semana ?? 0}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-gold)' }}>
                      {item.pontos_total} pts
                    </td>
                  </tr>
                );
              })}

            {tribos &&
              tribos.map((item, index) => {
                const pos = index + 1;
                const badgeClass =
                  pos === 1 ? 'rank-1' : pos === 2 ? 'rank-2' : pos === 3 ? 'rank-3' : 'rank-other';

                return (
                  <tr key={item.tribo_id}>
                    <td>
                      <span className={`rank-badge ${badgeClass}`}>{pos}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.tribo_nome}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      +{item.pontos_semana ?? 0}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-gold)' }}>
                      {item.pontos_total} pts
                    </td>
                  </tr>
                );
              })}

            {((nacoes && nacoes.length === 0) || (tribos && tribos.length === 0)) && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Nenhum registro encontrado no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
