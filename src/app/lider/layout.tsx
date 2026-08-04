import { createClient } from '@/shared/infrastructure/supabase/server';
import { Sidebar } from '@/presentation/components/Sidebar';
import { logoutAction } from '../login/actions';
import { redirect } from 'next/navigation';

export default async function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar papel do usuário
  const { data: perfil } = await supabase
    .from('usuario_perfil')
    .select('papel, tribo_id')
    .eq('id', user.id)
    .single();

  if (!perfil) {
    redirect('/login');
  }

  const papel = perfil.papel as 'admin' | 'lider_tribo';

  return (
    <div className="app-container">
      <Sidebar papel={papel} onLogout={logoutAction} />
      <main className="main-content">{children}</main>
    </div>
  );
}
