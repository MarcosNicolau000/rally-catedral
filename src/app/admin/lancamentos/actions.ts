'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function removerLancamentoAction(id: string) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.lancamento.remover.execute(id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/lancamentos');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function ajustarPontuacaoManualAction(formData: FormData) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const tribo_id = formData.get('tribo_id') as string;
  const pontosRaw = formData.get('pontos') as string;
  const motivo = formData.get('motivo') as string;

  const user = authCheck.value;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const pontos = parseInt(pontosRaw, 10);

  const res = await services.lancamento.ajustarManual.execute({
    tribo_id,
    pontos,
    motivo,
    registrado_por: user.id,
  });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/lancamentos');
  revalidatePath('/admin/dashboard');
  revalidatePath('/ranking');
  return { success: true };
}

