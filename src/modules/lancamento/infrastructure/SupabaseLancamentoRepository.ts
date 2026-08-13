// =====================================================
// Implementação: SupabaseLancamentoRepository
// =====================================================
// Implementação concreta do LancamentoRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { LancamentoRepository, CriarLancamentoDados } from '../domain/repositories/LancamentoRepository';
import { Lancamento } from '../domain/entities/Lancamento';

export class SupabaseLancamentoRepository implements LancamentoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async criar(dados: CriarLancamentoDados): Promise<Lancamento> {
    const { data, error } = await this.supabase
      .from('lancamento')
      .insert({
        missao_id: dados.missao_id,
        tribo_id: dados.tribo_id,
        quantidade: dados.quantidade,
        pontos_calculados: dados.pontos_calculados,
        origem: dados.origem,
        confronto_id: dados.confronto_id || null,
        descricao: dados.descricao || null,
        removido: false,
        registrado_por: dados.registrado_por,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('lancamento')
      .update({ removido: true })
      .eq('id', id);

    if (error) throw error;
  }

  async zerarTodosComSnapshot(snapshotId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('lancamento')
      .update({ removido: true, snapshot_id: snapshotId })
      .eq('removido', false)
      .select('id');

    if (error) throw error;
    return data?.length ?? 0;
  }

  async buscarPorId(id: string): Promise<Lancamento | null> {
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }

  async listarPorTribo(triboId: string): Promise<Lancamento[]> {
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('*')
      .eq('tribo_id', triboId)
      .eq('removido', false)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async listarTodos(): Promise<Lancamento[]> {
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('*')
      .eq('removido', false)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}
