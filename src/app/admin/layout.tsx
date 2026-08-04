import { createClient } from '@/shared/infrastructure/supabase/server';
import { Sidebar } from '@/presentation/components/Sidebar';
import { logoutAction } from '../login/actions';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar se o papel é admin
  const { data: perfil } = await supabase
    .from('usuario_perfil')
    .select('papel')
    .eq('id', user.id)
    .single();

  if (perfil?.papel !== 'admin') {
    redirect('/lider/lancamentos');
  }

  return (
    <div className="app-container">
      <Sidebar papel="admin" onLogout={logoutAction} />
      <main className="main-content">{children}</main>
    </div>
  );
}
