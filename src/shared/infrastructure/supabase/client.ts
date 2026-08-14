// =====================================================
// Supabase Browser Client
// =====================================================
// Client para uso em Client Components (browser).
// Usa createBrowserClient do @supabase/ssr.
// =====================================================

import { createBrowserClient } from '@supabase/ssr';

// Criando o client Supabase para uso no browser
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Configuração ausente no browser: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas.'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    anonKey
  );
}

