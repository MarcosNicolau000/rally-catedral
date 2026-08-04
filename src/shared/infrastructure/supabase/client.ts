// =====================================================
// Supabase Browser Client
// =====================================================
// Client para uso em Client Components (browser).
// Usa createBrowserClient do @supabase/ssr.
// =====================================================

import { createBrowserClient } from '@supabase/ssr';

// Criando o client Supabase para uso no browser
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
