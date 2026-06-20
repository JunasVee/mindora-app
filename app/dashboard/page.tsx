'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase';
import { checkSubscriptionStatus } from '@/lib/subscription';
import { useLanguage } from '@/lib/language-context';
import { formatDateID, getEmotionEmoji } from '@/lib/utils';
import type { Emotion } from '@/types';

const QUICK_MOODS: { emoji: string; label: Emotion }[] = [
  { emoji: '😊', label: 'Senang' },
  { emoji: '😐', label: 'Biasa aja' },
  { emoji: '😟', label: 'Cemas' },
  { emoji: '😔', label: 'Sedih' },
  { emoji: '😤', label: 'Frustrasi' },
];

const TIPS = [
  'Coba tarik napas dalam 4 detik, tahan 4 detik, buang 4 detik. Ulangi 3x. Ini bisa bantu redam cemas di tengah hari.',
  'Luangkan 5 menit untuk menulis 3 hal yang kamu syukuri hari ini. Ini terbukti meningkatkan mood secara signifikan.',
  'Jalan kaki 10 menit di luar ruangan bisa membantu jernihkan pikiran dan mengurangi stres.',
  'Hubungi satu orang yang kamu percaya hari ini. Koneksi sosial adalah kunci kesehatan mental.',
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [userName, setUserName] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [todayTip] = useState(() => TIPS[new Date().getDay() % TIPS.length]);
  const today = formatDateID(new Date());

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      checkSubscriptionStatus(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_premium, streak')
        .eq('id', user.id)
        .maybeSingle();   // maybeSingle() returns null instead of error when row missing

      if (profile) {
        setUserName(profile.full_name?.split(' ')[0] ?? 'Kamu');
        setIsPremium(profile.is_premium ?? false);
        setStreak(profile.streak ?? 0);
      } else {
        // Profile row not created yet (trigger may be pending) — fall back to auth metadata
        setUserName(
          (user.user_metadata?.full_name as string)?.split(' ')[0] ?? 'Kamu'
        );
      }
    };
    loadUser();
  }, [router]);

  const handleQuickMood = (index: number) => {
    setSelectedMood(index);
    router.push('/dashboard/checkin');
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      {/* Status bar */}
      <div className="h-11" />

      <div className="px-5 pb-5 flex flex-col gap-4">
        {/* Greeting */}
        <div>
          <h1 className="font-boogaloo text-[26px] text-[#1A3448] m-0 mb-1">
            {t('dashboard', 'greeting')} {userName || '...'} 👋
          </h1>
          <p className="text-[13px] text-[#6B7280] m-0">{today}</p>
        </div>

        {/* Morning Check-in Card */}
        <div
          className="rounded-[20px] p-5"
          style={{ background: 'linear-gradient(135deg, #1A3448, #2A4A60)' }}
        >
          <p className="text-[#A8C8D8] text-sm mb-3.5 font-medium m-0">
            {t('dashboard', 'checkinPrompt')}
          </p>
          <div className="flex justify-between gap-1">
            {QUICK_MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => handleQuickMood(i)}
                className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 px-1 cursor-pointer transition-all duration-200 border-2"
                style={{
                  background: selectedMood === i ? 'rgba(168,200,216,0.2)' : 'rgba(255,255,255,0.08)',
                  borderColor: selectedMood === i ? '#A8C8D8' : 'transparent',
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] text-[#A8C8D8]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Action */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push('/dashboard/chat')}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-[52px] h-[52px] rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #A8C8D8, #87B5C9)' }}
            >
              <span className="text-2xl">💬</span>
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-base font-semibold text-[#1A3448]">{t('dashboard', 'startSession')}</h3>
              <p className="m-0 text-[13px] text-[#6B7280]">{t('dashboard', 'startSessionSub')}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Card>

        {/* Streak */}
        {streak > 0 && (
          <Card className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="m-0 text-[15px] font-semibold text-[#1A3448]">
                  {streak} {t('dashboard', 'streakLabel')}
                </p>
                <p className="m-0 text-[13px] text-[#6B7280]">{t('dashboard', 'streakSub')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tip of the day */}
        <div
          className="rounded-[20px] p-4"
          style={{ background: '#FFF9F0', border: '1px solid #F5E6D3' }}
        >
          <p className="m-0 mb-1.5 text-[12px] font-semibold text-[#C4A98A] uppercase tracking-wide">
            {t('dashboard', 'tipTitle')}
          </p>
          <p className="m-0 text-sm text-[#1A3448] leading-relaxed">{todayTip}</p>
        </div>

        {/* Premium section */}
        {isPremium ? (
          <>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              style={{ background: 'linear-gradient(135deg, #EDF4F8, #F5EDE4)' } as React.CSSProperties}
              onClick={() => router.push('/dashboard/forecast')}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-lg">🔮</span>
                <h3 className="m-0 text-[15px] font-semibold text-[#1A3448]">{t('dashboard', 'forecastTitle')}</h3>
              </div>
              <p className="m-0 text-[13px] text-[#6B7280] leading-relaxed">
                {t('dashboard', 'forecastBody')} 🟡
              </p>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/dashboard/report')}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-lg">📊</span>
                <h3 className="m-0 text-[15px] font-semibold text-[#1A3448]">{t('dashboard', 'reportTitle')}</h3>
              </div>
              <div className="flex gap-1 mb-2">
                {[40, 55, 35, 60, 45, 50, 65].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-md opacity-70"
                    style={{
                      height: h,
                      background: h > 50 ? '#A8C8D8' : h > 40 ? '#C4A98A' : '#EF5350',
                    }}
                  />
                ))}
              </div>
              <p className="m-0 text-xs text-[#6B7280]">{t('dashboard', 'reportLink')}</p>
            </Card>
          </>
        ) : (
          <Card
            className="cursor-pointer relative overflow-hidden hover:shadow-md transition-shadow"
            onClick={() => router.push('/premium')}
          >
            <div className="absolute top-3 right-3 bg-[#1A3448] rounded-lg px-2.5 py-1 text-[11px] text-white font-semibold">
              {t('dashboard', 'premiumBadge')}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔮</span>
              <div>
                <h3 className="m-0 mb-1 text-[15px] font-semibold text-[#1A3448]">{t('dashboard', 'forecastLockedTitle')}</h3>
                <p className="m-0 text-[13px] text-[#6B7280]">
                  {t('dashboard', 'forecastLockedBody')}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
