-- =====================================================
-- MIGRATION 011: RESILIÊNCIA NA EXCLUSÃO DE TRIBO COM LÍDER
-- =====================================================
-- Prevenção de Erro no Banco (B3-CRIT-01):
-- Quando uma tribo é excluída (hard delete), o banco tenta executar
-- SET NULL em usuario_perfil.tribo_id, o que violava a constraint
-- lider_precisa_de_tribo (papel = 'lider_tribo' and tribo_id is not null).
-- Esta migration cria uma trigger BEFORE DELETE em tribo que remove
-- os perfis de líderes vinculados à tribo antes de apagá-la.
-- =====================================================

create or replace function fn_limpar_lideres_antes_de_excluir_tribo()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Exclui os perfis de líderes vinculados a esta tribo
  -- A FK usuario_perfil.id references auth.users(id) on delete cascade
  -- cuida do expurgo automático
  delete from usuario_perfil
  where tribo_id = OLD.id and papel = 'lider_tribo';

  return OLD;
end;
$$;

drop trigger if exists trg_limpar_lideres_tribo on tribo;
create trigger trg_limpar_lideres_tribo
  before delete on tribo
  for each row
  execute function fn_limpar_lideres_antes_de_excluir_tribo();
