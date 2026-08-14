import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAdmin } from '@/shared/infrastructure/security/authGuard';

export async function GET() {
  const authCheck = await exigirAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error.message }, { status: 403 });
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);
  const res = await services.repos.usuarioRepo.listarTodos();

  return NextResponse.json(res);
}

