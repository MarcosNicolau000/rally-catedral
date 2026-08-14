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

    // Validando que o nome não está vazio e não excede 100 caracteres
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome da tribo é obrigatório.'));
    }

    if (dados.nome.trim().length > 100) {
      return failure(new DomainError('NOME_MUITO_LONGO', 'O nome da tribo não pode ter mais de 100 caracteres.'));
    }


    const nomeLimpo = dados.nome.trim();

    // Verificando se já existe uma tribo cadastrada com este nome na mesma nação
    const tribosExistentes = await this.triboRepo.listarPorNacao(dados.nacao_id);
    const jaExiste = tribosExistentes.some(
      (t) => t.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (jaExiste) {
      return failure(new DomainError('TRIBO_DUPLICADA', 'Já existe uma tribo cadastrada com este nome nesta nação.'));
    }

    // Criando a tribo no repositório
    const tribo = await this.triboRepo.criar({
      nacao_id: dados.nacao_id,
      nome: nomeLimpo,
    });

    return success(tribo);
  }
}

