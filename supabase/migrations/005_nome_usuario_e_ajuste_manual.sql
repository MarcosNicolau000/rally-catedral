-- =====================================================
-- MIGRATION 005: NOME DO USUÁRIO + AJUSTE MANUAL DE PONTUAÇÃO
-- =====================================================
-- 1. Adiciona coluna "nome" em usuario_perfil, para exibição
--    amigável no lugar do ID puro (líderes de tribo e admins).
-- 2. Cria uma missão de sistema para servir de FK aos lançamentos
--    de ajuste manual de pontuação feitos pelo admin (mesmo padrão
--    já usado pela migration 003 para bônus de confronto).
-- 3. Libera o valor 'ajuste_manual' no check de origem de lancamento
--    e adiciona coluna "descricao" (motivo do ajuste).
-- =====================================================

-- =====================================================
-- 1. Nome do usuário
-- =====================================================
alter table usuario_perfil add column if not exists nome text;

-- =====================================================
-- 2. Missão de sistema para ajuste manual
-- =====================================================
insert into missao (id, nome, descricao, tipo, pontos_base, ativa, criado_por)
select
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Ajuste Manual de Pontuação (Sistema)',
  'Missão interna do sistema. Usada automaticamente para registrar ajustes manuais de pontuação feitos pelo admin. Não deve ser exibida para líderes.',
  'booleana',
  0,
  false,
  up.id
from usuario_perfil up
where up.papel = 'admin'
limit 1
on conflict (id) do nothing;

-- =====================================================
-- 3. Origem 'ajuste_manual' + motivo do ajuste
-- =====================================================
alter table lancamento drop constraint if exists lancamento_origem_check;
alter table lancamento add constraint lancamento_origem_check
  check (origem in ('missao', 'bonus_confronto', 'ajuste_manual'));

alter table lancamento add column if not exists descricao text;

-- Observação: pontos_calculados já não possui check de não-negatividade em
-- 001_schema.sql, então ajustes manuais negativos (remoção de pontos) já
-- são suportados sem alteração adicional.
