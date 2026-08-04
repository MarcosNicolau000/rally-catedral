'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function criarNacaoAction(formData: FormData) {
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
