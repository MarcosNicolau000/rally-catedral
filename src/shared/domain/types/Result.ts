// =====================================================
// Result<T, E> — Tipo para retorno tipado sem exceções
// =====================================================
// Padrão Result/Either: todo use case retorna um Result
// indicando sucesso ou falha, sem lançar exceções.
// =====================================================

// Tipo que representa um resultado de sucesso
export type Success<T> = {
  ok: true;
  value: T;
};

// Tipo que representa um resultado de falha
export type Failure<E> = {
  ok: false;
  error: E;
};

// Union type: ou sucesso ou falha, nunca ambos
export type Result<T, E> = Success<T> | Failure<E>;

// Factory para criar um resultado de sucesso
export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

// Factory para criar um resultado de falha
export function failure<E>(error: E): Failure<E> {
  return { ok: false, error };
}
