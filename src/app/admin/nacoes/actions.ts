'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function criarNacaoAction(formData: FormData) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const nome = formData.get('nome') as string;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.nacao.criar.execute({ nome });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/nacoes');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function removerNacaoAction(id: string) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.nacao.remover.execute(id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/nacoes');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

