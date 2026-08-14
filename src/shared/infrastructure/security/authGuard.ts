// =====================================================
// Guardião de Autenticação e Autorização (Security Helper)
// =====================================================
// Garante que Server Actions e rotas protegidas validem
// a sessão e o papel do usuário no servidor antes da execução.
// =====================================================

import { createClient } from '@/shared/infrastructure/supabase/server';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export interface UsuarioAutenticado {
  id: string;
  email?: string;
  papel: 'admin' | 'lider_tribo';
  tribo_id?: string | null;
}

// =====================================================
// EXIGIR AUTENTICAÇÃO (Qualquer usuário logado)
// =====================================================
export async function exigirAutenticado(): Promise<Result<UsuarioAutenticado, DomainError>> {
  // Inicializando cliente Supabase do servidor
  const supabase = await createClient();

  // Validando token JWT de autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return failure(new DomainError('NAO_AUTENTICADO', 'Usuário não autenticado.'));
  }

  // Buscando papel e tribo no perfil do usuário
  const { data: perfil, error: perfilError } = await supabase
    .from('usuario_perfil')
    .select('papel, tribo_id')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) {
    return failure(new DomainError('PERFIL_NAO_ENCONTRADO', 'Perfil de usuário não encontrado.'));
  }

  return success({
    id: user.id,
    email: user.email,
    papel: perfil.papel as 'admin' | 'lider_tribo',
    tribo_id: perfil.tribo_id,
  });
}

// =====================================================
// EXIGIR ADMIN (Apenas administradores)
// =====================================================
export async function exigirAdmin(): Promise<Result<UsuarioAutenticado, DomainError>> {
  // Executa validação de autenticação prévia
  const authRes = await exigirAutenticado();

  if (!authRes.ok) {
    return authRes;
  }

  // Checa se o papel é estritamente 'admin'
  if (authRes.value.papel !== 'admin') {
    return failure(
      new DomainError('ACESSO_NEGADO', 'Acesso negado. Apenas administradores podem realizar esta operação.')
    );
  }

  return authRes;
}
