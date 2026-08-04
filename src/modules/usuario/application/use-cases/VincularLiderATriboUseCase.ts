// =====================================================
// Use Case: Vincular Líder a Tribo
// =====================================================
// Altera a tribo vinculada a um usuário com papel 'lider_tribo'.
// =====================================================

import { Usuario } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class VincularLiderATriboUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async execute(usuarioId: string, triboId: string): Promise<Result<Usuario, DomainError>> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);

    if (!usuario) {
      return failure(new DomainError('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.'));
    }

    if (usuario.papel !== 'lider_tribo') {
      return failure(new DomainError('APENAS_LIDER', 'Apenas líderes de tribo podem ser vinculados a uma tribo.'));
    }

    const usuarioAtualizado = await this.usuarioRepo.vincularATribo(usuarioId, triboId);
    return success(usuarioAtualizado);
  }
}
