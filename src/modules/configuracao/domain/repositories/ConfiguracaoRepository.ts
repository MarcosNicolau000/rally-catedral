// =====================================================
// Interface: ConfiguracaoRepository
// =====================================================
// Porta do domínio para gestão das configurações.
// =====================================================

import { ConfiguracaoSistema } from '../entities/ConfiguracaoSistema';

export interface ConfiguracaoRepository {
  obter(): Promise<ConfiguracaoSistema | null>;
  atualizarExibicaoPublica(ativa: boolean, adminId: string): Promise<ConfiguracaoSistema>;
}
