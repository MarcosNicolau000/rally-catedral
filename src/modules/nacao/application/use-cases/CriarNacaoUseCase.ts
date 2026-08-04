// =====================================================
// Use Case: Criar Nação
// =====================================================
// Cria uma nova nação na competição Rally.
// Valida que o nome não está vazio.
// =====================================================

import { Nacao, CriarNacaoDTO } from '../../domain/entities/Nacao';
import { NacaoRepository } from '../../domain/repositories/NacaoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarNacaoUseCase {
  // Recebendo o repositório via injeção de dependência
  constructor(private readonly nacaoRepo: NacaoRepository) {}

  async execute(dados: CriarNacaoDTO): Promise<Result<Nacao, DomainError>> {
    // Validando que o nome não está vazio
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome da nação é obrigatório.'));
    }

    // Criando a nação no repositório
    const nacao = await this.nacaoRepo.criar({
      nome: dados.nome.trim(),
    });

    return success(nacao);
  }
}
