// =====================================================
// Use Case: Remover Tribo
// =====================================================
// Remove uma tribo (hard delete). Cascade no banco apaga lançamentos.
// =====================================================

import { TriboRepository } from '../../domain/repositories/TriboRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverTriboUseCase {
  constructor(private readonly triboRepo: TriboRepository) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    // Verificando se a tribo existe
    const tribo = await this.triboRepo.buscarPorId(id);

    if (!tribo) {
      return failure(new DomainError('TRIBO_NAO_ENCONTRADA', 'Tribo não encontrada.'));
    }

    // Removendo a tribo
    await this.triboRepo.remover(id);

    return success(undefined);
  }
}
