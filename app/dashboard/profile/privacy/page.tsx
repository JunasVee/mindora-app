'use client';

import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';

const SECTIONS = [
  {
    title: '1. Data yang Kami Kumpulkan',
    content:
      'Kami mengumpulkan data yang kamu berikan secara langsung: nama, email, dan data aktivitas di aplikasi (check-in harian, sesi chat, dan mood). Kami tidak mengumpulkan data di luar aplikasi.',
  },
  {
    title: '2. Bagaimana Data Digunakan',
    content:
      'Data digunakan untuk mempersonalisasi pengalaman kamu, menghasilkan laporan mood, dan meningkatkan layanan MinDora. Kami tidak menjual data kamu ke pihak ketiga.',
  },
  {
    title: '3. Keamanan Data',
    content:
      'Semua data tersimpan di server yang dienkripsi (Supabase PostgreSQL). Komunikasi antara aplikasi dan server menggunakan HTTPS/TLS. Percakapan kamu bersifat privat dan tidak dibaca oleh tim kami.',
  },
  {
    title: '4. AI & Privasi Chat',
    content:
      'Pesan chat dikirim ke Google Gemini API untuk menghasilkan respons. Google memiliki kebijakan privasi tersendiri terkait pemrosesan ini. MinDora tidak menyimpan pesan untuk melatih model AI.',
  },
  {
    title: '5. Hak Kamu',
    content:
      'Kamu berhak mengakses, mengoreksi, atau menghapus data pribadimu kapan saja. Hubungi kami di support@mindora.id untuk permintaan terkait data.',
  },
  {
    title: '6. Perubahan Kebijakan',
    content:
      'Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui notifikasi dalam aplikasi.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Privacy Policy" />

      <div className="px-5 pb-8 flex flex-col gap-4">
        <div
          className="p-4 rounded-2xl text-[13px] text-[#6B7280]"
          style={{ background: '#EDF4F8' }}
        >
          Terakhir diperbarui: Januari 2025
        </div>

        <p className="text-sm text-[#6B7280] leading-relaxed m-0">
          MinDora berkomitmen menjaga privasi dan keamanan data pengguna. Kebijakan ini menjelaskan
          bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi kamu.
        </p>

        {SECTIONS.map((s, i) => (
          <Card key={i} className="p-4">
            <p className="m-0 mb-2 text-sm font-semibold text-[#1A3448]">{s.title}</p>
            <p className="m-0 text-[13px] text-[#6B7280] leading-relaxed">{s.content}</p>
          </Card>
        ))}

        <p className="text-center text-[12px] text-[#9CA3AF] mt-2">
          Pertanyaan? Hubungi kami di{' '}
          <a href="mailto:support@mindora.id" className="text-[#1A3448] font-medium no-underline">
            support@mindora.id
          </a>
        </p>
      </div>
    </div>
  );
}
