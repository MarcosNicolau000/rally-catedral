-- =====================================================
-- MIGRATION 008: ÍNDICES DE DESEMPENHO E ALTA CARGA
-- =====================================================
-- Otimização de Performance (NEW-CRIT-02):
-- Cria índices compostos para eliminar Full Table Scans nas
-- tabelas de alto volume (lancamento, tribo, missao_confronto)
-- durante a renderização do Ranking e cálculo de confrontos.
-- =====================================================

-- Índices na tabela de lançamentos
create index if not exists idx_lancamento_tribo_removido
  on lancamento(tribo_id, removido);

create index if not exists idx_lancamento_criado_em
  on lancamento(criado_em);

create index if not exists idx_lancamento_missao
  on lancamento(missao_id);

create index if not exists idx_lancamento_origem_confronto
  on lancamento(origem, confronto_id) where removido = false;


-- Índice na tabela de tribos
create index if not exists idx_tribo_nacao
  on tribo(nacao_id);

-- Índice na tabela de vínculos de confronto
create index if not exists idx_missao_confronto_rel
  on missao_confronto(confronto_id, missao_id);
