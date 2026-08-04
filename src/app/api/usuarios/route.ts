import { NextResponse } from 'next/server';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';

export async function GET() {
  const supabase = await createClient();
  const services = makeAppServices(supabase);
  const res = await services.repos.usuarioRepo.listarTodos();

  return NextResponse.json(res);
}
