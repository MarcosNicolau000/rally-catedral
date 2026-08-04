// =====================================================
// Use Case: Remover Lançamento (Soft Delete)
// =====================================================
// Ação restrita a Admin. Executa soft delete (removido = true).
// =====================================================

import { LancamentoRepository } from '../../domain/repositories/LancamentoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverLancamentoUseCase {
  constructor(private readonly lancamentoRepo: LancamentoRepository) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    const lancamento = await this.lancamentoRepo.buscarPorId(id);

    if (!lancamento) {
      return failure(new DomainError('LANCAMENTO_NAO_ENCONTRADO', 'Lançamento não encontrado.'));
    }

    if (lancamento.removido) {
      return failure(new DomainError('JA_REMOVIDO', 'Este lançamento já foi removido.'));
    }

    await this.lancamentoRepo.remover(id);
    return success(undefined);
  }
}
