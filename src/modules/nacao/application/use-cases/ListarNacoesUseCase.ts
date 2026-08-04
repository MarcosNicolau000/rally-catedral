// =====================================================
// Use Case: Listar Nações
// =====================================================
// Retorna todas as nações cadastradas.
// =====================================================

import { Nacao } from '../../domain/entities/Nacao';
import { NacaoRepository } from '../../domain/repositories/NacaoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ListarNacoesUseCase {
  // Recebendo o repositório via injeção de dependência
  constructor(private readonly nacaoRepo: NacaoRepository) {}

  async execute(): Promise<Result<Nacao[], DomainError>> {
    // Buscando todas as nações
    const nacoes = await this.nacaoRepo.listarTodas();

    return success(nacoes);
  }
}
