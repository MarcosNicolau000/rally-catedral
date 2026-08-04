-- =====================================================
-- MIGRATION 004: FUNÇÃO TRANSACIONAL PARA ZERAR PONTUAÇÕES
-- =====================================================
-- Regra 11: "Zerar" deve ser transacional (tudo ou nada).
-- Esta função cria o snapshot e executa o soft delete em massa
-- dentro de uma única transação PostgreSQL.
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
begin
  -- 1. Criar o registro de snapshot com os dados agregados
  insert into snapshot_pontuacao (dados, criado_por)
  values (p_dados_snapshot, p_admin_id)
  returning id into v_snapshot_id;

  -- 2. Soft delete em massa: marcar todos os lançamentos ativos como removidos
  update lancamento
  set removido = true, snapshot_id = v_snapshot_id
  where removido = false;

  -- 3. Contar quantos foram afetados
  get diagnostics v_total_zerados = row_count;

  -- 4. Retornar resultado como JSON
  return jsonb_build_object(
    'snapshot_id', v_snapshot_id,
    'total_zerados', v_total_zerados
  );
end;
$$;
