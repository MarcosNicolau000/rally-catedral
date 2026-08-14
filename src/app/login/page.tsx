'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import Link from 'next/link';

export default function LoginPage() {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [senha, setSenha] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res?.error) {
      setErro(res.error);
      setSenha('');
      setCarregando(false);
    }
  }


  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand-logo" style={{ justifyContent: 'center', fontSize: '2rem' }}>
            ⚡ RALLY
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Acesse o painel do sistema de pontuação
          </p>
        </div>

        {erro && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Senha</label>
            <input
              name="password"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>


          <button
            type="submit"
            disabled={carregando}
            className="btn btn-gold"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            href="/ranking"
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            Ver Ranking Público de Resultados
          </Link>
        </div>
      </div>
    </div>
  );
}
