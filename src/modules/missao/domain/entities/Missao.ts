// =====================================================
// Entidade: Missão
// =====================================================
// Representa uma missão pontuável no sistema Rally.
// =====================================================

import { TipoMissao } from '../value-objects/TipoMissao';

export interface Missao {
  // Identificador único da missão
  id: string;
  // Nome da missão
  nome: string;
  // Descrição opcional
  descricao: string | null;
  // Tipo da missão ('booleana' | 'contagem')
  tipo: TipoMissao;
  // Pontos base configurados pelo admin (>= 0)
  pontos_base: number;
  // Flag indicando se a missão está ativa para novos lançamentos
  ativa: boolean;
  // ID do usuário admin que criou a missão
  criado_por: string;
  // Data de criação
  criado_em: string;
}

export interface CriarMissaoDTO {
  nome: string;
  descricao?: string;
  tipo: TipoMissao;
  pontos_base: number;
  criado_por: string;
}
