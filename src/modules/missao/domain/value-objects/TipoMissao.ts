// =====================================================
// Value Object: TipoMissao
// =====================================================
// Tipos de missão suportados:
// - 'booleana': verdadeiro (1x pontos_base) ou falso (sem lançamento)
// - 'contagem': quantidade manual informada * pontos_base
// =====================================================

export type TipoMissao = 'booleana' | 'contagem';
