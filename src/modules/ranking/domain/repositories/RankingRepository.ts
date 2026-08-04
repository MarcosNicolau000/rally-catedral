// =====================================================
// Interfaces e Tipos para o Módulo Ranking
// =====================================================
// Read-model agregado para visualização de classificações.
// =====================================================

export interface RankingTribo {
  tribo_id: string;
  nacao_id: string;
  tribo_nome: string;
  pontos_total: number;
  pontos_semana?: number;
}

export interface RankingNacao {
  nacao_id: string;
  nacao_nome: string;
  pontos_total: number;
  pontos_semana?: number;
}

export interface RankingCompleto {
  nacoes: RankingNacao[];
  tribos: RankingTribo[];
}

export interface RankingRepository {
  obterRankingTribos(): Promise<RankingTribo[]>;
  obterRankingNacoes(): Promise<RankingNacao[]>;
  obterRankingTribosSemana(): Promise<RankingTribo[]>;
  obterRankingNacoesSemana(): Promise<RankingNacao[]>;
  obterRankingCompleto(): Promise<RankingCompleto>;
}
