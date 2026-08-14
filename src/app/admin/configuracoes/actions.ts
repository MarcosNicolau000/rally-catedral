'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function alternarExibicaoPublicaAction(ativa: boolean) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const user = authCheck.value;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.configuracao.alternarPublico.execute(ativa, user.id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/configuracoes');
  revalidatePath('/ranking');
  return { success: true };
}

export async function zerarPontuacoesAction() {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const user = authCheck.value;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  // Executa use case de zerar pontuações (grava snapshot e executa soft delete)
  const res = await services.lancamento.zerar.execute(user.id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/lancamentos');
  revalidatePath('/ranking');
  return { success: true, snapshotId: res.value.snapshotId, totalZerados: res.value.totalZerados };
}

