// =====================================================
// Implementação: SupabaseSnapshotRepository
// =====================================================
// Implementação concreta do SnapshotRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { SnapshotRepository } from '../domain/repositories/SnapshotRepository';
import { SnapshotPontuacao, CriarSnapshotDTO } from '../domain/entities/SnapshotPontuacao';

export class SupabaseSnapshotRepository implements SnapshotRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async criar(dados: CriarSnapshotDTO): Promise<SnapshotPontuacao> {
    const { data, error } = await this.supabase
      .from('snapshot_pontuacao')
      .insert({
        dados: dados.dados,
        criado_por: dados.criado_por,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listarTodos(): Promise<SnapshotPontuacao[]> {
    const { data, error } = await this.supabase
      .from('snapshot_pontuacao')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async buscarPorId(id: string): Promise<SnapshotPontuacao | null> {
    const { data, error } = await this.supabase
      .from('snapshot_pontuacao')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }
}
