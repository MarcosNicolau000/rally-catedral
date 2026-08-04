-- =====================================================
-- MIGRATION 001: SCHEMA DO SISTEMA RALLY
-- =====================================================
-- Cria todas as tabelas, views e seed inicial
-- Executar no Supabase SQL Editor ou via CLI
-- =====================================================

-- =====================================================
-- TABELA: nacao
-- Representa uma equipe (nação) na competição
-- =====================================================
create table if not exists nacao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

-- =====================================================
-- TABELA: tribo
-- Subequipe pertencente a uma nação (cascade on delete)
-- =====================================================
create table if not exists tribo (
  id uuid primary key default gen_random_uuid(),
  nacao_id uuid not null references nacao(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

-- =====================================================
-- TABELA: usuario_perfil
-- Perfil do usuário vinculado ao auth.users do Supabase
-- =====================================================
create table if not exists usuario_perfil (
  id uuid primary key references auth.users(id) on delete cascade,
  papel text not null check (papel in ('admin', 'lider_tribo')),
  tribo_id uuid references tribo(id) on delete set null,
  criado_em timestamptz not null default now(),
  -- Líder de tribo obrigatoriamente precisa de uma tribo vinculada
  constraint lider_precisa_de_tribo check (
    (papel = 'lider_tribo' and tribo_id is not null) or (papel = 'admin')
  )
);

-- =====================================================
-- TABELA: missao
-- Missão pontuável criada pelo admin (booleana ou contagem)
-- =====================================================
create table if not exists missao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  tipo text not null check (tipo in ('booleana', 'contagem')),
  pontos_base integer not null check (pontos_base >= 0),
  ativa boolean not null default true,
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

-- =====================================================
-- TABELA: snapshot_pontuacao
-- Registro fotográfico das pontuações antes de zerar
-- =====================================================
create table if not exists snapshot_pontuacao (
  id uuid primary key default gen_random_uuid(),
  dados jsonb not null,
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

-- =====================================================
-- TABELA: confronto
-- Disputa entre dois participantes (tribo vs tribo ou nação vs nação)
-- Criada ANTES de lancamento para evitar dependência circular de FK
-- =====================================================
create table if not exists confronto (
  id uuid primary key default gen_random_uuid(),
  nivel text not null check (nivel in ('tribo', 'nacao')),
  participante_a_id uuid not null,
  participante_b_id uuid not null,
  periodo_inicio date not null,
  periodo_fim date not null,
  tipo text not null check (tipo in ('pontuacao_normal', 'missoes_exclusivas')),
  da_bonus boolean not null default false,
  pontos_bonus integer,
  vencedor_id uuid,
  finalizado boolean not null default false,
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now(),
  -- Se da_bonus = true, pontos_bonus é obrigatório
  constraint bonus_precisa_de_pontos check (
    (da_bonus = false) or (da_bonus = true and pontos_bonus is not null)
  )
);

-- =====================================================
-- TABELA: lancamento
-- Registro de pontuação feito por um líder ou pelo sistema (bônus)
-- =====================================================
create table if not exists lancamento (
  id uuid primary key default gen_random_uuid(),
  missao_id uuid not null references missao(id),
  tribo_id uuid not null references tribo(id) on delete cascade,
  quantidade integer not null default 1 check (quantidade >= 0),
  pontos_calculados integer not null,
  origem text not null default 'missao' check (origem in ('missao', 'bonus_confronto')),
  confronto_id uuid references confronto(id),
  removido boolean not null default false,
  snapshot_id uuid references snapshot_pontuacao(id),
  registrado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

-- =====================================================
-- TABELA: missao_confronto
-- Vínculo de missões exclusivas a um confronto
-- =====================================================
create table if not exists missao_confronto (
  id uuid primary key default gen_random_uuid(),
  confronto_id uuid not null references confronto(id) on delete cascade,
  missao_id uuid not null references missao(id)
);

-- =====================================================
-- TABELA: configuracao_sistema (singleton)
-- Configuração global do sistema (uma única linha)
-- =====================================================
create table if not exists configuracao_sistema (
  id boolean primary key default true check (id),
  exibicao_publica_ativa boolean not null default false,
  atualizado_por uuid references usuario_perfil(id),
  atualizado_em timestamptz not null default now()
);

-- Seed: garantir que a linha singleton exista
insert into configuracao_sistema (id, exibicao_publica_ativa)
values (true, false)
on conflict (id) do nothing;

-- =====================================================
-- VIEW: v_pontuacao_tribo
-- Pontuação total agregada por tribo (apenas lançamentos não removidos)
-- =====================================================
create or replace view v_pontuacao_tribo as
select
  t.id as tribo_id,
  t.nacao_id,
  t.nome as tribo_nome,
  coalesce(sum(l.pontos_calculados) filter (where l.removido = false), 0) as pontos_total
from tribo t
left join lancamento l on l.tribo_id = t.id
group by t.id, t.nacao_id, t.nome;

-- =====================================================
-- VIEW: v_pontuacao_nacao
-- Pontuação total agregada por nação (soma das tribos)
-- =====================================================
create or replace view v_pontuacao_nacao as
select
  n.id as nacao_id,
  n.nome as nacao_nome,
  coalesce(sum(vpt.pontos_total), 0) as pontos_total
from nacao n
left join v_pontuacao_tribo vpt on vpt.nacao_id = n.id
group by n.id, n.nome;

-- =====================================================
-- VIEW: v_pontuacao_tribo_semana
-- Pontuação da tribo na semana corrente
-- =====================================================
create or replace view v_pontuacao_tribo_semana as
select
  t.id as tribo_id,
  t.nacao_id,
  t.nome as tribo_nome,
  coalesce(sum(l.pontos_calculados) filter (
    where l.removido = false
    and l.criado_em >= date_trunc('week', now())
  ), 0) as pontos_semana
from tribo t
left join lancamento l on l.tribo_id = t.id
group by t.id, t.nacao_id, t.nome;

-- =====================================================
-- VIEW: v_pontuacao_nacao_semana
-- Pontuação da nação na semana corrente
-- =====================================================
create or replace view v_pontuacao_nacao_semana as
select
  n.id as nacao_id,
  n.nome as nacao_nome,
  coalesce(sum(vpts.pontos_semana), 0) as pontos_semana
from nacao n
left join v_pontuacao_tribo_semana vpts on vpts.nacao_id = n.id
group by n.id, n.nome;
