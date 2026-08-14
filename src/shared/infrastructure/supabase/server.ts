// =====================================================
// Supabase Server Client
// =====================================================
// Client para uso em Server Components, Server Actions
// e Route Handlers. Usa cookies do Next.js para manter
// a sessão do usuário autenticada via SSR.
// =====================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Criando o client Supabase para uso no servidor
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Configuração ausente: As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar definidas no arquivo .env.local.'
    );
  }

  // Obtendo o cookie store do Next.js
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    anonKey,
    {

      cookies: {
        // Lendo todos os cookies da requisição
        getAll() {
          return cookieStore.getAll();
        },
        // Setando cookies na resposta
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll pode falhar em Server Components (read-only)
            // Isso é esperado — o middleware cuida da atualização
          }
        },
      },
    }
  );
}
