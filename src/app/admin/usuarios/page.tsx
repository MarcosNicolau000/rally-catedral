'use client';

import { useState, useEffect } from 'react';
import { criarUsuarioAction, removerUsuarioAction } from './actions';
import { ConfirmDialog } from '@/presentation/components/ConfirmDialog';

interface UsuarioItem {
  id: string;
  nome: string | null;
  papel: 'admin' | 'lider_tribo';
  tribo_id: string | null;
  criado_em: string;
}

interface TriboItem {
  id: string;
  nome: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [tribos, setTribos] = useState<TriboItem[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState<'admin' | 'lider_tribo'>('lider_tribo');
  const [triboId, setTriboId] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioItem | null>(null);

  async function carregarDados() {
    const [resU, resT] = await Promise.all([fetch('/api/usuarios'), fetch('/api/tribos')]);
    if (resU.ok) setUsuarios(await resU.json());
    if (resT.ok) {
      const dataT = await resT.json();
      setTribos(dataT);
      if (dataT.length > 0 && !triboId) setTriboId(dataT[0].id);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('papel', papel);
    formData.append('tribo_id', triboId);

    const res = await criarUsuarioAction(formData);

    if (res?.error) {
      setErro(res.error);
    } else {
      setNome('');
      setEmail('');
      setSenha('');
      carregarDados();
    }
    setCarregando(false);
  }

  async function handleConfirmarExclusao() {
    if (!usuarioParaExcluir) return;

    const res = await removerUsuarioAction(usuarioParaExcluir.id);
    if (res?.error) {
      alert(res.error);
    } else {
      carregarDados();
    }
    setUsuarioParaExcluir(null);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Gerenciar Usuários e Líderes</h1>
        <p className="page-subtitle">Cadastre novos administradores e atribua líderes às suas tribos</p>
      </header>

      {/* Formulário de Cadastro */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>👥 Cadastrar Novo Usuário</h3>

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
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email de Acesso</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lider.tribo@exemplo.com"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Senha Inicial</label>
              <input
                type="password"
                className="input-field"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Papel / Perfil</label>
              <select
                className="input-field"
                value={papel}
                onChange={(e) => setPapel(e.target.value as any)}
              >
                <option value="lider_tribo" style={{ background: 'var(--bg-card-solid)' }}>
                  Líder de Tribo
                </option>
                <option value="admin" style={{ background: 'var(--bg-card-solid)' }}>
                  Administrador
                </option>
              </select>
            </div>

            {papel === 'lider_tribo' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tribo Vinculada</label>
                {tribos.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#f87171', marginTop: '0.4rem' }}>
                    ⚠️ Nenhuma tribo cadastrada. Acesse <strong>Admin &gt; Tribos</strong> para cadastrar antes de criar líderes.
                  </div>
                ) : (
                  <select
                    className="input-field"
                    value={triboId}
                    onChange={(e) => setTriboId(e.target.value)}
                    required
                  >
                    <option value="" style={{ background: 'var(--bg-card-solid)' }}>
                      Selecione uma tribo...
                    </option>
                    {tribos.map((t) => (
                      <option key={t.id} value={t.id} style={{ background: 'var(--bg-card-solid)' }}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando || (papel === 'lider_tribo' && !triboId)}
            className="btn btn-primary"
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </button>

        </form>
      </div>

      {/* Lista de Usuários */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 Usuários Cadastrados</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                <th>Tribo Vinculada</th>
                <th>Cadastrado em</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((item) => {
                const tribo = tribos.find((t) => t.id === item.tribo_id);
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.nome || '—'}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.id}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: item.papel === 'admin' ? 'var(--accent-gold-glow)' : 'rgba(99, 102, 241, 0.15)',
                          color: item.papel === 'admin' ? '#fbbf24' : '#818cf8',
                        }}
                      >
                        {item.papel === 'admin' ? '👑 Admin' : '🛡️ Líder de Tribo'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {item.papel === 'lider_tribo' ? tribo?.nome || '—' : 'Global (Todas)'}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setUsuarioParaExcluir(item)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        🗑️ Remover
                      </button>
                    </td>
                  </tr>
                );
              })}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhum usuário cadastrado além do administrador principal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!usuarioParaExcluir}
        titulo="Remover Usuário"
        mensagem={`Tem certeza que deseja remover o acesso de "${usuarioParaExcluir?.nome || usuarioParaExcluir?.id}"? Esta ação revoga o login e não pode ser desfeita. O histórico de pontuação (missões, lançamentos etc.) criado por ele é mantido, apenas o vínculo com o autor é desfeito.`}
        textoExigido={usuarioParaExcluir?.nome || undefined}
        labelConfirmar="Remover Usuário"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setUsuarioParaExcluir(null)}
      />
    </div>
  );
}
