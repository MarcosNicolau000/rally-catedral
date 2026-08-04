// =====================================================
// Entidade: Nação
// =====================================================
// Representa uma equipe (nação) na competição Rally.
// A pontuação da nação é sempre a soma das suas tribos.
// =====================================================

export interface Nacao {
  // Identificador único da nação
  id: string;
  // Nome da nação
  nome: string;
  // Data de criação
  criado_em: string;
}

// Dados necessários para criar uma nova nação
export interface CriarNacaoDTO {
  nome: string;
}
