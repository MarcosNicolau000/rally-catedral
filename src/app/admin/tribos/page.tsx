'use client';

import { useState, useEffect } from 'react';
import { criarTriboAction, removerTriboAction } from './actions';
import { ConfirmDialog } from '@/presentation/components/ConfirmDialog';

interface TriboItem {
  id: string;
  nacao_id: string;
  nome: string;
  criado_em: string;
}

interface NacaoItem {
  id: string;
  nome: string;
}

interface UsuarioItem {
  id: string;
  nome: string | null;
  papel: 'admin' | 'lider_tribo';
  tribo_id: string | null;
}

export default function AdminTribosPage() {
  const [tribos, setTribos] = useState<TriboItem[]>([]);
  const [nacoes, setNacoes] = useState<NacaoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [nacaoId, setNacaoId] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [triboParaExcluir, setTriboParaExcluir] = useState<TriboItem | null>(null);

  async function carregarDados() {
    const [resT, resN, resU] = await Promise.all([
      fetch('/api/tribos'),
      fetch('/api/nacoes'),
      fetch('/api/usuarios'),
    ]);
    if (resT.ok) setTribos(await resT.json());
    if (resN.ok) {
      const dataN = await resN.json();
      setNacoes(dataN);
      if (dataN.length > 0 && !nacaoId) setNacaoId(dataN[0].id);
    }
    if (resU.ok) setUsuarios(await resU.json());
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('nacao_id', nacaoId);
    formData.append('nome', nome);

    const res = await criarTriboAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else {
      setNome('');
      carregarDados();
    }
    setCarregando(false);
  }

  async function handleConfirmarExclusao() {
    if (!triboParaExcluir) return;

    const res = await removerTriboAction(triboParaExcluir.id);
    if (res?.error) {
      alert(res.error);
    } else {
      carregarDados();
    }
    setTriboParaExcluir(null);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Gerenciar Tribos</h1>
        <p className="page-subtitle">Cadastre e gerencie as tribos pertencentes às nações</p>
      </header>

      {/* Formulário de Cadastro */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>➕ Cadastrar Nova Tribo</h3>

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

        <form onSubmit={handleCriar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '220px', marginBottom: 0 }}>
            <label className="form-label">Nação Pertencente</label>
            <select
              className="input-field"
              value={nacaoId}
              onChange={(e) => setNacaoId(e.target.value)}
              required
            >
              {nacoes.map((n) => (
                <option key={n.id} value={n.id} style={{ background: 'var(--bg-card-solid)' }}>
                  {n.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Nome da Tribo</label>
            <input
              type="text"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Tribo de Benjamim"
              required
            />
          </div>

          <button type="submit" disabled={carregando} className="btn btn-primary">
            {carregando ? 'Salvando...' : 'Salvar Tribo'}
          </button>
        </form>
      </div>

      {/* Tabela de Tribos */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Tribos Cadastradas</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome da Tribo</th>
                <th>Nação</th>
                <th>Líder</th>
                <th>Criado em</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tribos.map((item) => {
                const nacao = nacoes.find((n) => n.id === item.nacao_id);
                const lider = usuarios.find(
                  (u) => u.papel === 'lider_tribo' && u.tribo_id === item.id
                );
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.nome}</td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>
                      {nacao?.nome || '—'}
                    </td>
                    <td>
                      {lider ? (
                        lider.nome || <span style={{ color: 'var(--text-muted)' }}>Sem nome cadastrado</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sem líder vinculado</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setTriboParaExcluir(item)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        🗑️ Exclusão Real
                      </button>
                    </td>
                  </tr>
                );
              })}

              {tribos.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhuma tribo cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!triboParaExcluir}
        titulo="Excluir Tribo Permanentemente"
        mensagem={`Tem certeza que deseja excluir a tribo "${triboParaExcluir?.nome}"? Esta ação removerá a tribo e seus lançamentos do histórico de pontuação.`}
        textoExigido={triboParaExcluir?.nome}
        labelConfirmar="Excluir Tribo"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setTriboParaExcluir(null)}
      />
    </div>
  );
}
