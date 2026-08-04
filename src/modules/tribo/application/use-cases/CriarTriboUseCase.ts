// =====================================================
// Use Case: Criar Tribo
// =====================================================
// Cria uma nova tribo vinculada a uma nação.
// =====================================================

import { Tribo, CriarTriboDTO } from '../../domain/entities/Tribo';
import { TriboRepository } from '../../domain/repositories/TriboRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarTriboUseCase {
  constructor(private readonly triboRepo: TriboRepository) {}

  async execute(dados: CriarTriboDTO): Promise<Result<Tribo, DomainError>> {
    // Validando que a nação foi informada
    if (!dados.nacao_id) {
      return failure(new DomainError('NACAO_OBRIGATORIA', 'A nação é obrigatória para criar uma tribo.'));
    }

    // Validando que o nome não está vazio
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome da tribo é obrigatório.'));
    }

    // Criando a tribo no repositório
    const tribo = await this.triboRepo.criar({
      nacao_id: dados.nacao_id,
      nome: dados.nome.trim(),
    });

    return success(tribo);
  }
}
