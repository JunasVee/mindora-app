import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const available = searchParams.get('available');
  const search = searchParams.get('search');

  let query = supabase.from('professionals').select('*');

  if (type) query = query.eq('type', type);
  if (available === 'true') query = query.eq('available', true);
  if (search) query = query.ilike('name', `%${search}%`);

  query = query.order('tier', { ascending: false }).order('rating', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ professionals: data });
}
