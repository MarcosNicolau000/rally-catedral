'use client';

import { useState, useEffect } from 'react';
import { criarNacaoAction, removerNacaoAction } from './actions';
import { ConfirmDialog } from '@/presentation/components/ConfirmDialog';

interface NacaoItem {
  id: string;
  nome: string;
  criado_em: string;
}

export default function AdminNacoesPage() {
  const [nacoes, setNacoes] = useState<NacaoItem[]>([]);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Modal de Exclusão
  const [nacaoParaExcluir, setNacaoParaExcluir] = useState<NacaoItem | null>(null);

  async function carregarNacoes() {
    // Fetch simples via cliente
    const res = await fetch('/api/nacoes');
    if (res.ok) {
      const data = await res.json();
      setNacoes(data);
    }
  }

  useEffect(() => {
    carregarNacoes();
  }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('nome', nome);

    const res = await criarNacaoAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else {
      setNome('');
      carregarNacoes();
    }
    setCarregando(false);
  }

  async function handleConfirmarExclusao() {
    if (!nacaoParaExcluir) return;

    const res = await removerNacaoAction(nacaoParaExcluir.id);
    if (res?.error) {
      alert(res.error);
    } else {
      carregarNacoes();
    }
    setNacaoParaExcluir(null);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Gerenciar Nações</h1>
        <p className="page-subtitle">Cadastre e remova as nações participantes da competição</p>
      </header>

      {/* Formulário de Cadastro */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>➕ Cadastrar Nova Nação</h3>

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
          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Nome da Nação</label>
            <input
              type="text"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nação de Judá"
              required
            />
          </div>
          <button type="submit" disabled={carregando} className="btn btn-primary">
            {carregando ? 'Salvando...' : 'Salvar Nação'}
          </button>
        </form>
      </div>

      {/* Tabela de Nações */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Nações Cadastradas</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Criado em</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {nacoes.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setNacaoParaExcluir(item)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {nacoes.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhuma nação cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação Obrigatório pela Regra 16 */}
      <ConfirmDialog
        isOpen={!!nacaoParaExcluir}
        titulo="Excluir Nação Permanentemente"
        mensagem={`Tem certeza que deseja excluir a nação "${nacaoParaExcluir?.nome}"? ATENÇÃO: Esta ação é uma exclusão REAL (hard delete) e apagará em cascata todas as tribos e lançamentos associados a ela!`}
        textoExigido={nacaoParaExcluir?.nome}
        labelConfirmar="Excluir Nação e Tribos"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setNacaoParaExcluir(null)}
      />
    </div>
  );
}
