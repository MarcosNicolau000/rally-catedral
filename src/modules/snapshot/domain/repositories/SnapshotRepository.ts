// =====================================================
// Interface: SnapshotRepository
// =====================================================
// Porta do domínio para persistência de snapshots.
// =====================================================

import { SnapshotPontuacao, CriarSnapshotDTO } from '../entities/SnapshotPontuacao';

export interface SnapshotRepository {
  criar(dados: CriarSnapshotDTO): Promise<SnapshotPontuacao>;
  listarTodos(): Promise<SnapshotPontuacao[]>;
  buscarPorId(id: string): Promise<SnapshotPontuacao | null>;
}
