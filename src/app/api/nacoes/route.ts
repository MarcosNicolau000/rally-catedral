import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function GET() {
  const supabase = await createClient();
  const services = makeAppServices(supabase);
  const res = await services.nacao.listar.execute();

  if (!res.ok) {
    return NextResponse.json({ error: res.error.message }, { status: 400 });
  }

  return NextResponse.json(res.value);
}
