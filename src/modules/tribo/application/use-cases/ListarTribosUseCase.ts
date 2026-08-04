// =====================================================
// Use Case: Listar Tribos
// =====================================================
// Retorna todas as tribos ou filtradas por nação.
// =====================================================

import { Tribo } from '../../domain/entities/Tribo';
import { TriboRepository } from '../../domain/repositories/TriboRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ListarTribosUseCase {
  constructor(private readonly triboRepo: TriboRepository) {}

  async execute(nacaoId?: string): Promise<Result<Tribo[], DomainError>> {
    const tribos = nacaoId
      ? await this.triboRepo.listarPorNacao(nacaoId)
      : await this.triboRepo.listarTodas();

    return success(tribos);
  }
}
