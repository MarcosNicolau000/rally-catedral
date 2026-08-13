// =====================================================
// Use Case: Remover Usuário (Admin)
// =====================================================
// Remove o acesso de um usuário (líder de tribo ou admin),
// apagando o registro no Auth e, por cascade, seu perfil.
// A remoção é sempre permitida, independentemente de o usuário
// já ter criado missões/confrontos ou registrado lançamentos:
// esses registros de histórico são preservados (a migration 006
// troca as FKs para ON DELETE SET NULL), apenas o vínculo com o
// autor é desfeito.
// =====================================================

import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RemoverUsuarioUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async execute(usuarioAlvoId: string): Promise<Result<void, DomainError>> {
    // 1. Apenas admin pode remover usuários
    const usuarioLogado = await this.usuarioRepo.obterUsuarioLogado();
    if (!usuarioLogado) {
      return failure(new DomainError('NAO_AUTENTICADO', 'Usuário não autenticado.'));
    }

    if (usuarioLogado.papel !== 'admin') {
      return failure(new DomainError('ACESSO_NEGADO', 'Apenas administradores podem remover usuários.'));
    }

    // 2. Não permite que o admin remova a si mesmo
    if (usuarioLogado.id === usuarioAlvoId) {
      return failure(
        new DomainError('AUTO_EXCLUSAO_NEGADA', 'Você não pode remover seu próprio usuário.')
      );
    }

    // 3. Confirma que o usuário alvo existe
    const usuarioAlvo = await this.usuarioRepo.buscarPorId(usuarioAlvoId);
    if (!usuarioAlvo) {
      return failure(new DomainError('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.'));
    }

    // 4. Remove — sempre executa, independentemente de pontuação/histórico vinculado
    try {
      await this.usuarioRepo.remover(usuarioAlvoId);
      return success(undefined);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : String(err);
      return failure(new DomainError('ERRO_REMOCAO', mensagem || 'Erro ao remover usuário.'));
    }
  }
}
