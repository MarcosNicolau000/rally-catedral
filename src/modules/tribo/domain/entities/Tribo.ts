// =====================================================
// Entidade: Tribo
// =====================================================
// Representa uma subequipe (tribo) pertencente a uma nação.
// A pontuação da tribo é a soma de seus lançamentos ativos.
// =====================================================

export interface Tribo {
  // Identificador único da tribo
  id: string;
  // ID da nação à qual a tribo pertence
  nacao_id: string;
  // Nome da tribo
  nome: string;
  // Data de criação
  criado_em: string;
}

// Dados necessários para criar uma nova tribo
export interface CriarTriboDTO {
  nacao_id: string;
  nome: string;
}
