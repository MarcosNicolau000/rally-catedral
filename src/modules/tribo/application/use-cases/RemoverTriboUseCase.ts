// =====================================================
// Use Case: Remover Tribo
// =====================================================
// Remove uma tribo (hard delete). Cascade no banco apaga lançamentos.
// =====================================================

import { TriboRepository } from '../../domain/repositories/TriboRepository';
import { ConfrontoRepository } from '@/modules/confronto/domain/repositories/ConfrontoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverTriboUseCase {
  constructor(
    private readonly triboRepo: TriboRepository,
    private readonly confrontoRepo?: ConfrontoRepository
  ) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    // Verificando se a tribo existe
    const tribo = await this.triboRepo.buscarPorId(id);

    if (!tribo) {
      return failure(new DomainError('TRIBO_NAO_ENCONTRADA', 'Tribo não encontrada.'));
    }

    // Se o repositório de confronto for fornecido, previne deleção com confronto em andamento
    if (this.confrontoRepo) {
      const confrontos = await this.confrontoRepo.listarTodos();
      const possuiConfrontoAtivo = confrontos.some(
        (c) =>
          !c.finalizado &&
          c.nivel === 'tribo' &&
          (c.participante_a_id === id || c.participante_b_id === id)
      );

      if (possuiConfrontoAtivo) {
        return failure(
          new DomainError('CONFRONTO_EM_ANDAMENTO', 'Não é possível remover esta tribo pois ela está participando de um confronto em andamento.')
        );
      }
    }

    // Removendo a tribo
    await this.triboRepo.remover(id);

    return success(undefined);
  }
}

