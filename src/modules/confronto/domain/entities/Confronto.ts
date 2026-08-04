// =====================================================
// Entidade: Confronto
// =====================================================
// Disputa entre 2 participantes (tribo vs tribo ou nação vs nação).
// Regras 21-25 da especificação.
// =====================================================

import { NivelConfronto, TipoConfronto } from '../value-objects/TipoConfronto';

export interface Confronto {
  id: string;
  nivel: NivelConfronto;
  participante_a_id: string;
  participante_b_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  tipo: TipoConfronto;
  da_bonus: boolean;
  pontos_bonus: number | null;
  vencedor_id: string | null;
  finalizado: boolean;
  criado_por: string;
  criado_em: string;
  // IDs de missões exclusivas (se tipo === 'missoes_exclusivas')
  missoes_exclusivas_ids?: string[];
}

export interface CriarConfrontoDTO {
  nivel: NivelConfronto;
  participante_a_id: string;
  participante_b_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  tipo: TipoConfronto;
  da_bonus: boolean;
  pontos_bonus?: number;
  criado_por: string;
  missoes_exclusivas_ids?: string[];
}
