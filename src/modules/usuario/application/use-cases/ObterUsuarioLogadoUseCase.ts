// =====================================================
// Use Case: Obter Usuário Logado
// =====================================================
// Retorna o perfil do usuário autenticado no sistema.
// =====================================================

import { Usuario } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class ObterUsuarioLogadoUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async execute(): Promise<Result<Usuario, DomainError>> {
    const usuario = await this.usuarioRepo.obterUsuarioLogado();

    if (!usuario) {
      return failure(new DomainError('NAO_AUTENTICADO', 'Usuário não está autenticado.'));
    }

    return success(usuario);
  }
}
