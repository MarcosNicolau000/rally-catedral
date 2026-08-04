-- =====================================================
-- MIGRATION 003: MISSÃO DE SISTEMA PARA BÔNUS DE CONFRONTO
-- =====================================================
-- Cria uma missão especial "de sistema" que será vinculada
-- automaticamente aos lançamentos de bônus de confronto.
-- Regra 24: O sistema gera lançamento automático de bônus.
-- =====================================================

-- Missão de sistema (ativa = false para não aparecer na lista de missões disponíveis para líderes)
-- Usada internamente apenas para satisfazer a FK lancamento.missao_id
-- quando origem = 'bonus_confronto'
insert into missao (id, nome, descricao, tipo, pontos_base, ativa, criado_por)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Bônus de Confronto (Sistema)',
  'Missão interna do sistema. Usada automaticamente para registrar bônus de confrontos. Não deve ser exibida para líderes.',
  'booleana',
  0,
  false,
  up.id
from usuario_perfil up
where up.papel = 'admin'
limit 1
on conflict (id) do nothing;
