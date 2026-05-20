'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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

const PAY_METHODS = [
  { id: 'gopay', name: 'GoPay', color: '#00AED6' },
  { id: 'ovo', name: 'OVO', color: '#4C3494' },
  { id: 'dana', name: 'DANA', color: '#108EE9' },
  { id: 'bank_bca', name: 'Transfer Bank — BCA', color: '#003D79' },
  { id: 'cc', name: 'Kartu Kredit/Debit', color: '#333' },
];

export default function PremiumPage() {
  const router = useRouter();
  const [step, setStep] = useState<'paywall' | 'payment' | 'success'>('paywall');
  const [method, setMethod] = useState('gopay');
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    // Integrate real payment here (Midtrans/Xendit)
    setTimeout(() => {
      setPaying(false);
      setStep('success');
    }, 1500);
  };

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

  if (step === 'payment') {
    return (
      <div className="mobile-shell bg-[#F5F5F5]">
        <div className="h-11" />
        <AppHeader title="Pembayaran" onBack={() => setStep('paywall')} />

        <div className="flex-1 overflow-auto scrollbar-none px-5 pb-5">
          {/* Plan summary */}
          <Card className="p-3.5 mb-5 bg-[#EDF4F8]">
            <div className="flex items-center justify-between">
              <div>
                <p className="m-0 mb-1 text-[15px] font-semibold text-[#1A3448]">Premium MinDora</p>
                <p className="m-0 text-[13px] text-[#6B7280]">Langganan bulanan</p>
              </div>
              <span className="text-lg font-bold text-[#1A3448]">Rp 29.000</span>
            </div>
          </Card>

          <p className="text-sm font-semibold text-[#1A3448] mb-3">Pilih Metode Pembayaran</p>

          <div className="flex flex-col gap-2 mb-6">
            {PAY_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl cursor-pointer transition-all border-2"
                style={{ borderColor: method === m.id ? '#1A3448' : '#E5E7EB' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: m.color }}
                >
                  <span className="text-white text-sm font-bold">{m.name[0]}</span>
                </div>
                <span className="flex-1 text-left text-sm font-medium text-[#1A3448] font-poppins">{m.name}</span>
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ border: method === m.id ? `6px solid #1A3448` : '2px solid #D1D5DB' }}
                />
              </button>
            ))}
          </div>

          <Card className="p-3.5 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-[#1A3448]">Total</span>
              <span className="text-xl font-bold text-[#1A3448]">Rp 29.000</span>
            </div>
          </Card>

          <Button onClick={handlePay} disabled={paying}>
            {paying ? 'Memproses...' : 'Bayar Sekarang'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="text-sm">🔒</span>
            <span className="text-xs text-[#6B7280]">Pembayaran aman & terenkripsi</span>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          className="rounded-[20px] p-4 mb-6"
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

        <Button onClick={() => setStep('payment')}>
          Mulai Premium — Rp 29.000/bln
        </Button>
        <button
          onClick={() => router.back()}
          className="w-full text-center mt-3 py-3 bg-transparent border-none text-[13px] text-[#6B7280] cursor-pointer font-poppins"
        >
          Nanti aja
        </button>
      </div>
    </div>
  );
}
