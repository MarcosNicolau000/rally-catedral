// =====================================================
// Entidade: Usuario
// =====================================================
// Perfil do usuário no sistema vinculado ao Supabase Auth.
// =====================================================

import { PapelUsuario } from '../value-objects/PapelUsuario';

export interface Usuario {
  // ID do usuário (mesmo ID do auth.users)
  id: string;
  // Papel no sistema ('admin' | 'lider_tribo')
  papel: PapelUsuario;
  // ID da tribo vinculada (obrigatório se papel === 'lider_tribo')
  tribo_id: string | null;
  // Email do usuário (obtido do Auth)
  email?: string;
  // Data de criação
  criado_em: string;
}

export interface CriarUsuarioDTO {
  email: string;
  senha: string;
  papel: PapelUsuario;
  tribo_id?: string | null;
}
