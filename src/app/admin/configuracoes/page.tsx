'use client';

import { useState, useEffect } from 'react';
import { alternarExibicaoPublicaAction, zerarPontuacoesAction } from './actions';
import { ConfirmDialog } from '@/presentation/components/ConfirmDialog';

export default function AdminConfiguracoesPage() {
  const [exibicaoPublica, setExibicaoPublica] = useState(false);
  const [carregandoConfig, setCarregandoConfig] = useState(true);

  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // State do Modal de Zerar
  const [modalZerarAberto, setModalZerarAberto] = useState(false);
  const [processandoZerar, setProcessandoZerar] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  async function carregarConfig() {
    setCarregandoConfig(true);
    const res = await fetch('/api/configuracao');
    if (res.ok) {
      const data = await res.json();
      setExibicaoPublica(data.exibicao_publica_ativa);
    }
    setCarregandoConfig(false);
  }

  useEffect(() => {
    carregarConfig();
  }, []);

  async function handleTogglePublico(novoStatus: boolean) {
    setSalvandoConfig(true);
    setExibicaoPublica(novoStatus);
    const res = await alternarExibicaoPublicaAction(novoStatus);
    if (res?.error) {
      alert(res.error);
      setExibicaoPublica(!novoStatus);
    }
    setSalvandoConfig(false);
  }


  async function handleZerarPontuacoes() {
    setProcessandoZerar(true);
    setMensagemSucesso(null);

    const res = await zerarPontuacoesAction();

    if (res?.error) {
      alert(res.error);
    } else {
      setMensagemSucesso(
        `✅ Pontuações zeradas com sucesso! Snapshot gravado (ID: ${res.snapshotId}) e ${res.totalZerados} lançamentos foram arquivados via soft delete.`
      );
    }
    setProcessandoZerar(false);
    setModalZerarAberto(false);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Configurações do Sistema</h1>
        <p className="page-subtitle">Controle de exibição pública e operações de zerar pontuações</p>
      </header>

      {mensagemSucesso && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            fontWeight: 500,
          }}
        >
          {mensagemSucesso}
        </div>
      )}

      {/* Exibição Pública */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌐</span> Painel Público de Resultados
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Quando ativado, os resultados agregados de Nações e Tribos poderão ser consultados por qualquer visitante sem necessidade de login.
        </p>

        {carregandoConfig ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando preferência...</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: salvandoConfig ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={exibicaoPublica}
                disabled={salvandoConfig}
                onChange={(e) => handleTogglePublico(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              {exibicaoPublica ? ' Habilitado (Público pode ver resultados)' : ' Desabilitado (Acesso restrito a usuários)'}
            </label>

            <span className={`badge ${exibicaoPublica ? 'badge-active' : 'badge-inactive'}`}>
              {exibicaoPublica ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        )}
      </div>

      {/* Zerar Pontuações (Ação Crítica com Trava) */}
      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span> Zerar Pontuações da Competição
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Esta ação cria <strong>obrigatoriamente um Snapshot de auditoria</strong> com o estado de todas as pontuações e executa um <strong>soft delete em massa</strong> em todos os lançamentos ativos. Os totais de pontuação retornarão a zero.
        </p>

        <button
          type="button"
          onClick={() => setModalZerarAberto(true)}
          disabled={processandoZerar}
          className="btn btn-danger"
          style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
        >
          🚨 Zerar Todas as Pontuações
        </button>
      </div>

      {/* Modal de Confirmação Exclusiva da Regra 12 */}
      <ConfirmDialog
        isOpen={modalZerarAberto}
        titulo="Zerar Pontuações do Rally"
        mensagem="ATENÇÃO: Você está prestes a zerar o placar de TODAS as tribos e nações! O sistema criará um snapshot de backup e desativará os lançamentos atuais. Digite ZERAR RALLY para confirmar."
        textoExigido="ZERAR RALLY"
        labelConfirmar="Confirmar e Zerar Pontuações"
        onConfirm={handleZerarPontuacoes}
        onCancel={() => setModalZerarAberto(false)}
      />
    </div>
  );
}
