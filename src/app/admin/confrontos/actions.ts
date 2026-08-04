'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { NivelConfronto, TipoConfronto } from '@/modules/confronto/domain/value-objects/TipoConfronto';

export async function criarConfrontoAction(formData: FormData) {
  const nivel = formData.get('nivel') as NivelConfronto;
  const participante_a_id = formData.get('participante_a_id') as string;
  const participante_b_id = formData.get('participante_b_id') as string;
  const periodo_inicio = formData.get('periodo_inicio') as string;
  const periodo_fim = formData.get('periodo_fim') as string;
  const tipo = formData.get('tipo') as TipoConfronto;
  const da_bonus = formData.get('da_bonus') === 'true';
  const pontos_bonus = parseInt(formData.get('pontos_bonus') as string, 10);
  const missoes_exclusivas_ids = formData.getAll('missoes_exclusivas_ids') as string[];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const services = makeAppServices(supabase);

  const res = await services.confronto.criar.execute({
    nivel,
    participante_a_id,
    participante_b_id,
    periodo_inicio,
    periodo_fim,
    tipo,
    da_bonus,
    pontos_bonus: isNaN(pontos_bonus) ? undefined : pontos_bonus,
    criado_por: user.id,
    missoes_exclusivas_ids,
  });

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/confrontos');
  return { success: true };
}

// Assinatura atualizada: vencedor agora é calculado automaticamente pelo use case
export async function fecharConfrontoAction(confrontoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Usuário não autenticado.' };

  const services = makeAppServices(supabase);

  // Executa o use case que agora calcula o vencedor automaticamente
  const res = await services.confronto.fechar.execute(
    confrontoId,
    user.id
  );

  if (!res.ok) {
    return { error: res.error.message };
  }

  revalidatePath('/admin/confrontos');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/lancamentos');
  return {
    success: true,
    vencedorId: res.value.vencedorId,
    pontosA: res.value.pontosA,
    pontosB: res.value.pontosB,
    empate: res.value.empate,
  };
}
