'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { checkSubscriptionStatus } from '@/lib/subscription';

const FREE_FEATURES  = ['Sesi cerita harian (1x)', 'Morning check-in', 'Komunitas dasar'];
const PREMIUM_FEATURES = ['Sesi cerita tak terbatas', 'Mood Forecast mingguan', 'Laporan bulanan lengkap', 'Booking psikolog prioritas', 'Semua fitur Free'];

export default function SubscriptionPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      await checkSubscriptionStatus(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('is_premium, subscription_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      setIsPremium(data?.is_premium ?? false);
      setExpiresAt(data?.subscription_expires_at ?? null);
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Status Langganan" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ) : (
          <>
            {/* Current status */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: isPremium
                  ? 'linear-gradient(135deg, #FFD700, #FFA000)'
                  : 'linear-gradient(135deg, #1A3448, #2A4A60)',
              }}
            >
              <p className="text-4xl mb-2">{isPremium ? '👑' : '🌱'}</p>
              <h2 className="font-boogaloo text-[26px] text-white m-0">
                {isPremium ? 'MinDora Premium' : 'MinDora Free'}
              </h2>
              <p className="text-sm text-white/80 mt-1">
                {isPremium ? 'Kamu sudah berlangganan premium' : 'Tingkatkan untuk fitur penuh'}
              </p>
              {isPremium && expiresAt && (
                <p className="text-xs text-white/70 mt-2">
                  Berlaku sampai {new Date(expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Feature list */}
            <Card className="p-5">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                {isPremium ? 'Yang kamu dapatkan' : 'Fitur Free kamu'}
              </p>
              <div className="flex flex-col gap-2">
                {(isPremium ? PREMIUM_FEATURES : FREE_FEATURES).map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-base">{isPremium ? '✅' : '✓'}</span>
                    <span className="text-sm text-[#1A3448]">{f}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Locked features (if free) */}
            {!isPremium && (
              <Card className="p-5">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                  Tersedia di Premium
                </p>
                <div className="flex flex-col gap-2">
                  {PREMIUM_FEATURES.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 opacity-50">
                      <span className="text-base">🔒</span>
                      <span className="text-sm text-[#1A3448]">{f}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!isPremium && (
              <Button onClick={() => router.push('/premium')}>
                Upgrade ke Premium 👑
              </Button>
            )}

            {isPremium && (
              <div
                className="p-4 rounded-2xl text-sm text-[#6B7280] leading-relaxed text-center"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
              >
                Untuk mengelola langganan atau membatalkan, hubungi support MinDora.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
