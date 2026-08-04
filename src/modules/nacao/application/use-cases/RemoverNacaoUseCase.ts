// =====================================================
// Use Case: Remover Nação
// =====================================================
// Remove uma nação (hard delete). O cascade no banco
// remove automaticamente todas as tribos e lançamentos.
// =====================================================

import { NacaoRepository } from '../../domain/repositories/NacaoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverNacaoUseCase {
  // Recebendo o repositório via injeção de dependência
  constructor(private readonly nacaoRepo: NacaoRepository) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    // Verificando se a nação existe antes de remover
    const nacao = await this.nacaoRepo.buscarPorId(id);

    if (!nacao) {
      return failure(new DomainError('NACAO_NAO_ENCONTRADA', 'Nação não encontrada.'));
    }

    // Removendo a nação (hard delete — cascade remove tribos e lançamentos)
    await this.nacaoRepo.remover(id);

    return success(undefined);
  }
}
