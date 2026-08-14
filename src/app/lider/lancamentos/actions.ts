'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAutenticado } from '@/shared/infrastructure/security/authGuard';

export async function registrarLancamentoLiderAction(formData: FormData) {
  // 1. Validar se o usuário está autenticado
  const authCheck = await exigirAutenticado();
  if (!authCheck.ok) {
    return { error: authCheck.error.message };
  }

  const missao_id = formData.get('missao_id') as string;
  const quantidade = parseInt(formData.get('quantidade') as string, 10);
  const valor_booleano = formData.get('valor_booleano') === 'true';

  const user = authCheck.value;
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  // Obter perfil do líder logado para garantir a tribo_id
  const perfilRes = await services.usuario.obterLogado.execute();

  if (!perfilRes.ok || !perfilRes.value.tribo_id) {
    return { error: 'Seu usuário não possui uma tribo associada.' };
  }

  const tribo_id = perfilRes.value.tribo_id;

  const res = await services.lancamento.registrar.execute({
    missao_id,
    tribo_id,
    quantidade: isNaN(quantidade) ? 1 : quantidade,
    valor_booleano,
    registrado_por: user.id,
  });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/lider/lancamentos');
  revalidatePath('/lider/pontuacao');
  revalidatePath('/ranking');

  if (res.value === null) {
    return { success: true, mensagem: 'Missão booleana marcada como Falsa. Nenhum lançamento foi criado.' };
  }

  return { success: true, mensagem: 'Lançamento registrado com sucesso!' };
}

