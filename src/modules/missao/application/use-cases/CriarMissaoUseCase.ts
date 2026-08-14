// =====================================================
// Use Case: Criar Missão
// =====================================================
// Valida pontos_base >= 0 e nome não vazio antes de criar.
// =====================================================

import { Missao, CriarMissaoDTO } from '../../domain/entities/Missao';
import { MissaoRepository } from '../../domain/repositories/MissaoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarMissaoUseCase {
  constructor(private readonly missaoRepo: MissaoRepository) {}

  async execute(dados: CriarMissaoDTO): Promise<Result<Missao, DomainError>> {
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome da missão é obrigatório.'));
    }

    if (dados.nome.trim().length > 100) {
      return failure(new DomainError('NOME_MUITO_LONGO', 'O nome da missão não pode ter mais de 100 caracteres.'));
    }


    if (dados.pontos_base < 0) {
      return failure(new DomainError('PONTOS_INVALIDOS', 'Os pontos base da missão devem ser maior ou igual a zero.'));
    }

    if (!['booleana', 'contagem'].includes(dados.tipo)) {
      return failure(new DomainError('TIPO_INVALIDO', 'Tipo de missão inválido (deve ser "booleana" ou "contagem").'));
    }

    const nomeLimpo = dados.nome.trim();

    // Verificando se já existe uma missão cadastrada com este nome (case-insensitive)
    const missoesExistentes = await this.missaoRepo.listarTodas();
    const jaExiste = missoesExistentes.some(
      (m) => m.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (jaExiste) {
      return failure(new DomainError('MISSAO_DUPLICADA', 'Já existe uma missão cadastrada com este nome.'));
    }

    const missao = await this.missaoRepo.criar({
      ...dados,
      nome: nomeLimpo,
    });

    return success(missao);
  }
}

