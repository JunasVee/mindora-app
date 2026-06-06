'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Script from 'next/script';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
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

const PROFESSIONAL_DATA: Record<string, { name: string; price: number; avatar_color: string }> = {
  '1': { name: 'Sarah Amalia, M.Psi', price: 110000, avatar_color: '#A8C8D8' },
  '2': { name: 'Dr. Reza Pratama, Sp.KJ', price: 200000, avatar_color: '#C4A98A' },
  '3': { name: 'Dinda Maharani, M.Psi', price: 80000, avatar_color: '#B5D4A8' },
};

type PaymentState = 'idle' | 'creating' | 'waiting' | 'success' | 'pending' | 'error';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const professionalId = searchParams.get('professional') ?? '1';
  const slot = searchParams.get('slot') ?? 'Sen 10:00';
  const sessionType = searchParams.get('type') ?? 'Video Call';

  const professional = PROFESSIONAL_DATA[professionalId] ?? PROFESSIONAL_DATA['1'];
  const [agreed, setAgreed] = useState(false);
  const [payState, setPayState] = useState<PaymentState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const platformFee = Math.round(professional.price * 0.15);
  const total = professional.price;

  const handleConfirm = async () => {
    if (!window.snap) {
      setErrorMsg('Komponen pembayaran belum siap. Coba refresh halaman.');
      return;
    }

    setPayState('creating');
    setErrorMsg('');

    try {
      // 1. Create Snap token from our backend
      const res = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking',
          amount: total,
          item_name: `Sesi ${sessionType} - ${professional.name}`,
          professional_id: professionalId,
          time_slot: slot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        setErrorMsg(data.error ?? 'Gagal memulai pembayaran.');
        setPayState('error');
        return;
      }

      // 2. Open Snap payment popup
      setPayState('waiting');
      window.snap.pay(data.token, {
        onSuccess: () => {
          setPayState('success');
        },
        onPending: () => {
          // Payment initiated but not yet settled (e.g. bank transfer)
          setPayState('pending');
        },
        onError: () => {
          setErrorMsg('Pembayaran gagal. Silakan coba metode lain.');
          setPayState('error');
        },
        onClose: () => {
          // User closed popup without paying
          if (payState === 'waiting') setPayState('idle');
        },
      });
    } catch {
      setErrorMsg('Terjadi kesalahan. Coba lagi ya.');
      setPayState('error');
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (payState === 'success') {
    return (
      <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[72px] mb-4">🎉</span>
          <h2 className="font-boogaloo text-[26px] text-[#1A3448] mb-3">Pembayaran Berhasil!</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Jadwalmu dengan <strong>{professional.name}</strong> sudah terkonfirmasi.
            Detail sesi akan dikirimkan via email.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // ── Pending screen (e.g. bank transfer waiting) ────────────────────────
  if (payState === 'pending') {
    return (
      <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[72px] mb-4">⏳</span>
          <h2 className="font-boogaloo text-[26px] text-[#1A3448] mb-3">Menunggu Pembayaran</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Selesaikan pembayaranmu sesuai instruksi yang dikirimkan.
            Janji akan dikonfirmasi otomatis setelah pembayaran diterima.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // ── Main booking form ──────────────────────────────────────────────────
  return (
    <>
      {/* Load Snap.js — only rendered on this page, strategy afterInteractive = non-blocking */}
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <AppHeader title="Konfirmasi Sesi" />

        <div className="flex-1 overflow-auto scrollbar-none px-5 pb-5">
          {/* Sandbox notice — remove this block before going to production */}
          {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith('SB-') && (
            <div className="px-3 py-3 bg-amber-50 rounded-xl mb-4 border border-amber-200">
              <p className="text-[12px] font-semibold text-amber-700 mb-1">🧪 Mode Sandbox (Testing)</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                Gunakan kartu uji: <strong>4811 1111 1111 1114</strong> · Expired: bebas · CVV: <strong>123</strong> · OTP: <strong>112233</strong>
              </p>
            </div>
          )}

          {/* Session detail */}
          <Card className="p-4 mb-4">
            <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3.5">
              Detail Sesi
            </h3>
            <div className="flex flex-col gap-3">
              {[
                ['Psikolog', professional.name],
                ['Jadwal', slot],
                ['Tipe Sesi', sessionType],
                ['Durasi', '60 menit'],
                ['Biaya', formatCurrency(total)],
              ].map(([label, value], i, arr) => (
                <div key={label}>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6B7280]">{label}</span>
                    <span
                      className="text-sm text-[#1A3448]"
                      style={{ fontWeight: label === 'Biaya' ? 700 : 500 }}
                    >
                      {value}
                    </span>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100 mt-3" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Payment info */}
          <Card className="p-4 mb-4" style={{ background: '#EDF4F8' } as React.CSSProperties}>
            <div className="flex items-start gap-2.5">
              <span className="text-lg">💳</span>
              <div>
                <p className="m-0 mb-1 text-sm font-semibold text-[#1A3448]">
                  Pilih metode pembayaran di langkah berikutnya
                </p>
                <p className="m-0 text-[13px] text-[#6B7280] leading-relaxed">
                  GoPay, OVO, DANA, QRIS, Transfer Bank, Kartu Kredit/Debit, dan lainnya tersedia
                  di halaman pembayaran.
                </p>
              </div>
            </div>
          </Card>

          {/* Fee note */}
          <div className="px-3 py-3 bg-[#F9FAFB] rounded-xl mb-4 text-xs text-[#6B7280] leading-relaxed">
            Sudah termasuk komisi platform 15% ({formatCurrency(platformFee)})
          </div>

          {/* Error */}
          {payState === 'error' && errorMsg && (
            <div className="px-3 py-3 bg-red-50 rounded-xl mb-4 text-xs text-red-600 leading-relaxed border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Terms */}
          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-2.5 mb-6 bg-transparent border-none cursor-pointer p-0"
          >
            <div
              className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0"
              style={{
                borderColor: agreed ? '#1A3448' : '#D1D5DB',
                background: agreed ? '#1A3448' : '#fff',
              }}
            >
              {agreed && (
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-[#6B7280] text-left font-poppins">
              Saya setuju dengan kebijakan pembatalan sesi
            </span>
          </button>

          <Button
            onClick={handleConfirm}
            disabled={!agreed || payState === 'creating' || payState === 'waiting'}
          >
            {payState === 'creating'
              ? 'Mempersiapkan...'
              : payState === 'waiting'
              ? 'Menunggu Pembayaran...'
              : 'Lanjut ke Pembayaran'}
          </Button>
          <Button variant="ghost" onClick={() => router.back()} className="mt-2.5">
            Kembali
          </Button>
        </div>
      </div>
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#F5F5F5] flex items-center justify-center"><p>Memuat...</p></div>}>
      <BookingContent />
    </Suspense>
  );
}
