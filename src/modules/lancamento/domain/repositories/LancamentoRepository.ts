// =====================================================
// Interface: LancamentoRepository
// =====================================================
// Porta do domínio para gestão de lançamentos.
// =====================================================

import { Lancamento } from '../entities/Lancamento';

export interface CriarLancamentoDados {
  missao_id: string;
  tribo_id: string;
  quantidade: number;
  pontos_calculados: number;
  origem: 'missao' | 'bonus_confronto';
  confronto_id?: string | null;
  registrado_por: string;
}

export interface LancamentoRepository {
  // Criar um lançamento de pontuação
  criar(dados: CriarLancamentoDados): Promise<Lancamento>;
  // Soft delete de um lançamento específico
  remover(id: string): Promise<void>;
  // Soft delete em massa vinculado a um snapshot_id
  zerarTodosComSnapshot(snapshotId: string): Promise<number>;
  // Buscar lançamento por ID
  buscarPorId(id: string): Promise<Lancamento | null>;
  // Listar lançamentos ativos por tribo
  listarPorTribo(triboId: string): Promise<Lancamento[]>;
  // Listar todos os lançamentos ativos (para admin)
  listarTodos(): Promise<Lancamento[]>;
}
