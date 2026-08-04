// =====================================================
// Use Case: Listar Missões Ativas
// =====================================================
// Retorna apenas missões disponíveis para lançamentos.
// =====================================================

import { Missao } from '../../domain/entities/Missao';
import { MissaoRepository } from '../../domain/repositories/MissaoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ListarMissoesAtivasUseCase {
  constructor(private readonly missaoRepo: MissaoRepository) {}

  async execute(): Promise<Result<Missao[], DomainError>> {
    const missoes = await this.missaoRepo.listarAtivas();
    return success(missoes);
  }
}
