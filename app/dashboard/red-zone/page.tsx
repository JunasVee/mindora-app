'use client';

import { useRouter } from 'next/navigation';
import { MinDoraIcon } from '@/components/Logo';
import Button from '@/components/ui/Button';

export default function RedZonePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative" style={{ background: '#FFF8F0' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: 'radial-gradient(circle at 50% 30%, #C4A98A, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[340px] flex flex-col items-center">
        {/* Avatar */}
        <div
          className="w-24 h-24 rounded-3xl overflow-hidden mb-5"
          style={{ boxShadow: '0 8px 32px rgba(196,169,138,0.3)' }}
        >
          <MinDoraIcon size={96} withBackground />
        </div>

        <h1 className="font-boogaloo text-[26px] text-[#1A3448] mb-3 leading-snug">
          MinDora khawatir sama kondisimu sekarang.
        </h1>
        <p className="text-base text-[#6B7280] mb-8 leading-relaxed">
          Kamu nggak harus hadapin ini sendirian. Ada orang-orang yang siap bantu kamu.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button onClick={() => router.push('/dashboard/psikolog')}>
            Hubungi Psikiater Mitra Sekarang
          </Button>

          <a
            href="tel:021-7884-5555"
            className="w-full py-4 text-center rounded-2xl text-base font-semibold font-poppins cursor-pointer transition-colors no-underline"
            style={{
              background: 'transparent',
              color: '#8B6914',
              border: '1.5px solid #C4A98A',
            }}
          >
            Hubungi Into The Light (021-7884-5555)
          </a>

          <button
            onClick={() => router.push('/dashboard/chat')}
            className="bg-transparent border-none text-sm text-[#6B7280] cursor-pointer font-poppins"
          >
            Atau, cerita lebih lanjut ke MinDora dulu?
          </button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-transparent border-none text-xs text-gray-300 cursor-pointer font-poppins mt-6"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
