import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apenasAtivas = searchParams.get('ativas') === 'true';

  const supabase = await createClient();
  const services = makeAppServices(supabase);

  if (apenasAtivas) {
    const res = await services.missao.listarAtivas.execute();
    return res.ok
      ? NextResponse.json(res.value)
      : NextResponse.json({ error: res.error.message }, { status: 400 });
  }

  // Admin lista todas
  const res = await services.repos.missaoRepo.listarTodas();
  return NextResponse.json(res);
}
