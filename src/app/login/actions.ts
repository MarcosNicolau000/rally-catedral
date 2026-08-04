'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/shared/infrastructure/supabase/server';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || 'Falha ao autenticar. Verifique suas credenciais.' };
  }

  // Buscar perfil para redirecionamento correto
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: perfil } = await supabase
      .from('usuario_perfil')
      .select('papel')
      .eq('id', user.id)
      .single();

    revalidatePath('/', 'layout');

    if (perfil?.papel === 'admin') {
      redirect('/admin/dashboard');
    } else if (perfil?.papel === 'lider_tribo') {
      redirect('/lider/lancamentos');
    }
  }

  redirect('/');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
