import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateForecast } from '@/lib/forecast';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const weekOffset = parseInt(searchParams.get('week') ?? '0');

  const { data: moods } = await supabase
    .from('mood_entries')
    .select('date, emotion, sleep_quality')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30);

  if (!moods || moods.length < 7) {
    return NextResponse.json({
      error: 'not_enough_data',
      message: 'Kamu perlu setidaknya 7 hari check-in untuk melihat forecast.',
    }, { status: 422 });
  }

  const forecast = generateForecast(moods as any, weekOffset);
  return NextResponse.json({ forecast });
}
