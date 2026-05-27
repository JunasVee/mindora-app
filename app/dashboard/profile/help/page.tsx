'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';

const FAQS = [
  {
    q: 'Apa itu MinDora?',
    a: 'MinDora adalah teman curhat digital berbasis AI untuk anak muda Indonesia. Kamu bisa cerita tentang apa yang kamu rasakan, dan MinDora akan membantu kamu mengurai pikiran.',
  },
  {
    q: 'Apakah MinDora bisa menggantikan psikolog?',
    a: 'Tidak. MinDora adalah teman pendukung, bukan pengganti profesional. Jika kamu merasa membutuhkan bantuan lebih lanjut, kami mendorong kamu untuk berkonsultasi dengan psikolog.',
  },
  {
    q: 'Apakah chat saya privat?',
    a: 'Ya. Percakapan kamu bersifat privat dan tersimpan di akun kamu saja. Tim MinDora tidak membaca isi chat kamu.',
  },
  {
    q: 'Bagaimana cara menghapus akun saya?',
    a: 'Untuk menghapus akun, hubungi tim kami melalui email support@mindora.id. Kami akan memproses permintaan dalam 7 hari kerja.',
  },
  {
    q: 'Apa bedanya Free dan Premium?',
    a: 'Free mendapat 1 sesi chat per hari dan check-in harian. Premium mendapat sesi tak terbatas, Mood Forecast mingguan, laporan bulanan, dan prioritas booking psikolog.',
  },
  {
    q: 'Chat history tidak muncul. Kenapa?',
    a: 'Riwayat sesi hanya tersimpan jika kamu memilih "Simpan sesi ini" saat mengakhiri sesi. Sesi yang sedang berjalan tersimpan sementara dan bisa dilanjutkan saat kamu kembali ke halaman chat.',
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Help & Support" />

      <div className="px-5 pb-8 flex flex-col gap-4">
        <p className="text-sm text-[#6B7280] leading-relaxed m-0">
          Pertanyaan yang sering ditanyakan. Tidak ketemu jawabannya? Hubungi kami.
        </p>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer text-left"
              >
                <span className="text-sm font-semibold text-[#1A3448] pr-2">{faq.q}</span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {open === i && (
                <div className="px-4 pb-4">
                  <p className="text-[13px] text-[#6B7280] leading-relaxed m-0">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Hubungi Kami</p>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@mindora.id"
              className="flex items-center gap-3 no-underline"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EDF4F8] flex items-center justify-center text-lg">📧</div>
              <div>
                <p className="m-0 text-sm font-semibold text-[#1A3448]">Email Support</p>
                <p className="m-0 text-[12px] text-[#6B7280]">support@mindora.id</p>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF4F8] flex items-center justify-center text-lg">📞</div>
              <div>
                <p className="m-0 text-sm font-semibold text-[#1A3448]">Hotline Krisis</p>
                <p className="m-0 text-[12px] text-[#6B7280]">Into The Light: 119 ext 8</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
