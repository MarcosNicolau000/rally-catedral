// =====================================================
// Entidade: ConfiguracaoSistema (Singleton)
// =====================================================
// Configuração global do sistema (linha única com id=true).
// =====================================================

export interface ConfiguracaoSistema {
  id: boolean; // Sempre true
  exibicao_publica_ativa: boolean;
  atualizado_por: string | null;
  atualizado_em: string;
}
