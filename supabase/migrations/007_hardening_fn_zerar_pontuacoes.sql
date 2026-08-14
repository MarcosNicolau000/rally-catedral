-- =====================================================
-- MIGRATION 007: HARDENING DA FUNÇÃO DE ZERAR PONTUAÇÕES
-- =====================================================
-- Regra de Segurança (CRIT-03):
-- A função PL/pgSQL fn_zerar_pontuacoes é SECURITY DEFINER.
-- Esta migration injeta uma verificação estrita para garantir
-- que o p_admin_id realmente corresponda a um usuário com papel 'admin'.
-- =====================================================

create or replace function fn_zerar_pontuacoes(
  p_admin_id uuid,
  p_dados_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_snapshot_id uuid;
  v_total_zerados integer;
  v_eh_admin boolean;
begin
  -- 1. HARDENING DE SEGURANÇA: Verificar se o solicitante é realmente admin
  select exists (
    select 1 from usuario_perfil
    where id = p_admin_id and papel = 'admin'
  ) into v_eh_admin;

  if not v_eh_admin then
    raise exception 'ACESSO_NEGADO: Apenas administradores podem zerar pontuações no sistema.';
  end if;

  -- 2. Criar o registro de snapshot com os dados agregados
  insert into snapshot_pontuacao (dados, criado_por)
  values (p_dados_snapshot, p_admin_id)
  returning id into v_snapshot_id;

  -- 3. Soft delete em massa: marcar todos os lançamentos ativos como removidos
  update lancamento
  set removido = true, snapshot_id = v_snapshot_id
  where removido = false;

  -- 4. Contar quantos foram afetados
  get diagnostics v_total_zerados = row_count;

  -- 5. Retornar resultado como JSON
  return jsonb_build_object(
    'snapshot_id', v_snapshot_id,
    'total_zerados', v_total_zerados
  );
end;
$$;
