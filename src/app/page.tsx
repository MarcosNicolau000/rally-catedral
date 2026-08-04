import { createClient } from '@/shared/infrastructure/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/ranking');
  }

  const { data: perfil } = await supabase
    .from('usuario_perfil')
    .select('papel')
    .eq('id', user.id)
    .single();

  if (perfil?.papel === 'admin') {
    redirect('/admin/dashboard');
  } else if (perfil?.papel === 'lider_tribo') {
    redirect('/lider/lancamentos');
  }

  redirect('/ranking');
}
