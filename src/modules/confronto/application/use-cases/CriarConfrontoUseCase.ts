// =====================================================
// Use Case: Criar Confronto
// =====================================================
// Valida:
// 1. Participante A != Participante B
// 2. Se da_bonus = true, pontos_bonus > 0 é obrigatório
// 3. Se tipo = 'missoes_exclusivas', pelo menos uma missão informada
// =====================================================

import { Confronto, CriarConfrontoDTO } from '../../domain/entities/Confronto';
import { ConfrontoRepository } from '../../domain/repositories/ConfrontoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarConfrontoUseCase {
  constructor(private readonly confrontoRepo: ConfrontoRepository) {}

  async execute(dados: CriarConfrontoDTO): Promise<Result<Confronto, DomainError>> {
    if (dados.participante_a_id === dados.participante_b_id) {
      return failure(new DomainError('PARTICIPANTES_IGUAIS', 'Os dois participantes do confronto devem ser diferentes.'));
    }

    if (new Date(dados.periodo_fim) < new Date(dados.periodo_inicio)) {
      return failure(new DomainError('PERIODO_INVALIDO', 'A data de término do confronto não pode ser anterior à data de início.'));
    }

    if (dados.da_bonus && (!dados.pontos_bonus || dados.pontos_bonus <= 0)) {
      return failure(new DomainError('BONUS_INVALIDO', 'Se o confronto dá bônus, os pontos de bônus devem ser maiores que zero.'));
    }


    if (dados.tipo === 'missoes_exclusivas' && (!dados.missoes_exclusivas_ids || dados.missoes_exclusivas_ids.length === 0)) {
      return failure(new DomainError('MISSOES_EXCLUSIVAS_OBRIGATORIAS', 'Para confrontos com missões exclusivas, selecione ao menos uma missão.'));
    }

    const confronto = await this.confrontoRepo.criar(dados);

    if (dados.tipo === 'missoes_exclusivas' && dados.missoes_exclusivas_ids && dados.missoes_exclusivas_ids.length > 0) {
      await this.confrontoRepo.vincularMissoesExclusivas(confronto.id, dados.missoes_exclusivas_ids);
    }

    return success(confronto);
  }
}
