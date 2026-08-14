-- =====================================================
-- MIGRATION 012: GARANTIA DE EXISTÊNCIA DAS MISSÕES DE SISTEMA
-- =====================================================
-- Prevenção de Erro de FK (B3-CRIT-02):
-- Assegura a presença das missões de sistema id '...0001' (Bônus)
-- e id '...0002' (Ajuste Manual) independentemente do seed.
-- =====================================================

insert into missao (id, nome, descricao, tipo, pontos_base, ativa, criado_por)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Bônus de Confronto (Sistema)',
  'Missão interna do sistema usada para lançamentos automáticos de bônus.',
  'booleana',
  0,
  false,
  up.id
from usuario_perfil up
where up.papel = 'admin'
limit 1
on conflict (id) do nothing;

insert into missao (id, nome, descricao, tipo, pontos_base, ativa, criado_por)
select
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Ajuste Manual de Pontuação (Sistema)',
  'Missão interna do sistema usada para lançamentos de ajustes manuais.',
  'booleana',
  0,
  false,
  up.id
from usuario_perfil up
where up.papel = 'admin'
limit 1
on conflict (id) do nothing;
