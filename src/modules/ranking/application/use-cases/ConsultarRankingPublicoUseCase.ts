// =====================================================
// Use Case: Consultar Ranking Público
// =====================================================
// Regras 17, 18, 19, 20:
// 1. Verifica se exibicao_publica_ativa === true na configuração.
// 2. Se inativa, retorna erro tipado informando que a exibição pública está desativada.
// 3. Se ativa, retorna apenas os totais agregados (nações, tribos, semanal), SEM vazamento de dados individuais.
// =====================================================

import { RankingCompleto, RankingRepository } from '../../domain/repositories/RankingRepository';
import { ConfiguracaoRepository } from '@/modules/configuracao/domain/repositories/ConfiguracaoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ConsultarRankingPublicoUseCase {
  constructor(
    private readonly rankingRepo: RankingRepository,
    private readonly configRepo: ConfiguracaoRepository
  ) {}

  async execute(): Promise<Result<RankingCompleto, DomainError>> {
    // 1. Verificar se a exibição pública está ativada no sistema
    const config = await this.configRepo.obter();

    if (!config || !config.exibicao_publica_ativa) {
      return failure(
        new DomainError(
          'EXIBICAO_PUBLICA_DESATIVADA',
          'A exibição pública de resultados está temporariamente desativada pelo administrador.'
        )
      );
    }

    // 2. Buscar ranking agregado (views v_pontuacao_nacao e v_pontuacao_tribo)
    const ranking = await this.rankingRepo.obterRankingCompleto();

    return success(ranking);
  }
}
