-- =====================================================
-- MIGRATION 010: ORDENAÇÃO DE DESEMPATE NAS VIEWS DE RANKING
-- =====================================================
-- Estabilidade de Exibição (NEW-MED-01):
-- Adiciona ordenação secundária por nome (ASC) para evitar
-- oscilação aleatória na posição de tribos/nações com a mesma pontuação.
-- =====================================================

-- VIEW: v_pontuacao_tribo
create or replace view v_pontuacao_tribo as
select
  t.id as tribo_id,
  t.nacao_id,
  t.nome as tribo_nome,
  coalesce(sum(l.pontos_calculados) filter (where l.removido = false), 0) as pontos_total
from tribo t
left join lancamento l on l.tribo_id = t.id
group by t.id, t.nacao_id, t.nome
order by pontos_total desc, t.nome asc;

-- VIEW: v_pontuacao_nacao
create or replace view v_pontuacao_nacao as
select
  n.id as nacao_id,
  n.nome as nacao_nome,
  coalesce(sum(vpt.pontos_total), 0) as pontos_total
from nacao n
left join v_pontuacao_tribo vpt on vpt.nacao_id = n.id
group by n.id, n.nome
order by pontos_total desc, n.nome asc;

-- VIEW: v_pontuacao_tribo_semana
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
group by t.id, t.nacao_id, t.nome
order by pontos_semana desc, t.nome asc;

-- VIEW: v_pontuacao_nacao_semana
create or replace view v_pontuacao_nacao_semana as
select
  n.id as nacao_id,
  n.nome as nacao_nome,
  coalesce(sum(vpts.pontos_semana), 0) as pontos_semana
from nacao n
left join v_pontuacao_tribo_semana vpts on vpts.nacao_id = n.id
group by n.id, n.nome
order by pontos_semana desc, n.nome asc;
