// =====================================================
// Interface: NacaoRepository
// =====================================================
// Porta do domínio para persistência de nações.
// A implementação concreta (Supabase) fica na camada
// de infraestrutura, respeitando a inversão de dependência.
// =====================================================

import { Nacao, CriarNacaoDTO } from '../entities/Nacao';

export interface NacaoRepository {
  // Buscar todas as nações
  listarTodas(): Promise<Nacao[]>;
  // Buscar uma nação por ID
  buscarPorId(id: string): Promise<Nacao | null>;
  // Criar uma nova nação
  criar(dados: CriarNacaoDTO): Promise<Nacao>;
  // Remover uma nação (hard delete — cascade nas tribos)
  remover(id: string): Promise<void>;
}
