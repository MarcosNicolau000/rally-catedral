// =====================================================
// Use Case: Listar Lançamentos
// =====================================================
// Listagem de lançamentos (por tribo para líderes ou tudo para admin).
// =====================================================

import { Lancamento } from '../../domain/entities/Lancamento';
import { LancamentoRepository } from '../../domain/repositories/LancamentoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ListarLancamentosUseCase {
  constructor(private readonly lancamentoRepo: LancamentoRepository) {}

  async execute(triboId?: string): Promise<Result<Lancamento[], DomainError>> {
    const lancamentos = triboId
      ? await this.lancamentoRepo.listarPorTribo(triboId)
      : await this.lancamentoRepo.listarTodos();

    return success(lancamentos);
  }
}
