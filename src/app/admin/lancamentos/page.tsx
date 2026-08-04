'use client';

import { useState, useEffect } from 'react';
import { removerLancamentoAction } from './actions';

interface LancamentoItem {
  id: string;
  missao_id: string;
  tribo_id: string;
  quantidade: number;
  pontos_calculados: number;
  origem: string;
  criado_em: string;
}

interface AuxData {
  tribosMap: Record<string, string>;
  missoesMap: Record<string, string>;
}

export default function AdminLancamentosPage() {
  const [lancamentos, setLancamentos] = useState<LancamentoItem[]>([]);
  const [aux, setAux] = useState<AuxData>({ tribosMap: {}, missoesMap: {} });
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);
    const [resL, resT, resM] = await Promise.all([
      fetch('/api/lancamentos'),
      fetch('/api/tribos'),
      fetch('/api/missoes'),
    ]);

    if (resL.ok) setLancamentos(await resL.json());

    const tribosMap: Record<string, string> = {};
    if (resT.ok) {
      const dataT = await resT.json();
      dataT.forEach((t: any) => (tribosMap[t.id] = t.nome));
    }

    const missoesMap: Record<string, string> = {};
    if (resM.ok) {
      const dataM = await resM.json();
      dataM.forEach((m: any) => (missoesMap[m.id] = m.nome));
    }

    setAux({ tribosMap, missoesMap });
    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleRemover(id: string) {
    if (confirm('Deseja remover este lançamento pontual? O registro sofrerá soft delete e os pontos serão recalculados.')) {
      const res = await removerLancamentoAction(id);
      if (res?.error) alert(res.error);
      else carregarDados();
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Histórico de Lançamentos</h1>
        <p className="page-subtitle">Consulte e efetue o soft delete de lançamentos específicos</p>
      </header>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Registro Geral de Lançamentos</h3>

        {carregando ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>Carregando histórico...</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Tribo</th>
                  <th>Missão / Origem</th>
                  <th>Qtd</th>
                  <th>Pontos</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(item.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {aux.tribosMap[item.tribo_id] || item.tribo_id}
                    </td>
                    <td>
                      {item.origem === 'bonus_confronto' ? (
                        <span className="badge badge-gold">🏆 Bônus de Confronto</span>
                      ) : (
                        aux.missoesMap[item.missao_id] || item.missao_id
                      )}
                    </td>
                    <td>{item.quantidade}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                      +{item.pontos_calculados} pts
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRemover(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        🗑️ Soft Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {lancamentos.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Nenhum lançamento registrado até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
