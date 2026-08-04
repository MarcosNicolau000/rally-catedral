'use client';

import { useState, useEffect } from 'react';
import { criarMissaoAction, desativarMissaoAction } from './actions';

interface MissaoItem {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: 'booleana' | 'contagem';
  pontos_base: number;
  ativa: boolean;
  criado_em: string;
}

export default function AdminMissoesPage() {
  const [missoes, setMissoes] = useState<MissaoItem[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'booleana' | 'contagem'>('booleana');
  const [pontosBase, setPontosBase] = useState(10);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarMissoes() {
    const res = await fetch('/api/missoes');
    if (res.ok) setMissoes(await res.json());
  }

  useEffect(() => {
    carregarMissoes();
  }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('descricao', descricao);
    formData.append('tipo', tipo);
    formData.append('pontos_base', pontosBase.toString());

    const res = await criarMissaoAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else {
      setNome('');
      setDescricao('');
      setPontosBase(10);
      carregarMissoes();
    }
    setCarregando(false);
  }

  async function handleDesativar(id: string) {
    if (confirm('Deseja desativar esta missão? Ela não aparecerá mais para novos lançamentos, mas o histórico de pontos já computados será mantido.')) {
      const res = await desativarMissaoAction(id);
      if (res?.error) alert(res.error);
      else carregarMissoes();
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Gerenciar Missões Pontuáveis</h1>
        <p className="page-subtitle">Crie missões booleanas ou de contagem com suas pontuações base</p>
      </header>

      {/* Formulário de Cadastro */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🎯 Cadastrar Nova Missão</h3>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome da Missão</label>
              <input
                type="text"
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Leitura Bíblica Diária"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tipo de Missão</label>
              <select
                className="input-field"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                required
              >
                <option value="booleana" style={{ background: 'var(--bg-card-solid)' }}>
                  Booleana (Sim / Não)
                </option>
                <option value="contagem" style={{ background: 'var(--bg-card-solid)' }}>
                  Contagem (Quantidade Manual)
                </option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pontos Base</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={pontosBase}
                onChange={(e) => setPontosBase(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição (Opcional)</label>
            <input
              type="text"
              className="input-field"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instruções adicionais para os líderes..."
            />
          </div>

          <button type="submit" disabled={carregando} className="btn btn-primary">
            {carregando ? 'Criando...' : 'Criar Missão'}
          </button>
        </form>
      </div>

      {/* Lista de Missões */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Missões Existentes</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Pontos Base</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {missoes.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    {item.nome}
                    {item.descricao && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {item.descricao}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {item.tipo === 'booleana' ? 'Sim/Não' : 'Contagem'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {item.pontos_base} pts
                  </td>
                  <td>
                    <span className={`badge ${item.ativa ? 'badge-active' : 'badge-inactive'}`}>
                      {item.ativa ? 'Ativa' : 'Desativada'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.ativa && (
                      <button
                        type="button"
                        onClick={() => handleDesativar(item.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        🚫 Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {missoes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhuma missão cadastrada.
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
