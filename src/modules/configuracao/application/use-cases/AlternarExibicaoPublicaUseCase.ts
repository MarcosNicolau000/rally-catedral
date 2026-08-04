// =====================================================
// Use Case: Alternar Exibição Pública
// =====================================================
// Regra 17: Liga/desliga exibicao_publica_ativa (apenas admin).
// =====================================================

import { ConfiguracaoSistema } from '../../domain/entities/ConfiguracaoSistema';
import { ConfiguracaoRepository } from '../../domain/repositories/ConfiguracaoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class AlternarExibicaoPublicaUseCase {
  constructor(private readonly configRepo: ConfiguracaoRepository) {}

  async execute(ativa: boolean, adminId: string): Promise<Result<ConfiguracaoSistema, DomainError>> {
    const configAtualizada = await this.configRepo.atualizarExibicaoPublica(ativa, adminId);
    return success(configAtualizada);
  }
}
