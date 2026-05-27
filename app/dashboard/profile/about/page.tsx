'use client';

import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { MinDoraIcon } from '@/components/Logo';

const TEAM = [
  { name: 'Tim Produk', role: 'Product & Design' },
  { name: 'Tim Teknologi', role: 'Engineering' },
  { name: 'Tim Konseling', role: 'Mental Health Advisors' },
];

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="About MinDora" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center py-4 gap-3">
          <MinDoraIcon size={72} withBackground />
          <h2 className="font-boogaloo text-[26px] text-[#1A3448] m-0">MinDora</h2>
          <p className="text-sm text-[#6B7280] text-center leading-relaxed max-w-xs">
            Teman curhat digital untuk anak muda Indonesia yang ingin menjaga kesehatan mentalnya.
          </p>
          <span
            className="text-[12px] px-3 py-1 rounded-full font-semibold"
            style={{ background: '#EDF4F8', color: '#1A3448' }}
          >
            Versi 1.0.0
          </span>
        </div>

        {/* Mission */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Misi Kami</p>
          <p className="text-sm text-[#1A3448] leading-relaxed m-0">
            MinDora hadir untuk membantu anak muda Indonesia lebih mudah mengakses dukungan kesehatan mental
            — tanpa stigma, tanpa biaya tersembunyi, dan kapan saja kamu membutuhkannya.
          </p>
        </Card>

        {/* Disclaimer */}
        <div
          className="p-4 rounded-2xl text-sm leading-relaxed"
          style={{ background: '#FFF9F0', border: '1px solid #F5E6D3' }}
        >
          <p className="font-semibold text-[#C4A98A] mb-1">⚠️ Perhatian Penting</p>
          <p className="text-[#6B7280] m-0">
            MinDora adalah platform pendukung kesehatan mental, <strong>bukan</strong> pengganti terapi atau konsultasi
            profesional. Jika kamu dalam situasi krisis, segera hubungi hotline:
          </p>
          <p className="mt-2 font-semibold text-[#1A3448]">📞 Into The Light: 119 ext 8</p>
        </div>

        {/* Team */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Tim MinDora</p>
          <div className="flex flex-col gap-3">
            {TEAM.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EDF4F8] flex items-center justify-center text-sm">
                  👤
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[#1A3448]">{t.name}</p>
                  <p className="m-0 text-[12px] text-[#6B7280]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-[12px] text-[#9CA3AF]">
          © 2025 MinDora. Dibuat dengan 💙 untuk Indonesia.
        </p>
      </div>
    </div>
  );
}
