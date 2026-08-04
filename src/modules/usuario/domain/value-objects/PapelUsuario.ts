// =====================================================
// Value Object: PapelUsuario
// =====================================================
// Define os dois papéis válidos no sistema Rally:
// - 'admin': acesso total a todas as funcionalidades
// - 'lider_tribo': acesso restrito a registrar lançamentos da sua tribo
// =====================================================

export type PapelUsuario = 'admin' | 'lider_tribo';
