'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const PROFESSIONAL_DATA: Record<string, any> = {
  '1': { name: 'Sarah Amalia, M.Psi', price: 110000, avatar_color: '#A8C8D8' },
  '2': { name: 'Dr. Reza Pratama, Sp.KJ', price: 200000, avatar_color: '#C4A98A' },
  '3': { name: 'Dinda Maharani, M.Psi', price: 80000, avatar_color: '#B5D4A8' },
};

const PAY_METHODS = [
  { id: 'gopay', name: 'GoPay', color: '#00AED6' },
  { id: 'ovo', name: 'OVO', color: '#4C3494' },
  { id: 'dana', name: 'DANA', color: '#108EE9' },
  { id: 'bank', name: 'Transfer Bank', color: '#1A3448' },
];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const professionalId = searchParams.get('professional') ?? '1';
  const slot = searchParams.get('slot') ?? 'Sen 10:00';
  const sessionType = searchParams.get('type') ?? 'Video Call';

  const professional = PROFESSIONAL_DATA[professionalId];
  const [payMethod, setPayMethod] = useState('gopay');
  const [agreed, setAgreed] = useState(false);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);

  const platformFee = Math.round(professional.price * 0.15);
  const total = professional.price;

  const handleConfirm = async () => {
    setBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: professionalId,
          date: new Date().toISOString(),
          time_slot: slot,
        }),
      });
      if (res.ok) setDone(true);
    } catch {
      // still show done in demo
      setDone(true);
    } finally {
      setBooking(false);
    }
  };

  if (done) {
    return (
      <div className="mobile-shell bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[72px] mb-4">🎉</span>
          <h2 className="font-boogaloo text-[26px] text-[#1A3448] mb-3">Janji Dibuat!</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Jadwalmu dengan <strong>{professional.name}</strong> sudah dikonfirmasi. Kamu akan menerima detail via email.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-shell bg-[#F5F5F5]">
      <div className="h-11" />
      <AppHeader title="Konfirmasi Sesi" />

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-5">
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

        {/* Payment methods */}
        <p className="text-sm font-semibold text-[#1A3448] mb-2.5">Metode Pembayaran</p>
        <div className="flex flex-col gap-2 mb-4">
          {PAY_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setPayMethod(m.id)}
              className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl cursor-pointer transition-all border-2"
              style={{ borderColor: payMethod === m.id ? '#1A3448' : '#E5E7EB' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: m.color }}
              >
                <span className="text-white text-xs font-bold">{m.name[0]}</span>
              </div>
              <span className="flex-1 text-left text-sm font-medium text-[#1A3448] font-poppins">{m.name}</span>
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  border: payMethod === m.id ? `6px solid #1A3448` : '2px solid #D1D5DB',
                }}
              />
            </button>
          ))}
        </div>

        {/* Fee note */}
        <div className="px-3 py-3 bg-[#F9FAFB] rounded-xl mb-4 text-xs text-[#6B7280] leading-relaxed">
          Termasuk komisi platform 15% ({formatCurrency(platformFee)})
        </div>

        {/* Terms */}
        <button
          onClick={() => setAgreed(!agreed)}
          className="flex items-center gap-2.5 mb-6 bg-transparent border-none cursor-pointer p-0"
        >
          <div
            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
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

        <Button onClick={handleConfirm} disabled={!agreed || booking}>
          {booking ? 'Memproses...' : 'Konfirmasi & Bayar'}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} className="mt-2.5">
          Kembali
        </Button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="mobile-shell bg-[#F5F5F5] flex items-center justify-center"><p>Memuat...</p></div>}>
      <BookingContent />
    </Suspense>
  );
}
