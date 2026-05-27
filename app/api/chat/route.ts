import { NextRequest, NextResponse } from 'next/server';
import { chatWithMinDora, type ChatHistory } from '@/lib/gemini';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, history } = await req.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  // Build history, injecting user context as a silent first exchange
  // so MinDora can personalise responses without being prompted.
  let contextualHistory: ChatHistory[] = history ?? [];

  const isFirstExchange = contextualHistory.filter(h => h.role === 'user').length === 0;
  if (isFirstExchange) {
    const [profileRes, moodRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, streak, session_count, is_premium, ai_notes')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('mood_entries')
        .select('emotion, sleep_quality, has_concern, concern_text')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const mood = moodRes.data;
    const aiNotes: Record<string, any> = profile?.ai_notes ?? {};

    const contextLines: string[] = [
      '[Konteks pengguna — jangan sebut secara eksplisit kecuali relevan:]',
    ];
    if (profile?.full_name) contextLines.push(`Nama: ${profile.full_name}`);
    if (profile?.streak)     contextLines.push(`Streak: ${profile.streak} hari check-in berturut-turut`);
    if (profile?.session_count) contextLines.push(`Total sesi cerita sebelumnya: ${profile.session_count}`);
    if (mood?.emotion)       contextLines.push(`Mood terakhir: ${mood.emotion}`);
    if (mood?.sleep_quality) contextLines.push(`Kualitas tidur terakhir: ${mood.sleep_quality}/5`);
    if (mood?.has_concern && mood.concern_text)
      contextLines.push(`Kekhawatiran yang dicatat: "${mood.concern_text}"`);

    // Inject persisted ai_notes as personal memory
    if (Object.keys(aiNotes).length > 0) {
      const noteLines: string[] = [];
      if (aiNotes.interests?.length)          noteLines.push(`Hobi/minat: ${aiNotes.interests.join(', ')}`);
      if (aiNotes.stressors?.length)          noteLines.push(`Stressor utama: ${aiNotes.stressors.join(', ')}`);
      if (aiNotes.situation)                   noteLines.push(`Situasi: ${aiNotes.situation}`);
      if (aiNotes.coping_strategies?.length)  noteLines.push(`Cara cope: ${aiNotes.coping_strategies.join(', ')}`);
      if (aiNotes.personality_notes)           noteLines.push(`Karakter: ${aiNotes.personality_notes}`);
      if (aiNotes.personal_context)            noteLines.push(`Konteks personal: ${aiNotes.personal_context}`);
      if (noteLines.length > 0) {
        contextLines.push('');
        contextLines.push('[Catatan tentang user dari sesi-sesi sebelumnya:]');
        contextLines.push(...noteLines);
      }
    }

    if (contextLines.length > 1) {
      contextualHistory = [
        { role: 'user',  parts: [{ text: contextLines.join('\n') }] },
        { role: 'model', parts: [{ text: 'Baik, aku sudah catat konteks ini.' }] },
        ...contextualHistory,
      ];
    }
  }

  try {
    const response = await chatWithMinDora(message, contextualHistory);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal menghubungi MinDora. Coba lagi ya.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
