'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function removerLancamentoAction(id: string) {
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
