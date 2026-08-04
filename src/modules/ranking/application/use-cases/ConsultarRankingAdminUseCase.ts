// =====================================================
// Use Case: Consultar Ranking Admin
// =====================================================
// Retorna ranking completo (geral e semanal) para painel admin.
// =====================================================

import { RankingCompleto, RankingRepository } from '../../domain/repositories/RankingRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ConsultarRankingAdminUseCase {
  constructor(private readonly rankingRepo: RankingRepository) {}

  async execute(): Promise<Result<RankingCompleto, DomainError>> {
    const ranking = await this.rankingRepo.obterRankingCompleto();
    return success(ranking);
  }
}
