'use client';

// =====================================================
// Componente: RankingTable (v3 — Dual Mode)
// =====================================================
// Suporta dois modos de exibição:
// - "combate" (padrão): visual temático para a página pública
// - "admin": visual glassmorphism para o painel administrativo
// =====================================================

import Image from 'next/image';
import { RankingNacao, RankingTribo } from '@/modules/ranking/domain/repositories/RankingRepository';

// Mapeamento flexível de nomes → logo
// Busca pelo nome parcial (case insensitive) para cobrir
// variações como "Imbatível" vs "Nação Imbatível"
const LOGO_ENTRIES: { match: string; src: string }[] = [
  { match: 'imbat',   src: '/nacao_imbativel.png' },
  { match: 'impacto', src: '/nacao_impacto.png' },
  { match: 'sime',    src: '/Simeao.png' },
  { match: 'manass',  src: '/Manasses.png' },
  { match: 'aser',    src: '/Aser.png' },
  { match: 'gade',    src: '/Gade.png' },
  { match: 'jud',     src: '/Juda.png' },
  { match: 'issacar', src: '/Issacar.png' },
];

// Busca a logo pelo nome (match parcial, case insensitive)
function findLogo(nome: string): string | undefined {
  const lower = nome.toLowerCase();
  return LOGO_ENTRIES.find((e) => lower.includes(e.match))?.src;
}

interface RankingTableProps {
  titulo: string;
  nacoes?: RankingNacao[];
  tribos?: RankingTribo[];
  // "combate" = visual temático (página pública)
  // "admin"   = visual glassmorphism (dashboard)
  variant?: 'combate' | 'admin';
}

// Formata nome com destaque: "Nação Imbatível" → prefix:"NAÇÃO" + highlight:"IMBATÍVEL"
function formatName(nome: string): { prefix: string; highlight: string } {
  if (!nome) return { prefix: '', highlight: '' };
  const cleanName = nome.replace(/\s+/g, ' ').trim();
  const parts = cleanName.split(' ');
  if (parts.length >= 2) {
    return {
      prefix: parts[0].toUpperCase(),
      highlight: parts.slice(1).join(' ').toUpperCase(),
    };
  }
  return { prefix: '', highlight: cleanName.toUpperCase() };
}


export function RankingTable({ titulo, nacoes, tribos, variant = 'combate' }: RankingTableProps) {
  // =====================================================
  // MODO ADMIN — Visual glassmorphism original
  // =====================================================
  if (variant === 'admin') {
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

  // =====================================================
  // MODO COMBATE — Visual temático para ranking público
  // =====================================================
  const isNacoes = Boolean(nacoes);
  const colLabel = isNacoes ? 'Nação' : 'Tribo';

  return (
    <div className="ranking-section">
      {/* Cabeçalho da seção */}
      <div className="ranking-section-header">
        <span className="ranking-section-icon" role="img" aria-label="troféu">🏆</span>
        <span className="ranking-section-title">{titulo}</span>
      </div>

      {/* Tabela de ranking */}
      <table className="ranking-table">
        <thead>
          <tr>
            <th className="col-pos">Pos.</th>
            <th className="col-name">{colLabel}</th>
            <th className="col-weekly">Pontos Semanais</th>
            <th className="col-total">Pontos Totais</th>
          </tr>
        </thead>
        <tbody>
          {/* Renderizar Nações */}
          {nacoes &&
            nacoes.map((item, index) => {
              const pos = index + 1;
              const posClass =
                pos <= 3 ? `ranking-pos--${pos}` : 'ranking-pos--other';
              const logo = findLogo(item.nacao_nome);
              const { prefix, highlight } = formatName(item.nacao_nome);

              return (
                <tr key={item.nacao_id}>
                  <td>
                    <span className={`ranking-pos ${posClass}`}>{pos}</span>
                  </td>
                  <td>
                    <div className="ranking-name-cell">
                      {logo && (
                        <Image
                          src={logo}
                          alt={item.nacao_nome}
                          width={72}
                          height={72}
                          className="ranking-logo ranking-logo--nacao"
                        />
                      )}
                      <span className="ranking-item-label">
                        {prefix} <strong>{highlight}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="ranking-points-weekly">
                    +{item.pontos_semana ?? 0}
                  </td>
                  <td className="ranking-points-total">
                    {item.pontos_total} PTS
                  </td>
                </tr>
              );
            })}

          {/* Renderizar Tribos */}
          {tribos &&
            tribos.map((item, index) => {
              const pos = index + 1;
              const posClass =
                pos <= 3 ? `ranking-pos--${pos}` : 'ranking-pos--other';
              const logo = findLogo(item.tribo_nome);
              const { prefix, highlight } = formatName(item.tribo_nome);

              return (
                <tr key={item.tribo_id}>
                  <td>
                    <span className={`ranking-pos ${posClass}`}>{pos}</span>
                  </td>
                  <td>
                    <div className="ranking-name-cell">
                      {logo && (
                        <Image
                          src={logo}
                          alt={item.tribo_nome}
                          width={56}
                          height={56}
                          className="ranking-logo"
                        />
                      )}
                      <span className="ranking-item-label">
                        {prefix} <strong>{highlight}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="ranking-points-weekly">
                    +{item.pontos_semana ?? 0}
                  </td>
                  <td className="ranking-points-total">
                    {item.pontos_total} PTS
                  </td>
                </tr>
              );
            })}

          {/* Estado vazio */}
          {((nacoes && nacoes.length === 0) || (tribos && tribos.length === 0)) && (
            <tr className="ranking-empty-row">
              <td colSpan={4}>
                Nenhum registro encontrado no momento.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
