// =====================================================
// Use Case: Fechar/Finalizar Confronto
// =====================================================
// Regra 22: Calcula AUTOMATICAMENTE o vencedor com base no tipo:
//   - pontuacao_normal: soma pontos do período
//   - missoes_exclusivas: soma pontos das missões vinculadas
// Regra 24: Se da_bonus = true, gera lançamento automático
//   de bônus ('bonus_confronto') para o vencedor.
// Regra 3/4: Para nível nação, o bônus vai para a primeira
//   tribo da nação vencedora (pois lancamento exige tribo_id).
// =====================================================

import { ConfrontoRepository } from '../../domain/repositories/ConfrontoRepository';
import { LancamentoRepository } from '@/modules/lancamento/domain/repositories/LancamentoRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

// ID fixo da missão de sistema "Bônus de Confronto" (criada na migration 003)
const MISSAO_BONUS_SISTEMA_ID = '00000000-0000-0000-0000-000000000001';

export interface FecharConfrontoResult {
  vencedorId: string | null;
  pontosA: number;
  pontosB: number;
  empate: boolean;
}

export class FecharConfrontoUseCase {
  constructor(
    private readonly confrontoRepo: ConfrontoRepository,
    private readonly lancamentoRepo: LancamentoRepository
  ) {}

  async execute(
    confrontoId: string,
    adminId: string
  ): Promise<Result<FecharConfrontoResult, DomainError>> {
    // 1. Buscar o confronto
    const confronto = await this.confrontoRepo.buscarPorId(confrontoId);

    if (!confronto) {
      return failure(new DomainError('CONFRONTO_NAO_ENCONTRADO', 'Confronto não encontrado.'));
    }

    if (confronto.finalizado) {
      return failure(new DomainError('CONFRONTO_JA_FINALIZADO', 'Este confronto já está finalizado.'));
    }

    // 2. Calcular pontuação de cada participante conforme o tipo do confronto
    let pontosA = 0;
    let pontosB = 0;

    if (confronto.tipo === 'pontuacao_normal') {
      // Regra 22a: Comparar pontuação normal do período
      if (confronto.nivel === 'tribo') {
        pontosA = await this.confrontoRepo.calcularPontosTriboPeriodo(
          confronto.participante_a_id, confronto.periodo_inicio, confronto.periodo_fim
        );
        pontosB = await this.confrontoRepo.calcularPontosTriboPeriodo(
          confronto.participante_b_id, confronto.periodo_inicio, confronto.periodo_fim
        );
      } else {
        // nivel === 'nacao': somar pontos de todas as tribos da nação
        pontosA = await this.confrontoRepo.calcularPontosNacaoPeriodo(
          confronto.participante_a_id, confronto.periodo_inicio, confronto.periodo_fim
        );
        pontosB = await this.confrontoRepo.calcularPontosNacaoPeriodo(
          confronto.participante_b_id, confronto.periodo_inicio, confronto.periodo_fim
        );
      }
    } else {
      // tipo === 'missoes_exclusivas'
      // Regra 22b: Comparar pontuação apenas das missões vinculadas ao confronto
      if (confronto.nivel === 'tribo') {
        pontosA = await this.confrontoRepo.calcularPontosMissoesExclusivasTribo(
          confronto.id, confronto.participante_a_id
        );
        pontosB = await this.confrontoRepo.calcularPontosMissoesExclusivasTribo(
          confronto.id, confronto.participante_b_id
        );
      } else {
        // nivel === 'nacao': somar missões exclusivas de todas as tribos da nação
        pontosA = await this.confrontoRepo.calcularPontosMissoesExclusivasNacao(
          confronto.id, confronto.participante_a_id
        );
        pontosB = await this.confrontoRepo.calcularPontosMissoesExclusivasNacao(
          confronto.id, confronto.participante_b_id
        );
      }
    }

    // 3. Definir o vencedor de forma imparcial (se empate, não há vencedor único)
    const empate = pontosA === pontosB;
    const vencedorId = empate
      ? null
      : pontosA > pontosB
      ? confronto.participante_a_id
      : confronto.participante_b_id;

    // 4. Marcar o confronto como finalizado (registra o vencedor ou null em caso de empate)
    await this.confrontoRepo.finalizar(confrontoId, vencedorId);

    // 5. Regra 24: Se da_bonus = true e HOUVER um vencedor definido (sem empate)
    if (!empate && vencedorId && confronto.da_bonus && confronto.pontos_bonus && confronto.pontos_bonus > 0) {
      if (confronto.nivel === 'tribo') {
        // No nível tribo, o vencedorId já é o tribo_id
        await this.lancamentoRepo.criar({
          missao_id: MISSAO_BONUS_SISTEMA_ID,
          tribo_id: vencedorId,
          quantidade: 1,
          pontos_calculados: confronto.pontos_bonus,
          origem: 'bonus_confronto',
          confronto_id: confronto.id,
          registrado_por: adminId,
        });
      } else {
        // No nível nação, dividir o bônus igualitariamente entre todas as tribos da nação vencedora
        const triboIds = await this.confrontoRepo.buscarTribosNacao(vencedorId);
        if (triboIds.length === 0) {
          return failure(new DomainError(
            'NACAO_SEM_TRIBOS',
            'A nação vencedora não possui tribos cadastradas para receber o bônus.'
          ));
        }

        const pontosPorTribo = Math.floor(confronto.pontos_bonus / triboIds.length);
        if (pontosPorTribo > 0) {
          for (const triboId of triboIds) {
            await this.lancamentoRepo.criar({
              missao_id: MISSAO_BONUS_SISTEMA_ID,
              tribo_id: triboId,
              quantidade: 1,
              pontos_calculados: pontosPorTribo,
              origem: 'bonus_confronto',
              confronto_id: confronto.id,
              registrado_por: adminId,
            });
          }
        }
      }
    }

    return success({
      vencedorId,
      pontosA,
      pontosB,
      empate,
    });
  }
}

