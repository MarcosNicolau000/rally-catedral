// =====================================================
// Interface: TriboRepository
// =====================================================
// Porta do domínio para persistência de tribos.
// =====================================================

import { Tribo, CriarTriboDTO } from '../entities/Tribo';

export interface TriboRepository {
  // Buscar todas as tribos
  listarTodas(): Promise<Tribo[]>;
  // Buscar tribos por nação
  listarPorNacao(nacaoId: string): Promise<Tribo[]>;
  // Buscar uma tribo por ID
  buscarPorId(id: string): Promise<Tribo | null>;
  // Criar uma nova tribo
  criar(dados: CriarTriboDTO): Promise<Tribo>;
  // Remover uma tribo (hard delete — cascade nos lançamentos)
  remover(id: string): Promise<void>;
}
