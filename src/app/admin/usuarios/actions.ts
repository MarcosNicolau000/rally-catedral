'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { PapelUsuario } from '@/modules/usuario/domain/value-objects/PapelUsuario';

export async function criarUsuarioAction(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;
  const papel = formData.get('papel') as PapelUsuario;
  const tribo_id = formData.get('tribo_id') as string;

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.usuario.criar.execute({
    email,
    senha,
    papel,
    tribo_id: papel === 'lider_tribo' ? tribo_id : null,
  });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/usuarios');
  return { success: true };
}
