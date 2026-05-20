'use client';

import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';

const NOTIFICATION_GROUPS = [
  {
    title: 'Hari Ini',
    items: [
      {
        icon: '🌤️',
        title: 'Morning Check-in kamu belum selesai nih!',
        desc: 'Yuk luangkan 2 menit buat check-in.',
        time: '2 jam lalu',
      },
      {
        icon: '🟡',
        title: 'Mood Forecast: Besok mungkin lebih berat.',
        desc: 'MinDora siap temani kamu. Mau persiapan?',
        time: '5 jam lalu',
      },
    ],
  },
  {
    title: 'Kemarin',
    items: [
      {
        icon: '✅',
        title: 'Sesi dengan Sarah Amalia dikonfirmasi',
        desc: 'Senin 10:00 WIB — Video Call via Zoom',
        time: 'Kemarin',
      },
      {
        icon: '🎉',
        title: 'Streak 7 hari! Kamu konsisten banget 💪',
        desc: 'Terus jaga momentum ya!',
        time: 'Kemarin',
      },
    ],
  },
  {
    title: 'Minggu Ini',
    items: [
      {
        icon: '💙',
        title: 'Laporan Bulan April siap dibaca',
        desc: 'Lihat ringkasan mood dan insight bulanmu.',
        time: '3 hari lalu',
      },
    ],
  },
];

export default function NotificationsPage() {
  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Notifikasi" showBack={false} />

      <div className="px-5 pb-5 flex flex-col gap-5">
        {NOTIFICATION_GROUPS.map((group, gi) => (
          <div key={gi}>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2.5">
              {group.title}
            </p>
            <div className="flex flex-col gap-2">
              {group.items.map((item, ii) => (
                <Card key={ii} className="p-3.5 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF4F8] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="m-0 text-sm font-semibold text-[#1A3448] leading-snug">
                        {item.title}
                      </h4>
                      <p className="m-0 mt-1 text-[13px] text-[#6B7280] leading-snug">{item.desc}</p>
                      <p className="m-0 mt-1.5 text-[11px] text-gray-400">{item.time}</p>
                    </div>
                    <div className="w-1 h-8 rounded-sm bg-[#E5E7EB] self-center flex-shrink-0" />
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
