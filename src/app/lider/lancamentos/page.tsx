'use client';

import { useState, useEffect } from 'react';

import { registrarLancamentoLiderAction } from './actions';
import { useOfflineStatus } from '@/presentation/hooks/useOfflineStatus';

interface MissaoItem {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: 'booleana' | 'contagem';
  pontos_base: number;
}

export default function LiderLancamentosPage() {
  const isOffline = useOfflineStatus();
  const [missoes, setMissoes] = useState<MissaoItem[]>([]);
  const [missaoSelecionadaId, setMissaoSelecionadaId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valorBooleano, setValorBooleano] = useState(true);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);


  async function carregarMissoes() {
    const res = await fetch('/api/missoes?ativas=true');
    if (res.ok) {
      const data = await res.json();
      setMissoes(data);
      if (data.length > 0) setMissaoSelecionadaId(data[0].id);
    }
  }

  useEffect(() => {
    carregarMissoes();
  }, []);

  const missaoAtual = missoes.find((m) => m.id === missaoSelecionadaId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('missao_id', missaoSelecionadaId);
    formData.append('quantidade', quantidade.toString());
    formData.append('valor_booleano', valorBooleano.toString());

    const res = await registrarLancamentoLiderAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else if (res?.success) {
      setSucesso(res.mensagem || 'Lançamento registrado com sucesso!');
      setQuantidade(1);
      setValorBooleano(true);
    }
    setCarregando(false);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Registrar Pontuação da Tribo</h1>
        <p className="page-subtitle">Selecione uma missão ativa para lançar a pontuação da sua tribo</p>
      </header>

      {sucesso && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          ✅ {sucesso}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          ⚠️ {erro}
        </div>
      )}

      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>➕ Novo Lançamento de Missão</h3>

        {missoes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma missão ativa disponível para lançamento no momento.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Selecione a Missão</label>
              <select
                className="input-field"
                value={missaoSelecionadaId}
                onChange={(e) => setMissaoSelecionadaId(e.target.value)}
                required
              >
                {missoes.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: 'var(--bg-card-solid)' }}>
                    {m.nome} ({m.tipo === 'booleana' ? 'Sim/Não' : 'Contagem'} — {m.pontos_base} pts)
                  </option>
                ))}
              </select>
            </div>

            {missaoAtual && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                  {missaoAtual.nome}
                </div>
                {missaoAtual.descricao && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{missaoAtual.descricao}</p>
                )}

                {/* Se for booleana */}
                {missaoAtual.tipo === 'booleana' ? (
                  <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                    <label className="form-label">A missão foi cumprida?</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#34d399' }}>
                        <input
                          type="radio"
                          name="booleana"
                          checked={valorBooleano === true}
                          onChange={() => setValorBooleano(true)}
                        />
                        Sim, cumprida (+{missaoAtual.pontos_base} pts)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <input
                          type="radio"
                          name="booleana"
                          checked={valorBooleano === false}
                          onChange={() => setValorBooleano(false)}
                        />
                        Não cumprida (0 pts)
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Se for contagem */
                  <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                    <label className="form-label">Informe a Quantidade Realizada</label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      value={quantidade}
                      onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
                      required
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Pontuação final: {quantidade * missaoAtual.pontos_base} pts ({quantidade} x {missaoAtual.pontos_base} pts)
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando || isOffline}
              className="btn btn-gold"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {carregando ? 'Registrando...' : isOffline ? 'Offline — Sem Conexão' : 'Confirmar Lançamento'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

