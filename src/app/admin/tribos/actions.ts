'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function criarTriboAction(formData: FormData) {
  const nacao_id = formData.get('nacao_id') as string;
  const nome = formData.get('nome') as string;

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.tribo.criar.execute({ nacao_id, nome });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/tribos');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function removerTriboAction(id: string) {
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.tribo.remover.execute(id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/tribos');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
