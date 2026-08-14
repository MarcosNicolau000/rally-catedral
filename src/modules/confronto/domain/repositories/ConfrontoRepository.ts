// =====================================================
// Interface: ConfrontoRepository
// =====================================================
// Porta do domínio para gestão de confrontos.
// Inclui métodos de cálculo automático de pontuação
// para definição do vencedor (Regra 22).
// =====================================================

import { Confronto, CriarConfrontoDTO } from '../entities/Confronto';

// Resultado de pontuação de um participante em um confronto
export interface PontuacaoParticipante {
  participante_id: string;
  pontos: number;
}

export interface ConfrontoRepository {
  // CRUD básico
  criar(dados: CriarConfrontoDTO): Promise<Confronto>;
  buscarPorId(id: string): Promise<Confronto | null>;
  listarTodos(): Promise<Confronto[]>;
  finalizar(confrontoId: string, vencedorId: string | null): Promise<void>;

  // Missões exclusivas
  vincularMissoesExclusivas(confrontoId: string, missoesIds: string[]): Promise<void>;
  obterMissoesExclusivas(confrontoId: string): Promise<string[]>;

  // Cálculo de pontuação por período (Regra 22 — pontuacao_normal)
  // Soma dos lançamentos normais (não removidos) de uma tribo no período
  calcularPontosTriboPeriodo(triboId: string, inicio: string, fim: string): Promise<number>;
  // Soma dos lançamentos normais de todas as tribos de uma nação no período
  calcularPontosNacaoPeriodo(nacaoId: string, inicio: string, fim: string): Promise<number>;

  // Cálculo de pontuação por missões exclusivas (Regra 22 — missoes_exclusivas)
  // Soma dos lançamentos vinculados às missões exclusivas do confronto para uma tribo
  calcularPontosMissoesExclusivasTribo(confrontoId: string, triboId: string): Promise<number>;
  // Soma dos lançamentos vinculados às missões exclusivas do confronto para uma nação
  calcularPontosMissoesExclusivasNacao(confrontoId: string, nacaoId: string): Promise<number>;

  // Buscar todas as tribos de uma nação (para distribuição de bônus justa em confronto nível nação)
  buscarTribosNacao(nacaoId: string): Promise<string[]>;
  buscarPrimeiraTriboNacao(nacaoId: string): Promise<string | null>;
}

