import { NextRequest, NextResponse } from 'next/server';
import { extractUserInsights } from '@/lib/gemini';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ ok: false });
  }

  try {
    // Fetch existing ai_notes
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_notes')
      .eq('id', user.id)
      .maybeSingle();

    const existingNotes: Record<string, any> = profile?.ai_notes ?? {};

    // Extract new insights from this session
    const updatedNotes = await extractUserInsights(messages, existingNotes);

    // Save back to profiles
    await supabase
      .from('profiles')
      .update({ ai_notes: updatedNotes })
      .eq('id', user.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Insights extraction error:', e);
    return NextResponse.json({ ok: false });
  }
}
