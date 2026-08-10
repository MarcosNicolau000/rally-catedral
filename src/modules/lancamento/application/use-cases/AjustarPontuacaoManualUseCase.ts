// =====================================================
// Use Case: Ajustar Pontuação Manual (Admin)
// =====================================================
// Permite ao admin adicionar ou remover pontos de uma tribo
// diretamente, sem vínculo com uma missão específica.
// Gera um lançamento com origem 'ajuste_manual', associado à
// missão de sistema criada na migration 005 (apenas para
// satisfazer a FK missao_id, assim como já é feito para os
// bônus de confronto).
// =====================================================

import { Lancamento, AjustarPontuacaoManualDTO } from '../../domain/entities/Lancamento';
import { LancamentoRepository } from '../../domain/repositories/LancamentoRepository';
import { UsuarioRepository } from '@/modules/usuario/domain/repositories/UsuarioRepository';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

// ID fixo da missão de sistema "Ajuste Manual de Pontuação" (criada na migration 005)
const MISSAO_AJUSTE_MANUAL_SISTEMA_ID = '00000000-0000-0000-0000-000000000002';

export class AjustarPontuacaoManualUseCase {
  constructor(
    private readonly lancamentoRepo: LancamentoRepository,
    private readonly usuarioRepo: UsuarioRepository
  ) {}

  async execute(dados: AjustarPontuacaoManualDTO): Promise<Result<Lancamento, DomainError>> {
    // 1. Apenas admin pode ajustar pontuação manualmente
    const usuarioLogado = await this.usuarioRepo.obterUsuarioLogado();
    if (!usuarioLogado) {
      return failure(new DomainError('NAO_AUTENTICADO', 'Usuário não autenticado.'));
    }

    if (usuarioLogado.papel !== 'admin') {
      return failure(
        new DomainError('ACESSO_NEGADO', 'Apenas administradores podem ajustar pontuação manualmente.')
      );
    }

    // 2. Validações
    if (!dados.tribo_id) {
      return failure(new DomainError('TRIBO_OBRIGATORIA', 'É necessário informar a tribo.'));
    }

    if (!Number.isInteger(dados.pontos) || dados.pontos === 0) {
      return failure(
        new DomainError('PONTOS_INVALIDOS', 'Informe uma quantidade de pontos inteira e diferente de zero.')
      );
    }

    // 3. Criar lançamento de ajuste manual (positivo adiciona, negativo remove)
    const novoLancamento = await this.lancamentoRepo.criar({
      missao_id: MISSAO_AJUSTE_MANUAL_SISTEMA_ID,
      tribo_id: dados.tribo_id,
      quantidade: 1,
      pontos_calculados: dados.pontos,
      origem: 'ajuste_manual',
      descricao: dados.motivo?.trim() || null,
      registrado_por: dados.registrado_por,
    });

    return success(novoLancamento);
  }
}
