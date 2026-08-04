// =====================================================
// Implementação: SupabaseMissaoRepository
// =====================================================
// Implementação concreta do MissaoRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { MissaoRepository } from '../domain/repositories/MissaoRepository';
import { Missao, CriarMissaoDTO } from '../domain/entities/Missao';

export class SupabaseMissaoRepository implements MissaoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listarTodas(): Promise<Missao[]> {
    const { data, error } = await this.supabase
      .from('missao')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async listarAtivas(): Promise<Missao[]> {
    const { data, error } = await this.supabase
      .from('missao')
      .select('*')
      .eq('ativa', true)
      .order('nome');

    if (error) throw error;
    return data ?? [];
  }

  async buscarPorId(id: string): Promise<Missao | null> {
    const { data, error } = await this.supabase
      .from('missao')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }

  async criar(dados: CriarMissaoDTO): Promise<Missao> {
    const { data, error } = await this.supabase
      .from('missao')
      .insert({
        nome: dados.nome,
        descricao: dados.descricao || null,
        tipo: dados.tipo,
        pontos_base: dados.pontos_base,
        ativa: true,
        criado_por: dados.criado_por,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async desativar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('missao')
      .update({ ativa: false })
      .eq('id', id);

    if (error) throw error;
  }

  async ativar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('missao')
      .update({ ativa: true })
      .eq('id', id);

    if (error) throw error;
  }
}
