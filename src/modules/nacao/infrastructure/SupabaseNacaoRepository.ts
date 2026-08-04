// =====================================================
// Implementação: SupabaseNacaoRepository
// =====================================================
// Implementação concreta do NacaoRepository usando
// o client Supabase. Camada de infraestrutura.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { NacaoRepository } from '../domain/repositories/NacaoRepository';
import { Nacao, CriarNacaoDTO } from '../domain/entities/Nacao';

export class SupabaseNacaoRepository implements NacaoRepository {
  // Recebendo o client Supabase via construtor
  constructor(private readonly supabase: SupabaseClient) {}

  // Buscar todas as nações ordenadas por nome
  async listarTodas(): Promise<Nacao[]> {
    const { data, error } = await this.supabase
      .from('nacao')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data ?? [];
  }

  // Buscar uma nação específica por ID
  async buscarPorId(id: string): Promise<Nacao | null> {
    const { data, error } = await this.supabase
      .from('nacao')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }

  // Criar uma nova nação
  async criar(dados: CriarNacaoDTO): Promise<Nacao> {
    const { data, error } = await this.supabase
      .from('nacao')
      .insert({ nome: dados.nome })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remover uma nação (hard delete)
  async remover(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('nacao')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
