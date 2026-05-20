'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, getInitial } from '@/lib/utils';

const PROFESSIONALS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Sarah Amalia',
    title: 'M.Psi, Psikolog',
    tier: 'Middle',
    specialization: 'Kecemasan & Stres Akademik',
    price: 110000,
    rating: 4.8,
    review_count: 32,
    available: true,
    avatar_color: '#A8C8D8',
    bio: 'Psikolog klinis dengan fokus pada kecemasan dan stres akademik. Berpengalaman mendampingi mahasiswa menghadapi tekanan kuliah dan menemukan keseimbangan hidup.',
    tags: ['Kecemasan', 'Stres', 'Mahasiswa', 'CBT'],
    university: 'Unair',
    session_count: 128,
    experience_years: 4,
    slots: ['Sen 10:00', 'Sen 14:00', 'Sel 09:00', 'Sel 13:00', 'Rab 10:00', 'Rab 15:00'],
  },
  '2': {
    id: '2',
    name: 'Dr. Reza Pratama',
    title: 'Sp.KJ, Psikiater',
    tier: 'Senior',
    specialization: 'Depresi & Gangguan Mood',
    price: 200000,
    rating: 4.9,
    review_count: 64,
    available: false,
    avatar_color: '#C4A98A',
    bio: 'Psikiater spesialis dengan pengalaman 10+ tahun dalam menangani depresi, gangguan bipolar, dan gangguan mood lainnya.',
    tags: ['Depresi', 'Bipolar', 'Gangguan Mood', 'Psikofarmakologi'],
    university: 'UI',
    session_count: 450,
    experience_years: 10,
    slots: [],
  },
  '3': {
    id: '3',
    name: 'Dinda Maharani',
    title: 'M.Psi, Psikolog',
    tier: 'Junior',
    specialization: 'Self-esteem & Hubungan',
    price: 80000,
    rating: 4.7,
    review_count: 18,
    available: true,
    avatar_color: '#B5D4A8',
    bio: 'Psikolog muda yang bersemangat membantu anak muda menemukan jati diri dan membangun hubungan yang sehat.',
    tags: ['Self-esteem', 'Hubungan', 'Identitas', 'Remaja'],
    university: 'UGM',
    session_count: 56,
    experience_years: 2,
    slots: ['Sen 13:00', 'Sel 10:00', 'Rab 09:00', 'Kam 14:00', 'Jum 10:00'],
  },
};

const SESSION_TYPES = ['Chat', 'Voice Call', 'Video Call'];

export default function PsikologProfilePage() {
  const router = useRouter();
  const params = useParams();
  const p = PROFESSIONALS[params.id as string];

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState('Video Call');

  if (!p) {
    return (
      <div className="mobile-shell bg-[#F5F5F5] flex flex-col items-center justify-center">
        <p className="text-[#6B7280]">Profesional tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#1A3448] underline">Kembali</button>
      </div>
    );
  }

  const handleBook = () => {
    if (selectedSlot === null) return;
    router.push(`/dashboard/booking?professional=${p.id}&slot=${encodeURIComponent(p.slots[selectedSlot])}&type=${selectedType}`);
  };

  return (
    <div className="mobile-shell bg-[#F5F5F5]">
      <div className="h-11" />
      <div className="flex items-center justify-between px-5 py-3">
        <button onClick={() => router.back()} className="p-1 bg-transparent border-none cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-5">
        {/* Avatar & name */}
        <div className="text-center mb-5">
          <div
            className="w-[88px] h-[88px] rounded-3xl mx-auto mb-3.5 flex items-center justify-center shadow-md"
            style={{ background: p.avatar_color }}
          >
            <span className="font-boogaloo text-4xl text-white">{getInitial(p.name)}</span>
          </div>
          <h2 className="font-boogaloo text-[22px] text-[#1A3448] m-0 mb-1">
            {p.name}, {p.title}
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[#4CAF50]">✅</span>
            <span className="text-[13px] text-[#6B7280]">SIPP Aktif</span>
            <span className="text-xs text-[#6B7280]">•</span>
            <span className="text-[13px] text-[#6B7280]">{p.experience_years} tahun pengalaman</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {p.tags.map((tag: string) => (
            <span key={tag} className="px-3.5 py-1.5 rounded-full bg-[#EDF4F8] text-[13px] text-[#1A3448] font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Bio */}
        <Card className="p-3.5 mb-3.5">
          <p className="m-0 text-sm text-[#1A3448] leading-relaxed">{p.bio}</p>
        </Card>

        {/* Stats */}
        <div className="flex gap-2.5 mb-4">
          {[
            { icon: '⭐', val: p.rating, label: 'Rating' },
            { icon: '💬', val: p.session_count, label: 'Sesi' },
            { icon: '🎓', val: p.university, label: 'Univ.' },
          ].map((s, i) => (
            <Card key={i} className="flex-1 p-3 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="m-0 mt-1 text-base font-bold text-[#1A3448]">{s.val}</p>
              <p className="m-0 text-[11px] text-[#6B7280]">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Price */}
        <Card className="p-3.5 mb-3.5 bg-[#EDF4F8]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">Biaya per sesi</span>
            <span className="text-lg font-bold text-[#1A3448]">{formatCurrency(p.price)}</span>
          </div>
          <p className="m-0 mt-1 text-xs text-[#6B7280]">60 menit via Zoom</p>
        </Card>

        {/* Session type */}
        <p className="text-sm font-semibold text-[#1A3448] mb-2">Tipe Sesi</p>
        <div className="flex gap-2 mb-4">
          {SESSION_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className="flex-1 py-2.5 px-2 rounded-xl border-none cursor-pointer text-[13px] font-medium font-poppins transition-all"
              style={{
                background: selectedType === t ? '#1A3448' : '#fff',
                color: selectedType === t ? '#fff' : '#6B7280',
                boxShadow: selectedType !== t ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Schedule */}
        <p className="text-sm font-semibold text-[#1A3448] mb-2">Jadwal Tersedia</p>
        {p.slots.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {p.slots.map((s: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(i)}
                className="px-4 py-2.5 rounded-xl cursor-pointer text-[13px] font-medium font-poppins transition-all"
                style={{
                  background: selectedSlot === i ? '#1A3448' : '#fff',
                  color: selectedSlot === i ? '#fff' : '#1A3448',
                  border: selectedSlot === i ? 'none' : '1.5px solid #E5E7EB',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280] mb-6">Tidak ada jadwal tersedia saat ini.</p>
        )}

        <Button onClick={handleBook} disabled={selectedSlot === null || !p.available}>
          {p.available ? 'Buat Janji Sekarang' : 'Sedang Tidak Tersedia'}
        </Button>
      </div>
    </div>
  );
}
