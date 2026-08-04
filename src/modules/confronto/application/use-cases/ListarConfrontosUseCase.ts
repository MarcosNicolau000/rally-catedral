// =====================================================
// Use Case: Listar Confrontos
// =====================================================
// Retorna a lista de todos os confrontos cadastrados.
// =====================================================

import { Confronto } from '../../domain/entities/Confronto';
import { ConfrontoRepository } from '../../domain/repositories/ConfrontoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ListarConfrontosUseCase {
  constructor(private readonly confrontoRepo: ConfrontoRepository) {}

  async execute(): Promise<Result<Confronto[], DomainError>> {
    const confrontos = await this.confrontoRepo.listarTodos();
    return success(confrontos);
  }
}
