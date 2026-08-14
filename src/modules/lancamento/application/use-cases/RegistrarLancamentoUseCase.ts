// =====================================================
// Use Case: Registrar Lançamento
// =====================================================
// Valida tribo, tipo de missão e calcula os pontos.
// Regra 4.3: Se missão booleana for falsa, NÃO cria lançamento.
// Regra 7: O líder só pode registrar na própria tribo.
// =====================================================

import { Lancamento, RegistrarLancamentoDTO } from '../../domain/entities/Lancamento';
import { LancamentoRepository } from '../../domain/repositories/LancamentoRepository';
import { MissaoRepository } from '@/modules/missao/domain/repositories/MissaoRepository';
import { UsuarioRepository } from '@/modules/usuario/domain/repositories/UsuarioRepository';
import { PontuacaoCalculada } from '../../domain/value-objects/PontuacaoCalculada';
import { Result, success, failure } from '@/shared/domain/types/Result';
import { DomainError } from '@/shared/domain/errors/DomainError';

export class RegistrarLancamentoUseCase {
  constructor(
    private readonly lancamentoRepo: LancamentoRepository,
    private readonly missaoRepo: MissaoRepository,
    private readonly usuarioRepo: UsuarioRepository
  ) {}

  async execute(dados: RegistrarLancamentoDTO): Promise<Result<Lancamento | null, DomainError>> {
    // 1. Obter usuário logado
    const usuarioLogado = await this.usuarioRepo.obterUsuarioLogado();
    if (!usuarioLogado) {
      return failure(new DomainError('NAO_AUTENTICADO', 'Usuário não autenticado.'));
    }

    // 2. Regra de negócio 7: Se for líder de tribo, obrigatoriamente a tribo_id do lançamento precisa ser a sua própria
    if (usuarioLogado.papel === 'lider_tribo') {
      if (usuarioLogado.tribo_id !== dados.tribo_id) {
        return failure(
          new DomainError('ACESSO_NEGADO', 'Você só pode registrar lançamentos para a sua própria tribo.')
        );
      }
    }

    // 3. Buscar missão e validar se está ativa
    const missao = await this.missaoRepo.buscarPorId(dados.missao_id);
    if (!missao) {
      return failure(new DomainError('MISSAO_NAO_ENCONTRADA', 'Missão não encontrada.'));
    }

    if (!missao.ativa) {
      return failure(new DomainError('MISSAO_INATIVA', 'Esta missão está desativada para novos lançamentos.'));
    }

    // 4. Regra 4.3: Missão booleana com valor falso -> não gera nenhum lançamento
    if (missao.tipo === 'booleana') {
      if (dados.valor_booleano === false) {
        // Não cria lançamento, retorna sucesso com null
        return success(null);
      }

      // Prevenção de duplicidade: checa se a tribo já realizou esta missão no dia de hoje
      const lancamentosTribo = await this.lancamentoRepo.listarPorTribo(dados.tribo_id);
      const hojeStr = new Date().toISOString().split('T')[0];
      const jaRegistradaHoje = lancamentosTribo.some(
        (l) => l.missao_id === missao.id && l.criado_em.startsWith(hojeStr)
      );

      if (jaRegistradaHoje) {
        return failure(
          new DomainError('MISSAO_JA_REGISTRADA_HOJE', 'Esta missão booleana já foi registrada para a sua tribo hoje.')
        );
      }
    }


    // 5. Calcular pontuação
    const quantidade = missao.tipo === 'contagem' ? (dados.quantidade ?? 1) : 1;

    if (missao.tipo === 'contagem' && quantidade <= 0) {
      return failure(new DomainError('QUANTIDADE_INVALIDA', 'A quantidade para missão de contagem deve ser maior que zero.'));
    }

    const calculo = new PontuacaoCalculada(missao.tipo, missao.pontos_base, quantidade);

    // 6. Criar lançamento
    const novoLancamento = await this.lancamentoRepo.criar({
      missao_id: missao.id,
      tribo_id: dados.tribo_id,
      quantidade,
      pontos_calculados: calculo.valor,
      origem: dados.origem || 'missao',
      confronto_id: dados.confronto_id || null,
      registrado_por: dados.registrado_por,
    });

    return success(novoLancamento);
  }
}
