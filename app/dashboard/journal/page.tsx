'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────
interface MoodEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  emotion: string;
  sleep_quality: number;
  has_concern: boolean;
  concern_text?: string;
  created_at: string;
}

interface SessionEntry {
  id: string;
  zone: string;
  intensity_score: number | null;
  message_count: number;
  preview: string;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────────────────
const EMOTION_EMOJI: Record<string, string> = {
  Senang: '😊', 'Biasa aja': '😐', Cemas: '😟',
  Sedih: '😔', Frustrasi: '😤', Overwhelmed: '😵',
};

const EMOTION_COLOR: Record<string, string> = {
  Senang: '#4CAF50', 'Biasa aja': '#78909C', Cemas: '#FFC107',
  Sedih: '#FF9800', Frustrasi: '#EF5350', Overwhelmed: '#E53935',
};

const SLEEP_EMOJI = ['', '😫', '😣', '😐', '😊', '😌'];

const ZONE_CFG: Record<string, { emoji: string; color: string; bg: string }> = {
  green:  { emoji: '🟢', color: '#2E7D32', bg: '#F0FFF4' },
  yellow: { emoji: '🟡', color: '#B8860B', bg: '#FFF9E6' },
  red:    { emoji: '🔴', color: '#C62828', bg: '#FFF5F5' },
};

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

// ── Helpers ────────────────────────────────────────────────────────────
function formatTime(str: string) {
  return new Date(str).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

// Build a map from YYYY-MM-DD → MoodEntry for O(1) lookup
function buildMoodMap(entries: MoodEntry[]): Record<string, MoodEntry> {
  const map: Record<string, MoodEntry> = {};
  for (const e of entries) {
    // keep the latest entry per day if multiple exist
    if (!map[e.date] || e.created_at > map[e.date].created_at) {
      map[e.date] = e;
    }
  }
  return map;
}

// Return all days in a given month as Date objects
function getDaysInMonth(year: number, month: number) {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ── Calendar component ─────────────────────────────────────────────────
function MoodCalendar({
  moodMap,
  year,
  month,
  selectedDate,
  onSelect,
}: {
  moodMap: Record<string, MoodEntry>;
  year: number;
  month: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const days = getDaysInMonth(year, month);
  const firstDow = days[0].getDay(); // 0=Sun
  const todayStr = toYMD(new Date());

  // Pad leading empty cells
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-[#9CA3AF] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const ymd = toYMD(date);
          const mood = moodMap[ymd];
          const isToday = ymd === todayStr;
          const isSelected = ymd === selectedDate;
          const isFuture = ymd > todayStr;

          return (
            <button
              key={ymd}
              onClick={() => !isFuture && onSelect(ymd)}
              disabled={isFuture}
              className="flex flex-col items-center gap-0.5 py-1 rounded-xl transition-all border-2 cursor-pointer"
              style={{
                borderColor: isSelected ? '#1A3448' : 'transparent',
                background: isSelected ? '#EDF4F8' : 'transparent',
                opacity: isFuture ? 0.3 : 1,
              }}
            >
              {/* Mood emoji or date number */}
              {mood ? (
                <span className="text-[20px] leading-none">{EMOTION_EMOJI[mood.emotion] ?? '😐'}</span>
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: isToday ? '#1A3448' : 'transparent' }}
                >
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: isToday ? '#fff' : '#9CA3AF' }}
                  >
                    {date.getDate()}
                  </span>
                </div>
              )}
              {/* Date number below emoji */}
              {mood && (
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isToday ? '#1A3448' : '#9CA3AF' }}
                >
                  {date.getDate()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail cards ───────────────────────────────────────────────────────
function CheckinDetailCard({ entry }: { entry: MoodEntry }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: (EMOTION_COLOR[entry.emotion] ?? '#78909C') + '18' }}
        >
          {EMOTION_EMOJI[entry.emotion] ?? '😐'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-semibold text-[#A8C8D8] uppercase tracking-wide">
              Morning Check-in
            </span>
            <span className="text-[11px] text-[#9CA3AF]">{formatTime(entry.created_at)}</span>
          </div>
          <p className="m-0 text-sm font-semibold text-[#1A3448]">{entry.emotion}</p>
          <p className="m-0 mt-0.5 text-[13px] text-[#6B7280]">
            Kualitas tidur: {SLEEP_EMOJI[entry.sleep_quality]} {entry.sleep_quality}/5
          </p>
          {entry.has_concern && entry.concern_text && (
            <p className="m-0 mt-1.5 text-[13px] text-[#6B7280] italic leading-snug border-l-2 border-[#E5E7EB] pl-2">
              "{entry.concern_text}"
            </p>
          )}
          {entry.has_concern && !entry.concern_text && (
            <span className="inline-block mt-1.5 text-[11px] bg-[#FFF5F5] text-[#C62828] px-2 py-0.5 rounded-full">
              Ada kekhawatiran
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function SessionDetailCard({ entry }: { entry: SessionEntry }) {
  const zone = ZONE_CFG[entry.zone] ?? ZONE_CFG.green;
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: zone.bg }}
        >
          {zone.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: zone.color }}>
              Sesi Cerita
            </span>
            <span className="text-[11px] text-[#9CA3AF]">{formatTime(entry.created_at)}</span>
          </div>
          {entry.preview && (
            <p className="m-0 text-[13px] text-[#6B7280] italic leading-snug line-clamp-2">
              "{entry.preview}"
            </p>
          )}
          <p className="m-0 mt-1 text-[12px] text-[#9CA3AF]">
            {entry.message_count} pesan
            {entry.intensity_score != null ? ` · intensitas ${entry.intensity_score}/5` : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Streak legend ──────────────────────────────────────────────────────
function MoodLegend() {
  const items = [
    { emotion: 'Senang', emoji: '😊' },
    { emotion: 'Biasa aja', emoji: '😐' },
    { emotion: 'Cemas', emoji: '😟' },
    { emotion: 'Sedih', emoji: '😔' },
    { emotion: 'Frustrasi', emoji: '😤' },
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
      {items.map(item => (
        <div key={item.emotion} className="flex items-center gap-1">
          <span className="text-[15px]">{item.emoji}</span>
          <span className="text-[11px] text-[#9CA3AF]">{item.emotion}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export default function JournalPage() {
  const router = useRouter();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calendar month navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [moodRes, sessionRes] = await Promise.all([
        supabase
          .from('mood_entries')
          .select('id, date, emotion, sleep_quality, has_concern, concern_text, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('chat_sessions')
          .select('id, messages, intensity_score, zone, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      setMoods(moodRes.data ?? []);
      setSessions(
        (sessionRes.data ?? []).map(r => {
          const msgs: { role: string; content: string }[] = r.messages ?? [];
          const firstUser = msgs.find(m => m.role === 'user')?.content ?? '';
          return {
            id: r.id,
            zone: r.zone ?? 'green',
            intensity_score: r.intensity_score,
            message_count: msgs.filter(m => m.role === 'user').length,
            preview: firstUser.length > 80 ? firstUser.slice(0, 80) + '…' : firstUser,
            created_at: r.created_at,
          };
        })
      );
      // Default: select today if there's a check-in, else leave null
      setSelectedDate(toYMD(today));
      setLoading(false);
    };
    load();
  }, []);

  const moodMap = buildMoodMap(moods);

  // Entries for the selected date
  const selectedMood = selectedDate ? moodMap[selectedDate] : null;
  const selectedSessions = selectedDate
    ? sessions.filter(s => s.created_at.startsWith(selectedDate))
    : [];

  const hasAnything = moods.length > 0 || sessions.length > 0;

  // Month nav
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    const now = new Date();
    if (calYear === now.getFullYear() && calMonth === now.getMonth()) return; // no future months
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null);
  };
  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth();

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Jurnal" showBack={false} />

      <div className="px-5 pb-24 flex flex-col gap-4">

        {/* ── Calendar card ── */}
        <Card className="p-4">
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] border-none cursor-pointer flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span className="font-boogaloo text-[17px] text-[#1A3448]">
              {MONTHS_ID[calMonth]} {calYear}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 rounded-xl bg-[#F3F4F6] border-none flex items-center justify-center disabled:opacity-30"
              style={{ cursor: isCurrentMonth ? 'default' : 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-[#9CA3AF]">Memuat...</p>
            </div>
          ) : (
            <MoodCalendar
              moodMap={moodMap}
              year={calYear}
              month={calMonth}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          )}

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
            <MoodLegend />
          </div>
        </Card>

        {/* ── Stats strip ── */}
        {!loading && hasAnything && (
          <div className="flex gap-3">
            {[
              { icon: '✅', val: moods.length, label: 'Check-in' },
              { icon: '💬', val: sessions.length, label: 'Sesi cerita' },
              {
                icon: '🔥',
                val: (() => {
                  // Count consecutive days with a mood entry ending today
                  let streak = 0;
                  const d = new Date(); d.setHours(0, 0, 0, 0);
                  while (moodMap[toYMD(d)]) {
                    streak++;
                    d.setDate(d.getDate() - 1);
                  }
                  return streak;
                })(),
                label: 'Hari berturut',
              },
            ].map((s, i) => (
              <Card key={i} className="flex-1 p-3 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="m-0 mt-1 text-base font-bold text-[#1A3448]">{s.val}</p>
                <p className="m-0 text-[11px] text-[#6B7280]">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* ── Detail for selected date ── */}
        {selectedDate && (
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>

            {!selectedMood && selectedSessions.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-[#9CA3AF]">Tidak ada catatan untuk hari ini.</p>
                {selectedDate === toYMD(today) && (
                  <button
                    onClick={() => router.push('/dashboard/checkin')}
                    className="mt-2 text-sm text-[#1A3448] font-semibold bg-transparent border-none cursor-pointer font-poppins"
                  >
                    Mulai Check-in →
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {selectedMood && <CheckinDetailCard entry={selectedMood} />}
              {selectedSessions.map(s => <SessionDetailCard key={s.id} entry={s} />)}
            </div>
          </div>
        )}

        {/* ── Empty state (no data at all) ── */}
        {!loading && !hasAnything && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <span className="text-6xl">📔</span>
            <h2 className="font-boogaloo text-xl text-[#1A3448]">Belum ada catatan</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Mulai check-in harian untuk mengisi kalender moodmu.
            </p>
            <Button onClick={() => router.push('/dashboard/checkin')} fullWidth={false} className="px-8">
              Mulai Check-in
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
