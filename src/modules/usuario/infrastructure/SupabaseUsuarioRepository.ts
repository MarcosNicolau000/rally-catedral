// =====================================================
// Implementação: SupabaseUsuarioRepository
// =====================================================
// Implementação concreta do UsuarioRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/shared/infrastructure/supabase/admin';
import { UsuarioRepository } from '../domain/repositories/UsuarioRepository';
import { Usuario, CriarUsuarioDTO } from '../domain/entities/Usuario';

export class SupabaseUsuarioRepository implements UsuarioRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async obterUsuarioLogado(): Promise<Usuario | null> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: perfil, error: perfilError } = await this.supabase
      .from('usuario_perfil')
      .select('*')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) return null;

    return {
      id: perfil.id,
      nome: perfil.nome,
      papel: perfil.papel,
      tribo_id: perfil.tribo_id,
      email: user.email,
      criado_em: perfil.criado_em,
    };
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data: perfil, error } = await this.supabase
      .from('usuario_perfil')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !perfil) return null;

    return {
      id: perfil.id,
      nome: perfil.nome,
      papel: perfil.papel,
      tribo_id: perfil.tribo_id,
      criado_em: perfil.criado_em,
    };
  }

  async listarTodos(): Promise<Usuario[]> {
    const { data: perfis, error } = await this.supabase
      .from('usuario_perfil')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return perfis.map((p) => ({
      id: p.id,
      nome: p.nome,
      papel: p.papel,
      tribo_id: p.tribo_id,
      criado_em: p.criado_em,
    }));
  }

  async criar(dados: CriarUsuarioDTO): Promise<Usuario> {
    // 1. Criar usuário no Supabase Auth usando a Admin API (Service Role)
    // Isso evita alterar/deslogar a sessão do Admin que está efetuando o cadastro
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: dados.email,
      password: dados.senha,
      email_confirm: true, // Auto-confirma o email para permitir login imediato
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Falha ao registrar autenticação de usuário.');
    }

    const userId = authData.user.id;

    // 2. Inserir perfil na tabela usuario_perfil com suporte a rollback automático
    try {
      const { data: perfil, error: perfilError } = await this.supabase
        .from('usuario_perfil')
        .insert({
          id: userId,
          nome: dados.nome,
          papel: dados.papel,
          tribo_id: dados.tribo_id || null,
        })
        .select()
        .single();

      if (perfilError) {
        throw perfilError;
      }

      return {
        id: perfil.id,
        nome: perfil.nome,
        papel: perfil.papel,
        tribo_id: perfil.tribo_id,
        email: dados.email,
        criado_em: perfil.criado_em,
      };
    } catch (err: unknown) {
      // Rollback de segurança: remove o usuário recém-criado do Supabase Auth para evitar orphan users
      await adminClient.auth.admin.deleteUser(userId);
      const mensagem = err instanceof Error ? err.message : String(err);
      throw new Error(`Falha ao salvar perfil do usuário: ${mensagem}`);
    }
  }


  async vincularATribo(usuarioId: string, triboId: string): Promise<Usuario> {
    const { data: perfil, error } = await this.supabase
      .from('usuario_perfil')
      .update({ tribo_id: triboId })
      .eq('id', usuarioId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: perfil.id,
      nome: perfil.nome,
      papel: perfil.papel,
      tribo_id: perfil.tribo_id,
      criado_em: perfil.criado_em,
    };
  }

  async remover(id: string): Promise<void> {
    // Usa o client admin (service role) para remover o usuário do Auth,
    // o que cascateia automaticamente a remoção de usuario_perfil
    // (FK "id references auth.users(id) on delete cascade").
    // A migration 006 troca as FKs de missao/lancamento/confronto/
    // snapshot_pontuacao para ON DELETE SET NULL, então a remoção
    // funciona mesmo que o usuário já tenha histórico vinculado.
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) throw error;
  }
}
