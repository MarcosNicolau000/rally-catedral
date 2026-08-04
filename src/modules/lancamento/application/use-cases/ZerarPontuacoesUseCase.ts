// =====================================================
// Use Case: Zerar Pontuações
// =====================================================
// Regras 9, 10, 11, 12:
// 1. Ação restrita a Admin.
// 2. OBRIGATORIAMENTE cria snapshot do estado atual (tribos/nações).
// 3. Executa soft delete em massa nos lançamentos ativos.
// 4. Usa RPC transacional (tudo ou nada) via fn_zerar_pontuacoes.
// =====================================================

import { LancamentoRepository } from '../../domain/repositories/LancamentoRepository';
import { RankingRepository } from '@/modules/ranking/domain/repositories/RankingRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';
import { SupabaseClient } from '@supabase/supabase-js';

export class ZerarPontuacoesUseCase {
  constructor(
    private readonly lancamentoRepo: LancamentoRepository,
    private readonly rankingRepo: RankingRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(adminId: string): Promise<Result<{ snapshotId: string; totalZerados: number }, DomainError>> {
    try {
      // 1. Buscar os rankings atuais para gravar no snapshot
      const rankingTribos = await this.rankingRepo.obterRankingTribos();
      const rankingNacoes = await this.rankingRepo.obterRankingNacoes();

      // 2. Montar objeto do snapshot
      const dadosSnapshot = {
        pontuacao_tribos: rankingTribos.map((t) => ({
          tribo_id: t.tribo_id,
          tribo_nome: t.tribo_nome,
          nacao_id: t.nacao_id,
          pontos_total: t.pontos_total,
        })),
        pontuacao_nacoes: rankingNacoes.map((n) => ({
          nacao_id: n.nacao_id,
          nacao_nome: n.nacao_nome,
          pontos_total: n.pontos_total,
        })),
      };

      // 3. Executar via RPC transacional (tudo ou nada — Regra 11)
      const { data, error } = await this.supabase.rpc('fn_zerar_pontuacoes', {
        p_admin_id: adminId,
        p_dados_snapshot: dadosSnapshot,
      });

      if (error) {
        throw error;
      }

      return success({
        snapshotId: data.snapshot_id,
        totalZerados: data.total_zerados,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao zerar pontuações.';
      return failure(new DomainError('ERRO_ZERAR_PONTUACOES', message));
    }
  }
}
