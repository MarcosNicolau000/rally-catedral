// =====================================================
// Interface: MissaoRepository
// =====================================================
// Porta do domínio para gestão de missões.
// =====================================================

import { Missao, CriarMissaoDTO } from '../entities/Missao';

export interface MissaoRepository {
  // Listar todas as missões (incluindo inativas para histórico admin)
  listarTodas(): Promise<Missao[]>;
  // Listar apenas missões ativas (para líderes criarem lançamentos)
  listarAtivas(): Promise<Missao[]>;
  // Buscar missão por ID
  buscarPorId(id: string): Promise<Missao | null>;
  // Criar nova missão
  criar(dados: CriarMissaoDTO): Promise<Missao>;
  // Desativar missão (soft disable: ativa = false)
  desativar(id: string): Promise<void>;
  // Ativar missão
  ativar(id: string): Promise<void>;
}
