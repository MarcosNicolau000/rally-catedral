// =====================================================
// Implementação: SupabaseConfiguracaoRepository
// =====================================================
// Implementação concreta do ConfiguracaoRepository usando Supabase.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { ConfiguracaoRepository } from '../domain/repositories/ConfiguracaoRepository';
import { ConfiguracaoSistema } from '../domain/entities/ConfiguracaoSistema';

export class SupabaseConfiguracaoRepository implements ConfiguracaoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async obter(): Promise<ConfiguracaoSistema | null> {
    const { data, error } = await this.supabase
      .from('configuracao_sistema')
      .select('*')
      .eq('id', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      // Fallback padrão se a linha não existir
      return {
        id: true,
        exibicao_publica_ativa: false,
        atualizado_por: null,
        atualizado_em: new Date().toISOString(),
      };
    }

    return data;
  }

  async atualizarExibicaoPublica(ativa: boolean, adminId: string): Promise<ConfiguracaoSistema> {
    const { data, error } = await this.supabase
      .from('configuracao_sistema')
      .update({
        exibicao_publica_ativa: ativa,
        atualizado_por: adminId,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', true)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
