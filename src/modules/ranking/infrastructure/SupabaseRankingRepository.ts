// =====================================================
// Implementação: SupabaseRankingRepository
// =====================================================
// Lê diretamente das views SQL agregadas no Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { RankingRepository, RankingTribo, RankingNacao, RankingCompleto } from '../domain/repositories/RankingRepository';

export class SupabaseRankingRepository implements RankingRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async obterRankingTribos(): Promise<RankingTribo[]> {
    const { data, error } = await this.supabase
      .from('v_pontuacao_tribo')
      .select('*')
      .order('pontos_total', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async obterRankingNacoes(): Promise<RankingNacao[]> {
    const { data, error } = await this.supabase
      .from('v_pontuacao_nacao')
      .select('*')
      .order('pontos_total', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async obterRankingTribosSemana(): Promise<RankingTribo[]> {
    const { data, error } = await this.supabase
      .from('v_pontuacao_tribo_semana')
      .select('*')
      .order('pontos_semana', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async obterRankingNacoesSemana(): Promise<RankingNacao[]> {
    const { data, error } = await this.supabase
      .from('v_pontuacao_nacao_semana')
      .select('*')
      .order('pontos_semana', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async obterRankingCompleto(): Promise<RankingCompleto> {
    const [nacoes, tribos, nacoesSemana, tribosSemana] = await Promise.all([
      this.obterRankingNacoes(),
      this.obterRankingTribos(),
      this.obterRankingNacoesSemana(),
      this.obterRankingTribosSemana(),
    ]);

    // Cruzar dados da semana com o total
    const nacoesCompletas = nacoes.map((n) => ({
      ...n,
      pontos_semana: nacoesSemana.find((ns) => ns.nacao_id === n.nacao_id)?.pontos_semana ?? 0,
    }));

    const tribosCompletas = tribos.map((t) => ({
      ...t,
      pontos_semana: tribosSemana.find((ts) => ts.tribo_id === t.tribo_id)?.pontos_semana ?? 0,
    }));

    return {
      nacoes: nacoesCompletas,
      tribos: tribosCompletas,
    };
  }
}
