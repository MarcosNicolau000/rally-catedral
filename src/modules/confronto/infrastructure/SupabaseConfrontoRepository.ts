// =====================================================
// Implementação: SupabaseConfrontoRepository
// =====================================================
// Implementação concreta do ConfrontoRepository usando Supabase.
// Inclui métodos de cálculo automático de pontuação
// para definição do vencedor (Regra 22).
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { ConfrontoRepository } from '../domain/repositories/ConfrontoRepository';
import { Confronto, CriarConfrontoDTO } from '../domain/entities/Confronto';

export class SupabaseConfrontoRepository implements ConfrontoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async criar(dados: CriarConfrontoDTO): Promise<Confronto> {
    const { data, error } = await this.supabase
      .from('confronto')
      .insert({
        nivel: dados.nivel,
        participante_a_id: dados.participante_a_id,
        participante_b_id: dados.participante_b_id,
        periodo_inicio: dados.periodo_inicio,
        periodo_fim: dados.periodo_fim,
        tipo: dados.tipo,
        da_bonus: dados.da_bonus,
        pontos_bonus: dados.da_bonus ? dados.pontos_bonus : null,
        criado_por: dados.criado_por,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async buscarPorId(id: string): Promise<Confronto | null> {
    const { data, error } = await this.supabase
      .from('confronto')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Buscar missões exclusivas vinculadas se houver
    const missoesExclusivas = await this.obterMissoesExclusivas(id);

    return {
      ...data,
      missoes_exclusivas_ids: missoesExclusivas,
    };
  }

  async listarTodos(): Promise<Confronto[]> {
    const { data, error } = await this.supabase
      .from('confronto')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async finalizar(confrontoId: string, vencedorId: string | null): Promise<void> {
    const { error } = await this.supabase
      .from('confronto')
      .update({
        finalizado: true,
        vencedor_id: vencedorId,
      })
      .eq('id', confrontoId);

    if (error) throw error;
  }


  async vincularMissoesExclusivas(confrontoId: string, missoesIds: string[]): Promise<void> {
    const inserts = missoesIds.map((missaoId) => ({
      confronto_id: confrontoId,
      missao_id: missaoId,
    }));

    const { error } = await this.supabase
      .from('missao_confronto')
      .insert(inserts);

    if (error) throw error;
  }

  async obterMissoesExclusivas(confrontoId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('missao_confronto')
      .select('missao_id')
      .eq('confronto_id', confrontoId);

    if (error) throw error;
    return data?.map((row) => row.missao_id) ?? [];
  }

  // =====================================================
  // Cálculo de pontuação por período (pontuacao_normal)
  // =====================================================

  // Soma dos lançamentos normais (não removidos) de uma tribo no período do confronto
  async calcularPontosTriboPeriodo(triboId: string, inicio: string, fim: string): Promise<number> {
    const inicioIso = inicio.includes('T') ? inicio : `${inicio}T00:00:00.000Z`;
    const fimIso = fim.includes('T') ? fim : `${fim}T23:59:59.999Z`;

    const { data, error } = await this.supabase
      .from('lancamento')
      .select('pontos_calculados')
      .eq('tribo_id', triboId)
      .eq('removido', false)
      .eq('origem', 'missao')
      .gte('criado_em', inicioIso)
      .lte('criado_em', fimIso);

    if (error) throw error;
    // Somatória manual dos pontos calculados no período
    return (data ?? []).reduce((acc, row) => acc + (row.pontos_calculados || 0), 0);
  }

  // Soma dos lançamentos normais de todas as tribos de uma nação no período
  async calcularPontosNacaoPeriodo(nacaoId: string, inicio: string, fim: string): Promise<number> {
    // 1. Buscar todas as tribos da nação
    const { data: tribos, error: erroTribos } = await this.supabase
      .from('tribo')
      .select('id')
      .eq('nacao_id', nacaoId);

    if (erroTribos) throw erroTribos;
    if (!tribos || tribos.length === 0) return 0;

    const inicioIso = inicio.includes('T') ? inicio : `${inicio}T00:00:00.000Z`;
    const fimIso = fim.includes('T') ? fim : `${fim}T23:59:59.999Z`;

    // 2. Somar pontos de cada tribo no período
    const triboIds = tribos.map((t) => t.id);
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('pontos_calculados')
      .in('tribo_id', triboIds)
      .eq('removido', false)
      .eq('origem', 'missao')
      .gte('criado_em', inicioIso)
      .lte('criado_em', fimIso);

    if (error) throw error;
    return (data ?? []).reduce((acc, row) => acc + (row.pontos_calculados || 0), 0);
  }


  // =====================================================
  // Cálculo de pontuação por missões exclusivas
  // =====================================================

  // Soma dos lançamentos vinculados às missões exclusivas de um confronto para uma tribo
  async calcularPontosMissoesExclusivasTribo(confrontoId: string, triboId: string): Promise<number> {
    // 1. Buscar quais missões são exclusivas desse confronto
    const missoesIds = await this.obterMissoesExclusivas(confrontoId);
    if (missoesIds.length === 0) return 0;

    // 2. Somar lançamentos dessa tribo nessas missões
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('pontos_calculados')
      .eq('tribo_id', triboId)
      .eq('removido', false)
      .in('missao_id', missoesIds);

    if (error) throw error;
    return (data ?? []).reduce((acc, row) => acc + (row.pontos_calculados || 0), 0);
  }

  // Soma dos lançamentos vinculados às missões exclusivas para uma nação (soma das tribos)
  async calcularPontosMissoesExclusivasNacao(confrontoId: string, nacaoId: string): Promise<number> {
    // 1. Buscar tribos da nação
    const { data: tribos, error: erroTribos } = await this.supabase
      .from('tribo')
      .select('id')
      .eq('nacao_id', nacaoId);

    if (erroTribos) throw erroTribos;
    if (!tribos || tribos.length === 0) return 0;

    // 2. Buscar missões exclusivas
    const missoesIds = await this.obterMissoesExclusivas(confrontoId);
    if (missoesIds.length === 0) return 0;

    // 3. Somar lançamentos das tribos nessas missões
    const triboIds = tribos.map((t) => t.id);
    const { data, error } = await this.supabase
      .from('lancamento')
      .select('pontos_calculados')
      .in('tribo_id', triboIds)
      .eq('removido', false)
      .in('missao_id', missoesIds);

    if (error) throw error;
    return (data ?? []).reduce((acc, row) => acc + (row.pontos_calculados || 0), 0);
  }

  // =====================================================
  // Buscar primeira tribo de uma nação (bônus nível nação)
  // =====================================================

  // Retorna os IDs de todas as tribos de uma nação (para distribuição igualitária do bônus)
  async buscarTribosNacao(nacaoId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('tribo')
      .select('id')
      .eq('nacao_id', nacaoId);

    if (error) throw error;
    return data?.map((t) => t.id) ?? [];
  }

  // Retorna o ID da primeira tribo de uma nação (para vincular bônus de confronto se necessário)
  async buscarPrimeiraTriboNacao(nacaoId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('tribo')
      .select('id')
      .eq('nacao_id', nacaoId)
      .order('criado_em', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.id ?? null;
  }
}

