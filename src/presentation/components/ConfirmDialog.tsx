'use client';

// =====================================================
// Componente: ConfirmDialog (Modal de Confirmação Crítica)
// =====================================================
// Exige confirmação explícita digitando um texto específico
// (ex: "ZERAR PONTUACOES" ou o nome do item) antes de prosseguir.
// =====================================================

import { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  textoExigido?: string; // Se fornecido, o usuário PRECISA digitar este texto para habilitar o botão
  labelConfirmar?: string;
  carregando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  titulo,
  mensagem,
  textoExigido,
  labelConfirmar = 'Confirmar Exclusão',
  carregando = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputVal, setInputVal] = useState('');

  // Fecha o modal ao pressionar a tecla ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !carregando) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, carregando, onCancel]);

  if (!isOpen) return null;

  // Comparação case-insensitive e desconsiderando espaços nas pontas
  const isConfirmedAllowed =
    !textoExigido || inputVal.trim().toLowerCase() === textoExigido.trim().toLowerCase();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--accent-danger)' }}>
          ⚠️ {titulo}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          {mensagem}
        </p>

        {textoExigido && (
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Digite <strong style={{ color: '#fff' }}>{textoExigido}</strong> para confirmar:
            </label>
            <input
              type="text"
              className="input-field"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={textoExigido}
              disabled={carregando}
              autoFocus
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" onClick={onCancel} disabled={carregando} className="btn btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (isConfirmedAllowed && !carregando) {
                onConfirm();
                setInputVal('');
              }
            }}
            disabled={!isConfirmedAllowed || carregando}
            className="btn btn-danger"
            style={{
              opacity: isConfirmedAllowed && !carregando ? 1 : 0.4,
              cursor: isConfirmedAllowed && !carregando ? 'pointer' : 'not-allowed',
            }}
          >
            {carregando ? '⏳ Processando...' : labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

