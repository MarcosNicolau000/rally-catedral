// =====================================================
// Supabase Admin Client (Service Role)
// =====================================================
// Client que bypassa RLS usando SUPABASE_SERVICE_ROLE_KEY.
// USO RESTRITO: apenas para operações de servidor que
// precisam ignorar RLS (ex: ZerarPontuacoesUseCase).
// NUNCA expor ao client-side.
// =====================================================

import { createClient } from '@supabase/supabase-js';

// Criando o client admin com service role key
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Desabilitando auto-refresh de sessão (não é necessário para admin)
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
