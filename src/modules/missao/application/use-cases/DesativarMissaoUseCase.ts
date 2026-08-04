// =====================================================
// Use Case: Desativar Missão
// =====================================================
// Marca a missão como inativa (ativa = false).
// Não afeta lançamentos já realizados.
// =====================================================

import { MissaoRepository } from '../../domain/repositories/MissaoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class DesativarMissaoUseCase {
  constructor(private readonly missaoRepo: MissaoRepository) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    const missao = await this.missaoRepo.buscarPorId(id);

    if (!missao) {
      return failure(new DomainError('MISSAO_NAO_ENCONTRADA', 'Missão não encontrada.'));
    }

    await this.missaoRepo.desativar(id);
    return success(undefined);
  }
}
