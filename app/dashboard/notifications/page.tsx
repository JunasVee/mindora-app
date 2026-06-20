'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';

interface NotifItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  checkin_reminder:     '🌤️',
  forecast_alert:       '🟡',
  booking_confirmed:    '✅',
  session_reminder:     '💬',
  streak_achieved:      '🎉',
  report_ready:         '💙',
  subscription_expiring:'⏳',
  subscription_expired: '🔒',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7)   return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function groupByDay(items: NotifItem[]) {
  const groups: { label: string; items: NotifItem[] }[] = [];
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const map: Record<string, NotifItem[]> = {};
  for (const n of items) {
    const d = new Date(n.created_at); d.setHours(0,0,0,0);
    const key = d.getTime() >= today.getTime()     ? 'Hari Ini'
              : d.getTime() >= yesterday.getTime() ? 'Kemarin'
              : 'Sebelumnya';
    if (!map[key]) map[key] = [];
    map[key].push(n);
  }

  for (const label of ['Hari Ini', 'Kemarin', 'Sebelumnya']) {
    if (map[label]) groups.push({ label, items: map[label] });
  }
  return groups;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifs(data ?? []);
      setLoading(false);

      // Mark all as read
      if (data && data.some(n => !n.read)) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
      }
    };
    load();
  }, []);

  const groups = groupByDay(notifs);

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Notifikasi" showBack={false} />

      <div className="px-5 pb-5 flex flex-col gap-5">
        {loading && (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-5xl">🔔</span>
            <p className="text-base font-semibold text-[#1A3448]">Belum ada notifikasi</p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Notifikasi tentang sesi, streak, dan booking akan muncul di sini.
            </p>
          </div>
        )}

        {!loading && groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2.5">
              {group.label}
            </p>
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <Card
                  key={item.id}
                  className="p-3.5 cursor-pointer hover:shadow-md transition-shadow"
                  style={!item.read ? { borderLeft: '3px solid #A8C8D8' } as React.CSSProperties : undefined}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF4F8] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{TYPE_ICON[item.type] ?? '💡'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-sm font-semibold text-[#1A3448] leading-snug">{item.title}</h4>
                      <p className="m-0 mt-1 text-[13px] text-[#6B7280] leading-snug">{item.body}</p>
                      <p className="m-0 mt-1.5 text-[11px] text-gray-400">{timeAgo(item.created_at)}</p>
                    </div>
                    {!item.read && (
                      <div className="w-2 h-2 rounded-full bg-[#A8C8D8] mt-1 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
