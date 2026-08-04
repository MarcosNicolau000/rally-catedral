// =====================================================
// DomainError — Classe base para erros de domínio
// =====================================================
// Todos os módulos estendem esta classe para criar
// erros tipados e semânticos, sem usar exceções genéricas.
// =====================================================

export class DomainError extends Error {
  // Código identificador do erro (ex: 'NACAO_NAO_ENCONTRADA')
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    // Atribuindo o código do erro
    this.code = code;
    // Preservando o nome da classe para stack traces
    this.name = this.constructor.name;
  }
}
