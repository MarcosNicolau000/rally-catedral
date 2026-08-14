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
    // Validando que o nome não está vazio e não excede 100 caracteres
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome da nação é obrigatório.'));
    }

    if (dados.nome.trim().length > 100) {
      return failure(new DomainError('NOME_MUITO_LONGO', 'O nome da nação não pode ter mais de 100 caracteres.'));
    }


    const nomeLimpo = dados.nome.trim();

    // Verificando se já existe uma nação cadastrada com este nome (case-insensitive)
    const nacoesExistentes = await this.nacaoRepo.listarTodas();
    const jaExiste = nacoesExistentes.some(
      (n) => n.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (jaExiste) {
      return failure(new DomainError('NACAO_DUPLICADA', 'Já existe uma nação cadastrada com este nome.'));
    }

    // Criando a nação no repositório
    const nacao = await this.nacaoRepo.criar({
      nome: nomeLimpo,
    });

    return success(nacao);
  }
}

