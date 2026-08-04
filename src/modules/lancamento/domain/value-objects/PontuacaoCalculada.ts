// =====================================================
// Value Object: PontuacaoCalculada
// =====================================================
// Calcula os pontos obtidos em um lançamento.
// Regra 2.2 / 4.3 da especificação:
// - Missão Booleana: se verdadeiro, pontos_base * 1.
//   Se falso, NENHUM lançamento deve ser criado.
// - Missão Contagem: quantidade * pontos_base.
// =====================================================

import { TipoMissao } from '@/modules/missao/domain/value-objects/TipoMissao';

export class PontuacaoCalculada {
  public readonly valor: number;

  constructor(tipo: TipoMissao, pontosBase: number, quantidade: number = 1) {
    if (tipo === 'booleana') {
      // Missão booleana verdadeira -> 1 * pontosBase
      this.valor = pontosBase;
    } else {
      // Missão contagem -> quantidade * pontosBase
      this.valor = Math.max(0, quantidade) * Math.max(0, pontosBase);
    }
  }
}
