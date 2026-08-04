'use client';

import { useState, useEffect } from 'react';
import { criarConfrontoAction, fecharConfrontoAction } from './actions';

interface ConfrontoItem {
  id: string;
  nivel: 'tribo' | 'nacao';
  participante_a_id: string;
  participante_b_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  tipo: 'pontuacao_normal' | 'missoes_exclusivas';
  da_bonus: boolean;
  pontos_bonus: number | null;
  vencedor_id: string | null;
  finalizado: boolean;
  criado_em: string;
}

interface MissaoItem {
  id: string;
  nome: string;
}

export default function AdminConfrontosPage() {
  const [confrontos, setConfrontos] = useState<ConfrontoItem[]>([]);
  const [tribos, setTribos] = useState<any[]>([]);
  const [nacoes, setNacoes] = useState<any[]>([]);
  const [missoes, setMissoes] = useState<MissaoItem[]>([]);

  // Form states
  const [nivel, setNivel] = useState<'tribo' | 'nacao'>('tribo');
  const [participanteA, setParticipanteA] = useState('');
  const [participanteB, setParticipanteB] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [tipo, setTipo] = useState<'pontuacao_normal' | 'missoes_exclusivas'>('pontuacao_normal');
  const [daBonus, setDaBonus] = useState(false);
  const [pontosBonus, setPontosBonus] = useState(50);
  const [missoesExclusivas, setMissoesExclusivas] = useState<string[]>([]);

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [fechandoId, setFechandoId] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  async function carregarDados() {
    const [resC, resT, resN, resM] = await Promise.all([
      fetch('/api/confrontos'),
      fetch('/api/tribos'),
      fetch('/api/nacoes'),
      fetch('/api/missoes?ativas=true'),
    ]);

    if (resC.ok) setConfrontos(await resC.json());
    if (resT.ok) setTribos(await resT.json());
    if (resN.ok) setNacoes(await resN.json());
    if (resM.ok) setMissoes(await resM.json());
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const listaParticipantes = nivel === 'tribo' ? tribos : nacoes;

  // Toggle de seleção de missão exclusiva (multi-select manual)
  function toggleMissaoExclusiva(missaoId: string) {
    setMissoesExclusivas((prev) =>
      prev.includes(missaoId)
        ? prev.filter((id) => id !== missaoId)
        : [...prev, missaoId]
    );
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setResultado(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('nivel', nivel);
    formData.append('participante_a_id', participanteA);
    formData.append('participante_b_id', participanteB);
    formData.append('periodo_inicio', periodoInicio);
    formData.append('periodo_fim', periodoFim);
    formData.append('tipo', tipo);
    formData.append('da_bonus', daBonus.toString());
    formData.append('pontos_bonus', pontosBonus.toString());
    missoesExclusivas.forEach((id) => formData.append('missoes_exclusivas_ids', id));

    const res = await criarConfrontoAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else {
      setParticipanteA('');
      setParticipanteB('');
      setMissoesExclusivas([]);
      carregarDados();
    }
    setCarregando(false);
  }

  // Fechar confronto — agora sem escolha manual de vencedor
  async function handleFechar(confrontoId: string) {
    const confirma = confirm(
      'Deseja finalizar este confronto? O sistema calculará automaticamente o vencedor com base na pontuação. Se a opção de bônus estiver ativa, os pontos serão concedidos automaticamente.'
    );
    if (!confirma) return;

    setFechandoId(confrontoId);
    setResultado(null);

    const res = await fecharConfrontoAction(confrontoId);
    if (res?.error) {
      alert(res.error);
    } else if (res?.success) {
      const nomeVencedor = getNomeParticipante(
        res.vencedorId!,
        confrontos.find((c) => c.id === confrontoId)?.nivel || 'tribo'
      );
      const msgEmpate = res.empate ? ' (empate técnico — participante A favorecido)' : '';
      setResultado(
        `🏆 Confronto finalizado! Vencedor: ${nomeVencedor} (${res.pontosA} × ${res.pontosB} pts)${msgEmpate}`
      );
      carregarDados();
    }
    setFechandoId(null);
  }

  function getNomeParticipante(id: string, nivel: 'tribo' | 'nacao') {
    if (nivel === 'tribo') {
      return tribos.find((t) => t.id === id)?.nome || id;
    }
    return nacoes.find((n) => n.id === id)?.nome || id;
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Gerenciar Confrontos</h1>
        <p className="page-subtitle">Crie disputas diretas entre tribos ou nações com premiação em bônus</p>
      </header>

      {resultado && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {resultado}
        </div>
      )}

      {/* Formulário de Criação */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⚔️ Criar Novo Confronto</h3>

        {erro && (
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
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleCriar}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nível da Disputa</label>
              <select
                className="input-field"
                value={nivel}
                onChange={(e) => {
                  setNivel(e.target.value as any);
                  setParticipanteA('');
                  setParticipanteB('');
                }}
              >
                <option value="tribo" style={{ background: 'var(--bg-card-solid)' }}>Tribo vs Tribo</option>
                <option value="nacao" style={{ background: 'var(--bg-card-solid)' }}>Nação vs Nação</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Participante A</label>
              <select
                className="input-field"
                value={participanteA}
                onChange={(e) => setParticipanteA(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {listaParticipantes.map((p: any) => (
                  <option key={p.id} value={p.id} style={{ background: 'var(--bg-card-solid)' }}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Participante B</label>
              <select
                className="input-field"
                value={participanteB}
                onChange={(e) => setParticipanteB(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {listaParticipantes.map((p: any) => (
                  <option key={p.id} value={p.id} style={{ background: 'var(--bg-card-solid)' }}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Data Início</label>
              <input
                type="date"
                className="input-field"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Data Fim</label>
              <input
                type="date"
                className="input-field"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Formato</label>
              <select
                className="input-field"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as any);
                  if (e.target.value === 'pontuacao_normal') setMissoesExclusivas([]);
                }}
              >
                <option value="pontuacao_normal" style={{ background: 'var(--bg-card-solid)' }}>
                  Pontuação Normal (Geral)
                </option>
                <option value="missoes_exclusivas" style={{ background: 'var(--bg-card-solid)' }}>
                  Missões Exclusivas
                </option>
              </select>
            </div>
          </div>

          {/* Seletor de Missões Exclusivas — visível apenas quando tipo = missoes_exclusivas */}
          {tipo === 'missoes_exclusivas' && (
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
              }}
            >
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                📋 Selecione as Missões Exclusivas deste Confronto
              </label>
              {missoes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Nenhuma missão ativa disponível. Crie missões antes de criar confrontos com missões exclusivas.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                  {missoes.map((m) => (
                    <label
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: missoesExclusivas.includes(m.id)
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: missoesExclusivas.includes(m.id)
                          ? '1px solid rgba(99, 102, 241, 0.4)'
                          : '1px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={missoesExclusivas.includes(m.id)}
                        onChange={() => toggleMissaoExclusiva(m.id)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: 500 }}>{m.nome}</span>
                    </label>
                  ))}
                </div>
              )}
              {missoesExclusivas.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                  {missoesExclusivas.length} missão(ões) selecionada(s)
                </p>
              )}
            </div>
          )}

          {/* Opção de Bônus */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={daBonus}
                onChange={(e) => setDaBonus(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              🏆 Conceder Bônus Automático ao Vencedor?
            </label>

            {daBonus && (
              <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
                <label className="form-label">Pontos Bônus</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={pontosBonus}
                  onChange={(e) => setPontosBonus(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={carregando} className="btn btn-gold">
            {carregando ? 'Criando...' : 'Criar Confronto'}
          </button>
        </form>
      </div>

      {/* Lista de Confrontos */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Confrontos em Andamento e Finalizados</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nível</th>
                <th>Disputa (A vs B)</th>
                <th>Formato</th>
                <th>Período</th>
                <th>Bônus</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ação / Vencedor</th>
              </tr>
            </thead>
            <tbody>
              {confrontos.map((item) => {
                const nomeA = getNomeParticipante(item.participante_a_id, item.nivel);
                const nomeB = getNomeParticipante(item.participante_b_id, item.nivel);

                return (
                  <tr key={item.id}>
                    <td>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                        {item.nivel === 'tribo' ? 'Tribo' : 'Nação'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {nomeA} <span style={{ color: 'var(--accent-gold)' }}>VS</span> {nomeB}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: item.tipo === 'missoes_exclusivas'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                          color: item.tipo === 'missoes_exclusivas' ? '#fbbf24' : '#34d399',
                          fontSize: '0.75rem',
                        }}
                      >
                        {item.tipo === 'missoes_exclusivas' ? 'Missões Exclusivas' : 'Pontuação Normal'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.periodo_inicio} até {item.periodo_fim}
                    </td>
                    <td>
                      {item.da_bonus ? (
                        <span className="badge badge-gold">+{item.pontos_bonus} pts</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sem bônus</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.finalizado ? 'badge-inactive' : 'badge-active'}`}>
                        {item.finalizado ? 'Finalizado' : 'Em Andamento'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {item.finalizado ? (
                        <span style={{ fontWeight: 700, color: '#34d399' }}>
                          🏆 Vencedor: {getNomeParticipante(item.vencedor_id!, item.nivel)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFechar(item.id)}
                          disabled={fechandoId === item.id}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          {fechandoId === item.id ? 'Calculando...' : '📊 Calcular e Finalizar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {confrontos.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhum confronto criado até o momento.
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
