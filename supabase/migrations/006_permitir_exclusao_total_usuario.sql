-- =====================================================
-- MIGRATION 006: PERMITIR EXCLUSÃO TOTAL DE USUÁRIO
-- =====================================================
-- Hoje, remover um usuário de usuario_perfil (via cascade da
-- exclusão em auth.users) falha com violação de foreign key
-- sempre que esse usuário criou missões/confrontos/snapshots
-- ou registrou lançamentos, pois essas FKs são RESTRICT por
-- padrão.
--
-- Esta migration troca essas FKs para ON DELETE SET NULL,
-- permitindo excluir o usuário livremente. O HISTÓRICO DE
-- PONTUAÇÃO É PRESERVADO INTEGRALMENTE (missões, lançamentos,
-- confrontos e snapshots continuam existindo e contando
-- normalmente) — apenas o campo que indica "quem criou/
-- registrou" passa a ficar nulo (usuário removido).
-- =====================================================

-- ===================
-- missao.criado_por
-- ===================
alter table missao alter column criado_por drop not null;
alter table missao drop constraint if exists missao_criado_por_fkey;
alter table missao
  add constraint missao_criado_por_fkey
  foreign key (criado_por) references usuario_perfil(id) on delete set null;

-- ===============================
-- snapshot_pontuacao.criado_por
-- ===============================
alter table snapshot_pontuacao alter column criado_por drop not null;
alter table snapshot_pontuacao drop constraint if exists snapshot_pontuacao_criado_por_fkey;
alter table snapshot_pontuacao
  add constraint snapshot_pontuacao_criado_por_fkey
  foreign key (criado_por) references usuario_perfil(id) on delete set null;

-- =====================
-- confronto.criado_por
-- =====================
alter table confronto alter column criado_por drop not null;
alter table confronto drop constraint if exists confronto_criado_por_fkey;
alter table confronto
  add constraint confronto_criado_por_fkey
  foreign key (criado_por) references usuario_perfil(id) on delete set null;

-- ==========================
-- lancamento.registrado_por
-- ==========================
alter table lancamento alter column registrado_por drop not null;
alter table lancamento drop constraint if exists lancamento_registrado_por_fkey;
alter table lancamento
  add constraint lancamento_registrado_por_fkey
  foreign key (registrado_por) references usuario_perfil(id) on delete set null;

-- ==================================
-- configuracao_sistema.atualizado_por
-- ==================================
-- Já era nullable, mas a FK ainda estava como RESTRICT.
alter table configuracao_sistema drop constraint if exists configuracao_sistema_atualizado_por_fkey;
alter table configuracao_sistema
  add constraint configuracao_sistema_atualizado_por_fkey
  foreign key (atualizado_por) references usuario_perfil(id) on delete set null;
