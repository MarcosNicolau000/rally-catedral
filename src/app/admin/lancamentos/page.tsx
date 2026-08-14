'use client';

import { useState, useEffect } from 'react';
import { removerLancamentoAction, ajustarPontuacaoManualAction } from './actions';
import { ConfirmDialog } from '@/presentation/components/ConfirmDialog';


interface LancamentoItem {
  id: string;
  missao_id: string;
  tribo_id: string;
  quantidade: number;
  pontos_calculados: number;
  origem: string;
  descricao?: string | null;
  criado_em: string;
}

interface TriboItem {
  id: string;
  nome: string;
}

interface AuxData {
  tribosMap: Record<string, string>;
  missoesMap: Record<string, string>;
}

export default function AdminLancamentosPage() {
  const [lancamentos, setLancamentos] = useState<LancamentoItem[]>([]);
  const [tribos, setTribos] = useState<TriboItem[]>([]);
  const [aux, setAux] = useState<AuxData>({ tribosMap: {}, missoesMap: {} });
  const [carregando, setCarregando] = useState(true);

  // Modal de Exclusão
  const [lancamentoParaRemover, setLancamentoParaRemover] = useState<LancamentoItem | null>(null);

  // Estado do formulário de ajuste manual
  const [triboId, setTriboId] = useState('');
  const [pontos, setPontos] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erroAjuste, setErroAjuste] = useState<string | null>(null);
  const [salvandoAjuste, setSalvandoAjuste] = useState(false);

  async function carregarDados() {
    setCarregando(true);
    const [resL, resT, resM] = await Promise.all([
      fetch('/api/lancamentos'),
      fetch('/api/tribos'),
      fetch('/api/missoes'),
    ]);

    if (resL.ok) setLancamentos(await resL.json());

    const tribosMap: Record<string, string> = {};
    let listaTribos: TriboItem[] = [];
    if (resT.ok) {
      listaTribos = await resT.json();
      listaTribos.forEach((t: any) => (tribosMap[t.id] = t.nome));
    }
    setTribos(listaTribos);
    if (listaTribos.length > 0 && !triboId) setTriboId(listaTribos[0].id);

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

  async function handleConfirmarRemocao() {
    if (!lancamentoParaRemover) return;
    const res = await removerLancamentoAction(lancamentoParaRemover.id);
    if (res?.error) alert(res.error);
    else carregarDados();
    setLancamentoParaRemover(null);
  }

  async function handleAjustar(e: React.FormEvent) {
    e.preventDefault();
    setErroAjuste(null);

    const pontosNum = parseInt(pontos, 10);
    if (isNaN(pontosNum) || pontosNum === 0) {
      setErroAjuste('Informe uma quantidade de pontos válida e diferente de zero.');
      return;
    }

    setSalvandoAjuste(true);

    const formData = new FormData();
    formData.append('tribo_id', triboId);
    formData.append('pontos', String(pontosNum));
    formData.append('motivo', motivo);

    const res = await ajustarPontuacaoManualAction(formData);

    if (res?.error) {
      setErroAjuste(res.error);
    } else {
      setPontos('');
      setMotivo('');
      carregarDados();
    }
    setSalvandoAjuste(false);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Histórico de Lançamentos</h1>
        <p className="page-subtitle">Consulte lançamentos, faça ajustes manuais de pontuação e efetue o soft delete de registros</p>
      </header>

      {/* Ajuste Manual de Pontuação */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⚖️ Ajuste Manual de Pontuação</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Adicione ou remova pontos diretamente de uma tribo, sem vínculo com uma missão. Use valores negativos para remover pontos.
        </p>

        {erroAjuste && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ {erroAjuste}
          </div>
        )}

        <form onSubmit={handleAjustar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '220px', marginBottom: 0 }}>
            <label className="form-label">Tribo</label>
            <select
              className="input-field"
              value={triboId}
              onChange={(e) => setTriboId(e.target.value)}
              required
            >
              {tribos.map((t) => (
                <option key={t.id} value={t.id} style={{ background: 'var(--bg-card-solid)' }}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ minWidth: '160px', marginBottom: 0 }}>
            <label className="form-label">Pontos (+/-)</label>
            <input
              type="number"
              className="input-field"
              value={pontos}
              onChange={(e) => setPontos(e.target.value)}
              placeholder="Ex: 10 ou -5"
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Motivo (opcional)</label>
            <input
              type="text"
              className="input-field"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Penalidade por atraso"
            />
          </div>

          <button type="submit" disabled={salvandoAjuste || !triboId} className="btn btn-primary">
            {salvandoAjuste ? 'Salvando...' : 'Aplicar Ajuste'}
          </button>
        </form>
      </div>

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
                      {aux.tribosMap[item.tribo_id] || (item.tribo_id ? `Tribo Removida (${item.tribo_id.substring(0, 8)}...)` : 'Desconhecida')}
                    </td>

                    <td>
                      {item.origem === 'bonus_confronto' ? (
                        <span className="badge badge-gold">🏆 Bônus de Confronto</span>
                      ) : item.origem === 'ajuste_manual' ? (
                        <span>
                          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                            ⚖️ Ajuste Manual
                          </span>
                          {item.descricao && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              {item.descricao}
                            </div>
                          )}
                        </span>
                      ) : (
                        aux.missoesMap[item.missao_id] || item.missao_id
                      )}
                    </td>
                    <td>{item.quantidade}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: item.pontos_calculados < 0 ? '#f87171' : 'var(--accent-gold)',
                      }}
                    >
                      {item.pontos_calculados >= 0 ? '+' : ''}
                      {item.pontos_calculados} pts
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setLancamentoParaRemover(item)}
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

      <ConfirmDialog
        isOpen={!!lancamentoParaRemover}
        titulo="Remover Lançamento (Soft Delete)"
        mensagem="Tem certeza que deseja remover este lançamento? O registro sofrerá soft delete e a pontuação agregada da tribo será recalculada automaticamente."
        labelConfirmar="Remover Lançamento"
        onConfirm={handleConfirmarRemocao}
        onCancel={() => setLancamentoParaRemover(null)}
      />
    </div>
  );
}

