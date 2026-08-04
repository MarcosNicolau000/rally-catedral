// =====================================================
// Implementação: SupabaseTriboRepository
// =====================================================
// Implementação concreta do TriboRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { TriboRepository } from '../domain/repositories/TriboRepository';
import { Tribo, CriarTriboDTO } from '../domain/entities/Tribo';

export class SupabaseTriboRepository implements TriboRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listarTodas(): Promise<Tribo[]> {
    const { data, error } = await this.supabase
      .from('tribo')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data ?? [];
  }

  async listarPorNacao(nacaoId: string): Promise<Tribo[]> {
    const { data, error } = await this.supabase
      .from('tribo')
      .select('*')
      .eq('nacao_id', nacaoId)
      .order('nome');

    if (error) throw error;
    return data ?? [];
  }

  async buscarPorId(id: string): Promise<Tribo | null> {
    const { data, error } = await this.supabase
      .from('tribo')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }

  async criar(dados: CriarTriboDTO): Promise<Tribo> {
    const { data, error } = await this.supabase
      .from('tribo')
      .insert({
        nacao_id: dados.nacao_id,
        nome: dados.nome,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tribo')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
