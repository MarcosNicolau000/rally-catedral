// =====================================================
// Interface: UsuarioRepository
// =====================================================
// Porta do domínio para persistência e gestão de usuários.
// =====================================================

import { Usuario, CriarUsuarioDTO } from '../entities/Usuario';

export interface UsuarioRepository {
  // Obter o usuário logado via token de sessão
  obterUsuarioLogado(): Promise<Usuario | null>;
  // Buscar perfil por ID
  buscarPorId(id: string): Promise<Usuario | null>;
  // Listar todos os usuários
  listarTodos(): Promise<Usuario[]>;
  // Criar novo usuário (Auth + Perfil)
  criar(dados: CriarUsuarioDTO): Promise<Usuario>;
  // Vincular líder a uma tribo
  vincularATribo(usuarioId: string, triboId: string): Promise<Usuario>;
  // Remover usuário
  remover(id: string): Promise<void>;
}
