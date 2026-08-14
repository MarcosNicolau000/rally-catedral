'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { TipoMissao } from '@/modules/missao/domain/value-objects/TipoMissao';
import { exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function criarMissaoAction(formData: FormData) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const nome = formData.get('nome') as string;
  const descricao = formData.get('descricao') as string;
  const tipo = formData.get('tipo') as TipoMissao;
  const pontos_base = parseInt(formData.get('pontos_base') as string, 10);

  const user = authCheck.value;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.missao.criar.execute({
    nome,
    descricao,
    tipo,
    pontos_base: isNaN(pontos_base) ? 0 : pontos_base,
    criado_por: user.id,
  });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/missoes');
  return { success: true };
}

export async function desativarMissaoAction(id: string) {
  // 1. Validar se o usuário logado é Administrador
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  const res = await services.missao.desativar.execute(id);

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/missoes');
  return { success: true };
}

