-- =====================================================
-- MIGRATION 009: HARDENING DE CHAVE ESTRANGEIRA DE MISSÃO
-- =====================================================
-- Prevenção de Erro 500 no Banco (NEW-HIGH-02):
-- Troca a constraint de FK lancamento.missao_id para ON DELETE SET NULL,
-- impedindo exceção não tratada de violação de chave estrangeira caso
-- uma missão com histórico seja fisicamente removida.
-- =====================================================

alter table lancamento alter column missao_id drop not null;
alter table lancamento drop constraint if exists lancamento_missao_id_fkey;
alter table lancamento
  add constraint lancamento_missao_id_fkey
  foreign key (missao_id) references missao(id) on delete set null;
