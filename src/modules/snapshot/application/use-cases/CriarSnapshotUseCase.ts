// =====================================================
// Use Case: Criar Snapshot
// =====================================================
// Persiste um snapshot com o estado das pontuações.
// =====================================================

import { SnapshotPontuacao, CriarSnapshotDTO } from '../../domain/entities/SnapshotPontuacao';
import { SnapshotRepository } from '../../domain/repositories/SnapshotRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarSnapshotUseCase {
  constructor(private readonly snapshotRepo: SnapshotRepository) {}

  async execute(dados: CriarSnapshotDTO): Promise<Result<SnapshotPontuacao, DomainError>> {
    const snapshot = await this.snapshotRepo.criar(dados);
    return success(snapshot);
  }
}
