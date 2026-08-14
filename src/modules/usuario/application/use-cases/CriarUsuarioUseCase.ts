// =====================================================
// Use Case: Criar Usuário (Admin)
// =====================================================
// Admin cria uma conta de usuário (ex: líder de tribo).
// Valida que se o papel for 'lider_tribo', tribo_id é obrigatório.
// =====================================================

import { Usuario, CriarUsuarioDTO } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class CriarUsuarioUseCase {
  constructor(private readonly usuarioRepo: UsuarioRepository) {}

  async execute(dados: CriarUsuarioDTO): Promise<Result<Usuario, DomainError>> {
    // Validando nome
    if (!dados.nome || dados.nome.trim().length === 0) {
      return failure(new DomainError('NOME_OBRIGATORIO', 'O nome do usuário é obrigatório.'));
    }

    // Validando email com expressão regular estrita
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dados.email || !emailRegex.test(dados.email.trim())) {
      return failure(new DomainError('EMAIL_INVALIDO', 'Informe um endereço de email válido (ex: usuario@dominio.com).'));
    }

    // Validando política de senha segura (no mínimo 8 caracteres)
    if (!dados.senha || dados.senha.length < 8) {
      return failure(new DomainError('SENHA_CURTA', 'A senha deve possuir no mínimo 8 caracteres para maior segurança.'));
    }

    // Regra de negócio: líder de tribo OBRIGATORIAMENTE precisa ter tribo_id
    if (dados.papel === 'lider_tribo' && !dados.tribo_id) {
      return failure(new DomainError('TRIBO_OBRIGATORIA_LIDER', 'Um líder de tribo deve ser vinculado a uma tribo.'));
    }


    try {
      const usuario = await this.usuarioRepo.criar({ ...dados, nome: dados.nome.trim() });
      return success(usuario);
    } catch (err: any) {
      return failure(new DomainError('ERRO_CRIAR_USUARIO', err.message || 'Erro ao criar usuário.'));
    }
  }
}
