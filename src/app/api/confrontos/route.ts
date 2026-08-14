import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { exigirAutenticado } from '@/shared/infrastructure/security/authGuard';

export async function GET() {
  const authCheck = await exigirAutenticado();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error.message }, { status: 401 });
  }

  const supabase = await createClient();
  const services = makeAppServices(supabase);
  const res = await services.confronto.listar.execute();

  if (!res.ok) {
    return NextResponse.json({ error: res.error.message }, { status: 400 });
  }

  return NextResponse.json(res.value);
}

