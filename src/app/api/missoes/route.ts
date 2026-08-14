import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAutenticado, exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apenasAtivas = searchParams.get('ativas') === 'true';

  if (apenasAtivas) {
    const authCheck = await exigirAutenticado();
    if (!authCheck.ok) {
      return NextResponse.json({ error: authCheck.error.message }, { status: 401 });
    }

    const supabase = await createClient();
    const services = makeAppServices(supabase);
    const res = await services.missao.listarAtivas.execute();
    return res.ok
      ? NextResponse.json(res.value)
      : NextResponse.json({ error: res.error.message }, { status: 400 });
  }

  // Admin lista todas (incluindo desativadas e do sistema)
  const adminCheck = await exigirAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.error.message }, { status: 403 });
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);
  const res = await services.repos.missaoRepo.listarTodas();
  return NextResponse.json(res);
}

