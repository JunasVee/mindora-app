'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import { formatCurrency, getInitial } from '@/lib/utils';
import type { Professional } from '@/types';

const FILTER_OPTIONS = ['Semua', 'Psikolog', 'Psikiater', 'Tersedia'] as const;

const TIER_STYLES = {
  Senior: { bg: '#FFF0E0', color: '#E65100' },
  Middle: { bg: '#E8F5E9', color: '#2E7D32' },
  Junior: { bg: '#EDF4F8', color: '#1565C0' },
};

// Seeded data for demo
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Sarah Amalia',
    title: 'M.Psi, Psikolog',
    type: 'Psikolog',
    tier: 'Middle',
    specialization: 'Kecemasan & Stres Akademik',
    price: 110000,
    rating: 4.8,
    review_count: 32,
    available: true,
    avatar_color: '#A8C8D8',
  },
  {
    id: '2',
    name: 'Dr. Reza Pratama',
    title: 'Sp.KJ, Psikiater',
    type: 'Psikiater',
    tier: 'Senior',
    specialization: 'Depresi & Gangguan Mood',
    price: 200000,
    rating: 4.9,
    review_count: 64,
    available: false,
    avatar_color: '#C4A98A',
  },
  {
    id: '3',
    name: 'Dinda Maharani',
    title: 'M.Psi, Psikolog',
    type: 'Psikolog',
    tier: 'Junior',
    specialization: 'Self-esteem & Hubungan',
    price: 80000,
    rating: 4.7,
    review_count: 18,
    available: true,
    avatar_color: '#B5D4A8',
  },
];

export default function PsikologPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<typeof FILTER_OPTIONS[number]>('Semua');
  const [search, setSearch] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);

  const filtered = professionals.filter(p => {
    if (filter === 'Psikolog' && p.type !== 'Psikolog') return false;
    if (filter === 'Psikiater' && p.type !== 'Psikiater') return false;
    if (filter === 'Tersedia' && !p.available) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.specialization.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="h-11" />
      <AppHeader title="Temukan Profesional" showBack={false} />

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-24">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] mb-3.5 focus-within:border-[#1A3448] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau spesialisasi..."
            className="flex-1 border-none bg-transparent outline-none text-sm font-poppins text-[#1A3448] placeholder:text-gray-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-5 overflow-auto scrollbar-none">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full border-none cursor-pointer text-[13px] font-medium font-poppins whitespace-nowrap transition-all"
              style={{
                background: filter === f ? '#1A3448' : '#fff',
                color: filter === f ? '#fff' : '#6B7280',
                boxShadow: filter !== f ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3.5">
          {filtered.map(p => {
            const tierStyle = TIER_STYLES[p.tier];
            return (
              <Card
                key={p.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/psikolog/${p.id}`)}
              >
                <div className="flex gap-3.5">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: p.avatar_color }}
                  >
                    <span className="font-boogaloo text-2xl text-white">{getInitial(p.name)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name & tier */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="m-0 text-[15px] font-semibold text-[#1A3448] truncate">{p.name}</h3>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0"
                        style={{ background: tierStyle.bg, color: tierStyle.color }}
                      >
                        {p.tier}
                      </span>
                    </div>

                    <p className="m-0 mb-1 text-xs text-[#6B7280]">{p.title}</p>
                    <p className="m-0 mb-2 text-[13px] text-[#1A3448]">{p.specialization}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="text-[13px] text-amber-500">⭐ {p.rating}</span>
                      <span className="text-xs text-[#6B7280]">({p.review_count} ulasan)</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: p.available ? '#4CAF50' : '#EF5350' }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: p.available ? '#4CAF50' : '#EF5350' }}
                        >
                          {p.available ? 'Tersedia' : 'Sedang Sibuk'}
                        </span>
                      </div>
                    </div>

                    {/* Price + action */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1A3448]">
                        {formatCurrency(p.price)} / sesi
                      </span>
                      <button
                        className="px-4 py-2 bg-[#1A3448] text-white border-none rounded-xl text-xs font-semibold cursor-pointer font-poppins transition-opacity"
                        style={{ opacity: p.available ? 1 : 0.5 }}
                        onClick={e => {
                          e.stopPropagation();
                          if (p.available) router.push(`/dashboard/psikolog/${p.id}`);
                        }}
                      >
                        Buat Janji
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl">🔍</span>
              <p className="mt-3 text-[#6B7280] text-sm">Tidak ada profesional yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
