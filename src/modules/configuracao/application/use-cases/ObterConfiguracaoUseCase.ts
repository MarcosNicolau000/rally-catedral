// =====================================================
// Use Case: Obter Configuração
// =====================================================
// Retorna as configurações atuantis do sistema.
// =====================================================

import { ConfiguracaoSistema } from '../../domain/entities/ConfiguracaoSistema';
import { ConfiguracaoRepository } from '../../domain/repositories/ConfiguracaoRepository';
import { Result, success } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ObterConfiguracaoUseCase {
  constructor(private readonly configRepo: ConfiguracaoRepository) {}

  async execute(): Promise<Result<ConfiguracaoSistema | null, DomainError>> {
    const config = await this.configRepo.obter();
    return success(config);
  }
}
