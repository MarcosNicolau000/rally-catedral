// =====================================================
// Entidade: SnapshotPontuacao
// =====================================================
// Registro fotográfico do estado de pontuações antes de zerar.
// =====================================================

export interface DadosSnapshot {
  pontuacao_tribos: Array<{
    tribo_id: string;
    tribo_nome: string;
    nacao_id: string;
    pontos_total: number;
  }>;
  pontuacao_nacoes: Array<{
    nacao_id: string;
    nacao_nome: string;
    pontos_total: number;
  }>;
}

export interface SnapshotPontuacao {
  id: string;
  dados: DadosSnapshot;
  criado_por: string;
  criado_em: string;
}

export interface CriarSnapshotDTO {
  dados: DadosSnapshot;
  criado_por: string;
}
