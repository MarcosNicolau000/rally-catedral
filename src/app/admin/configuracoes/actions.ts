'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function alternarExibicaoPublicaAction(ativa: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

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
