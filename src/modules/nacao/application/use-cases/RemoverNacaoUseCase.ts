// =====================================================
// Use Case: Remover Nação
// =====================================================
// Remove uma nação (hard delete). O cascade no banco
// remove automaticamente todas as tribos e lançamentos.
// =====================================================

import { NacaoRepository } from '../../domain/repositories/NacaoRepository';
import { ConfrontoRepository } from '@/modules/confronto/domain/repositories/ConfrontoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverNacaoUseCase {
  constructor(
    private readonly nacaoRepo: NacaoRepository,
    private readonly confrontoRepo?: ConfrontoRepository
  ) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    // Verificando se a nação existe antes de remover
    const nacao = await this.nacaoRepo.buscarPorId(id);

    if (!nacao) {
      return failure(new DomainError('NACAO_NAO_ENCONTRADA', 'Nação não encontrada.'));
    }

    // Se o repositório de confronto for fornecido, previne deleção com confronto em andamento
    if (this.confrontoRepo) {
      const confrontos = await this.confrontoRepo.listarTodos();
      const possuiConfrontoAtivo = confrontos.some(
        (c) =>
          !c.finalizado &&
          c.nivel === 'nacao' &&
          (c.participante_a_id === id || c.participante_b_id === id)
      );

      if (possuiConfrontoAtivo) {
        return failure(
          new DomainError('CONFRONTO_EM_ANDAMENTO', 'Não é possível remover esta nação pois ela está participando de um confronto em andamento.')
        );
      }
    }

    // Removendo a nação (hard delete — cascade remove tribos e lançamentos)
    await this.nacaoRepo.remover(id);

    return success(undefined);
  }
}

