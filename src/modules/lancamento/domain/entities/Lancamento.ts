// =====================================================
// Entidade: Lançamento
// =====================================================
// Registro de pontuação no sistema.
// =====================================================

export type OrigemLancamento = 'missao' | 'bonus_confronto' | 'ajuste_manual';

export interface Lancamento {
  // Identificador único do lançamento
  id: string;
  // ID da missão associada
  missao_id: string;
  // ID da tribo associada
  tribo_id: string;
  // Quantidade informada (1 para booleana verdadeira)
  quantidade: number;
  // Pontos calculados no momento do lançamento
  pontos_calculados: number;
  // Origem ('missao' | 'bonus_confronto' | 'ajuste_manual')
  origem: OrigemLancamento;
  // ID do confronto (se origem === 'bonus_confronto' ou missão vinculada)
  confronto_id?: string | null;
  // Motivo/descrição (usado em ajustes manuais de pontuação)
  descricao?: string | null;
  // Flag de soft delete
  removido: boolean;
  // ID do snapshot se foi zerado em massa
  snapshot_id?: string | null;
  // ID do usuário que registrou (null se o usuário foi removido depois)
  registrado_por: string | null;
  // Data de criação
  criado_em: string;
}

export interface RegistrarLancamentoDTO {
  missao_id: string;
  tribo_id: string;
  quantidade?: number;
  // Para missões booleanas: se false, não cria lançamento
  valor_booleano?: boolean;
  origem?: OrigemLancamento;
  confronto_id?: string;
  registrado_por: string;
}

export interface AjustarPontuacaoManualDTO {
  tribo_id: string;
  // Quantidade de pontos a adicionar (positivo) ou remover (negativo)
  pontos: number;
  // Motivo do ajuste, para fins de auditoria
  motivo?: string;
  registrado_por: string;
}
