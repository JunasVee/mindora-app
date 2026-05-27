'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';

interface SessionRow {
  id: string;
  messages: { role: string; content: string }[];
  intensity_score: number | null;
  zone: string;
  created_at: string;
}

const ZONE_STYLE: Record<string, { emoji: string; color: string; bg: string }> = {
  green:  { emoji: '🟢', color: '#2E7D32', bg: '#F0FFF4' },
  yellow: { emoji: '🟡', color: '#B8860B', bg: '#FFF9E6' },
  red:    { emoji: '🔴', color: '#C62828', bg: '#FFF5F5' },
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(str: string) {
  return new Date(str).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      const { data } = await supabase
        .from('chat_sessions')
        .select('id, messages, intensity_score, zone, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setSessions(data ?? []);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Riwayat Sesi" />

      <div className="px-5 pb-8 flex flex-col gap-3">
        {loading && (
          <>
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </>
        )}

        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-base font-semibold text-[#1A3448]">Belum ada sesi tersimpan</p>
            <p className="text-sm text-[#6B7280]">
              Setelah kamu selesai sesi cerita dan memilih untuk menyimpannya, riwayat akan muncul di sini.
            </p>
          </div>
        )}

        {!loading && sessions.map((s) => {
          const zone = ZONE_STYLE[s.zone] ?? ZONE_STYLE.green;
          const userMsgCount = s.messages?.filter(m => m.role === 'user').length ?? 0;
          const firstUserMsg = s.messages?.find(m => m.role === 'user')?.content ?? '';
          const preview = firstUserMsg.length > 60 ? firstUserMsg.slice(0, 60) + '…' : firstUserMsg;

          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: zone.bg }}
                >
                  {zone.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold" style={{ color: zone.color }}>
                      Zona {s.zone.charAt(0).toUpperCase() + s.zone.slice(1)}
                    </span>
                    {s.intensity_score !== null && (
                      <span className="text-[12px] text-[#9CA3AF]">
                        Intensitas {s.intensity_score}/5
                      </span>
                    )}
                  </div>
                  {preview && (
                    <p className="m-0 text-sm text-[#1A3448] leading-snug line-clamp-2">{preview}</p>
                  )}
                  <p className="m-0 mt-1.5 text-[11px] text-[#9CA3AF]">
                    {formatDate(s.created_at)} · {formatTime(s.created_at)} · {userMsgCount} pesan
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
