'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';
import { checkSubscriptionStatus } from '@/lib/subscription';
import type { Emotion } from '@/types';

interface MoodRow { date: string; emotion: Emotion; sleep_quality: number; }
interface SessionRow { zone: string; intensity_score: number | null; created_at: string; }

const EMOTION_EMOJI: Record<string, string> = {
  Senang: '😊', 'Biasa aja': '😐', Cemas: '😟',
  Sedih: '😔', Frustrasi: '😤', Overwhelmed: '😵',
};
const EMOTION_COLOR: Record<string, string> = {
  Senang: '#4CAF50', 'Biasa aja': '#78909C', Cemas: '#FFC107',
  Sedih: '#FF9800', Frustrasi: '#EF5350', Overwhelmed: '#E53935',
};
const ZONE_LABEL: Record<string, { label: string; color: string; emoji: string }> = {
  green:  { label: 'Hijau',  color: '#4CAF50', emoji: '🟢' },
  yellow: { label: 'Kuning', color: '#FFC107', emoji: '🟡' },
  red:    { label: 'Merah',  color: '#EF5350', emoji: '🔴' },
};

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const AI_NOTE_LABELS: Record<string, { title: string; icon: string }> = {
  interests:          { title: 'Hobi & Minat', icon: '🎯' },
  stressors:          { title: 'Stressor Utama', icon: '⚡' },
  situation:          { title: 'Situasi Hidup', icon: '🧭' },
  coping_strategies:  { title: 'Cara Kamu Cope', icon: '🌱' },
  personality_notes:  { title: 'Karakter yang Terlihat', icon: '✨' },
  personal_context:   { title: 'Konteks Personal', icon: '💭' },
};

export default function ReportPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = this month, -1 = last month
  const [moodRows, setMoodRows] = useState<MoodRow[]>([]);
  const [sessionRows, setSessionRows] = useState<SessionRow[]>([]);
  const [streak, setStreak] = useState(0);
  const [aiNotes, setAiNotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthLabel = `${MONTHS_ID[month]} ${year}`;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      await checkSubscriptionStatus(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, streak, ai_notes')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_premium) {
        router.replace('/premium');
        return;
      }
      setIsPremium(true);
      setStreak(profile.streak ?? 0);
      setAiNotes(profile.ai_notes ?? {});

      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const startISO = new Date(year, month, 1).toISOString();
      const endISO = new Date(year, month + 1, 1).toISOString();

      const [moodRes, sessionRes] = await Promise.all([
        supabase
          .from('mood_entries')
          .select('date, emotion, sleep_quality')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
        supabase
          .from('chat_sessions')
          .select('zone, intensity_score, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startISO)
          .lt('created_at', endISO),
      ]);

      setMoodRows(moodRes.data ?? []);
      setSessionRows(sessionRes.data ?? []);
      setLoading(false);
    };
    load();
  }, [router, monthOffset, year, month]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    moodRows.forEach(m => { counts[m.emotion] = (counts[m.emotion] ?? 0) + 1; });
    return counts;
  }, [moodRows]);

  const avgSleep = useMemo(() => {
    if (moodRows.length === 0) return null;
    return moodRows.reduce((s, m) => s + (m.sleep_quality ?? 0), 0) / moodRows.length;
  }, [moodRows]);

  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = { green: 0, yellow: 0, red: 0 };
    sessionRows.forEach(s => { counts[s.zone] = (counts[s.zone] ?? 0) + 1; });
    return counts;
  }, [sessionRows]);

  const totalSessions = sessionRows.length;
  const totalCheckins = moodRows.length;
  const maxEmotionCount = Math.max(1, ...Object.values(emotionCounts));

  const aiNoteEntries = Object.entries(aiNotes).filter(
    ([key, val]) => AI_NOTE_LABELS[key] && val && (Array.isArray(val) ? val.length > 0 : true)
  );

  if (isPremium === null || loading) {
    return (
      <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <AppHeader title="Laporan Bulanan" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#6B7280]">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
      <div className="h-11" />
      <AppHeader title="Laporan Bulanan" />

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-24">
        {/* Month nav */}
        <div className="flex items-center justify-between mt-2 mb-5">
          <button
            onClick={() => setMonthOffset(monthOffset - 1)}
            className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#E5E7EB] cursor-pointer flex items-center justify-center hover:border-[#1A3448] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h2 className="font-boogaloo text-xl text-[#1A3448] m-0">{monthLabel}</h2>
          <button
            onClick={() => monthOffset < 0 && setMonthOffset(monthOffset + 1)}
            disabled={monthOffset >= 0}
            className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#E5E7EB] cursor-pointer flex items-center justify-center hover:border-[#1A3448] transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {totalCheckins === 0 && totalSessions === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-sm text-[#6B7280]">Belum ada data di bulan ini.</p>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className="flex gap-2.5 mb-5">
              {[
                { icon: '📅', val: totalCheckins, label: 'Check-in' },
                { icon: '💬', val: totalSessions, label: 'Sesi Cerita' },
                { icon: '🔥', val: `${streak}`, label: 'Streak Hari' },
              ].map((s, i) => (
                <Card key={i} className="flex-1 p-3 text-center">
                  <span className="text-lg">{s.icon}</span>
                  <p className="m-0 mt-1 text-base font-bold text-[#1A3448]">{s.val}</p>
                  <p className="m-0 text-[11px] text-[#6B7280]">{s.label}</p>
                </Card>
              ))}
            </div>

            {/* Mood distribution */}
            {Object.keys(emotionCounts).length > 0 && (
              <div className="mb-5">
                <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5">📊 Distribusi Mood</h3>
                <Card className="p-4">
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(emotionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion, count]) => (
                        <div key={emotion} className="flex items-center gap-2.5">
                          <span className="text-base w-6">{EMOTION_EMOJI[emotion] ?? '😐'}</span>
                          <span className="text-[12px] text-[#1A3448] w-[88px] flex-shrink-0">{emotion}</span>
                          <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(count / maxEmotionCount) * 100}%`,
                                background: EMOTION_COLOR[emotion] ?? '#78909C',
                              }}
                            />
                          </div>
                          <span className="text-[12px] font-semibold text-[#6B7280] w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Sleep quality */}
            {avgSleep !== null && (
              <div className="mb-5">
                <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5">😴 Kualitas Tidur</h3>
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">
                      {avgSleep >= 4 ? '😌' : avgSleep >= 3 ? '😊' : avgSleep >= 2 ? '😐' : '😣'}
                    </span>
                    <div>
                      <p className="m-0 text-xl font-bold text-[#1A3448]">{avgSleep.toFixed(1)} / 5</p>
                      <p className="m-0 text-[12px] text-[#6B7280]">Rata-rata kualitas tidur bulan ini</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Zone distribution */}
            {totalSessions > 0 && (
              <div className="mb-5">
                <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5">🎯 Distribusi Zona Sesi Cerita</h3>
                <Card className="p-4">
                  <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-[#F3F4F6]">
                    {(['green', 'yellow', 'red'] as const).map(z => (
                      zoneCounts[z] > 0 && (
                        <div
                          key={z}
                          style={{
                            width: `${(zoneCounts[z] / totalSessions) * 100}%`,
                            background: ZONE_LABEL[z].color,
                          }}
                        />
                      )
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {(['green', 'yellow', 'red'] as const).map(z => (
                      <div key={z} className="text-center flex-1">
                        <p className="m-0 text-sm font-semibold" style={{ color: ZONE_LABEL[z].color }}>
                          {ZONE_LABEL[z].emoji} {zoneCounts[z]}
                        </p>
                        <p className="m-0 text-[11px] text-[#6B7280]">{ZONE_LABEL[z].label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* AI Insights */}
            {aiNoteEntries.length > 0 && (
              <div className="mb-5">
                <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5">🧠 Insight dari MinDora</h3>
                <p className="text-[12px] text-[#6B7280] mb-3 leading-relaxed">
                  Pola yang terdeteksi MinDora dari sesi-sesi cerita kamu sepanjang waktu.
                </p>
                <div className="flex flex-col gap-2.5">
                  {aiNoteEntries.map(([key, val]) => {
                    const meta = AI_NOTE_LABELS[key];
                    const text = Array.isArray(val) ? val.join(', ') : String(val);
                    return (
                      <Card key={key} className="p-3.5" style={{ background: '#EDF4F8' } as React.CSSProperties}>
                        <p className="m-0 mb-1 text-[12px] font-semibold text-[#1A3448]">
                          {meta.icon} {meta.title}
                        </p>
                        <p className="m-0 text-[13px] text-[#1A3448] leading-relaxed">{text}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
