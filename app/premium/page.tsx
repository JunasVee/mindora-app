'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { SNAP_JS_URL } from '@/lib/midtrans';

// Extend Window so TypeScript knows about window.snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const FEATURES = [
  { name: 'Chat AI', free: true },
  { name: 'Morning Check-in', free: true },
  { name: 'Chat AI Unlimited', free: false },
  { name: 'Semua Template Reframing', free: false },
  { name: 'Koneksi ke Psikolog/Psikiater', free: false },
  { name: 'Mood Forecasting Mingguan', free: false },
  { name: 'Laporan Kondisi Bulanan', free: false },
  { name: 'Prioritas Smart Routing Zona Merah', free: false },
];

const PREMIUM_PRICE = 29000;

type Step = 'paywall' | 'success' | 'pending';

export default function PremiumPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('paywall');
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpgrade = async () => {
    if (!window.snap) {
      setErrorMsg('Komponen pembayaran belum siap. Coba refresh halaman.');
      return;
    }

    setPaying(true);
    setErrorMsg('');

    try {
      // 1. Get Snap token from backend
      const res = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'premium',
          amount: PREMIUM_PRICE,
          item_name: 'MinDora Premium — Langganan Bulanan',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        setErrorMsg(data.error ?? 'Gagal memulai pembayaran.');
        setPaying(false);
        return;
      }

      // 2. Open Snap popup
      window.snap.pay(data.token, {
        onSuccess: async () => {
          // Optimistic update: mark premium immediately so user doesn't wait for webhook
          try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('profiles').update({ is_premium: true }).eq('id', user.id);
            }
          } catch { /* webhook will handle it as fallback */ }
          setPaying(false);
          setStep('success');
        },
        onPending: () => {
          setPaying(false);
          setStep('pending');
        },
        onError: () => {
          setErrorMsg('Pembayaran gagal. Silakan coba lagi.');
          setPaying(false);
        },
        onClose: () => {
          setPaying(false);
        },
      });
    } catch {
      setErrorMsg('Terjadi kesalahan. Coba lagi ya.');
      setPaying(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="mobile-shell bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[72px] mb-4">✨</span>
          <h2 className="font-boogaloo text-[28px] text-[#1A3448] mb-3">Selamat, kamu Premium!</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Semua fitur Premium sudah aktif. Yuk mulai eksplorasi Mood Forecast dan fitur lainnya!
          </p>
          <Button onClick={() => router.replace('/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // ── Pending screen (bank transfer / virtual account) ───────────────────
  if (step === 'pending') {
    return (
      <div className="mobile-shell bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[72px] mb-4">⏳</span>
          <h2 className="font-boogaloo text-[26px] text-[#1A3448] mb-3">Menunggu Pembayaran</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Selesaikan pembayaranmu sesuai instruksi yang dikirimkan.
            Akses Premium akan aktif otomatis setelah pembayaran diterima.
          </p>
          <Button onClick={() => router.replace('/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // ── Paywall screen ─────────────────────────────────────────────────────
  return (
    <>
      {/* Load Snap.js — non-blocking, loaded after page is interactive */}
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="mobile-shell bg-[#F5F5F5]">
        <div className="h-11" />
        <AppHeader title="Upgrade" />

        <div className="flex-1 overflow-auto scrollbar-none px-5 pb-5">
          {/* Hero */}
          <div
            className="text-center mb-6 p-7 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #1A3448, #2A5A70)' }}
          >
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #A8C8D8, #C4A98A)' }}
            >
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="font-boogaloo text-[28px] text-white m-0 mb-2">MinDora Premium</h2>
            <p className="text-[32px] font-bold text-white m-0 mb-1">
              Rp 29.000<span className="text-base font-normal text-[#A8C8D8]"> / bulan</span>
            </p>
          </div>

          {/* Feature comparison */}
          <Card className="p-4 mb-4">
            <div className="flex justify-end gap-0 mb-3 pr-1">
              <span className="w-[52px] text-center text-xs font-semibold text-[#6B7280]">Free</span>
              <span className="w-[52px] text-center text-xs font-semibold text-[#1A3448]">Premium</span>
            </div>
            {FEATURES.map((f, i) => (
              <div key={i}>
                <div className="flex items-center py-2.5">
                  <span className="flex-1 text-sm text-[#1A3448]">{f.name}</span>
                  <span className="w-[52px] text-center text-base">{f.free ? '✅' : '🔒'}</span>
                  <span className="w-[52px] text-center text-base">✅</span>
                </div>
                {i < FEATURES.length - 1 && <div className="h-px bg-gray-100" />}
              </div>
            ))}
          </Card>

          {/* Testimonial */}
          <div
            className="rounded-[20px] p-4 mb-5"
            style={{ background: '#FFF9F0', border: '1px solid #F5E6D3' }}
          >
            <div className="flex gap-2.5">
              <span className="text-3xl">💬</span>
              <div>
                <p className="m-0 mb-2 text-sm text-[#1A3448] leading-relaxed italic">
                  "Mood Forecast-nya bener-bener ngebantu aku prepare sebelum minggu berat. Worth it banget!"
                </p>
                <p className="m-0 text-[13px] font-semibold text-[#1A3448]">— Rina, Mahasiswi UI</p>
              </div>
            </div>
          </div>

          {/* Sandbox notice — remove this block before going to production */}
          {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith('SB-') && (
            <div className="px-3 py-3 bg-amber-50 rounded-xl mb-4 border border-amber-200">
              <p className="text-[12px] font-semibold text-amber-700 mb-1">🧪 Mode Sandbox (Testing)</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                Gunakan kartu uji: <strong>4811 1111 1111 1114</strong> · Expired: bebas · CVV: <strong>123</strong> · OTP: <strong>112233</strong>
              </p>
            </div>
          )}

          {/* Payment methods note */}
          <div className="flex items-center justify-center gap-2 mb-4 text-[12px] text-[#6B7280]">
            <span>💳</span>
            <span>GoPay · OVO · DANA · QRIS · Bank Transfer · Kartu Kredit</span>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="px-3 py-3 bg-red-50 rounded-xl mb-4 text-xs text-red-600 leading-relaxed border border-red-100">
              {errorMsg}
            </div>
          )}

          <Button onClick={handleUpgrade} disabled={paying}>
            {paying ? 'Mempersiapkan...' : 'Mulai Premium — Rp 29.000/bln'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-3 mb-3">
            <span className="text-sm">🔒</span>
            <span className="text-xs text-[#6B7280]">Pembayaran aman via MidTrans</span>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full text-center py-3 bg-transparent border-none text-[13px] text-[#6B7280] cursor-pointer font-poppins"
          >
            Nanti aja
          </button>
        </div>
      </div>
    </>
  );
}
