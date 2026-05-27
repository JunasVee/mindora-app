'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { generateForecast } from '@/lib/forecast';
import type { Emotion } from '@/types';

// Sample data for demo — replace with real API call
const SAMPLE_MOODS = [
  { date: '2026-05-14', emotion: 'Senang' as Emotion, sleep_quality: 4 },
  { date: '2026-05-15', emotion: 'Biasa aja' as Emotion, sleep_quality: 3 },
  { date: '2026-05-16', emotion: 'Cemas' as Emotion, sleep_quality: 3 },
  { date: '2026-05-17', emotion: 'Cemas' as Emotion, sleep_quality: 2 },
  { date: '2026-05-18', emotion: 'Biasa aja' as Emotion, sleep_quality: 4 },
  { date: '2026-05-19', emotion: 'Senang' as Emotion, sleep_quality: 4 },
  { date: '2026-05-20', emotion: 'Senang' as Emotion, sleep_quality: 5 },
];

const EMOTION_COLORS: Record<Emotion, string> = {
  'Senang': '#4CAF50',
  'Biasa aja': '#78909C',
  'Cemas': '#FFC107',
  'Sedih': '#FF9800',
  'Frustrasi': '#EF5350',
  'Overwhelmed': '#E53935',
};

const EMOTION_EMOJIS: Record<Emotion, string> = {
  'Senang': '😊',
  'Biasa aja': '😐',
  'Cemas': '😟',
  'Sedih': '😔',
  'Frustrasi': '😤',
  'Overwhelmed': '😵',
};

function getWeekLabel(offset: number): string {
  if (offset === 0) return 'Minggu Ini';
  if (offset === -1) return 'Minggu Lalu';
  if (offset === 1) return 'Minggu Depan';
  if (offset === 2) return '2 Minggu Lagi';
  if (offset < 0) return `${Math.abs(offset)} Minggu Lalu`;
  return `${offset} Minggu Lagi`;
}

export default function ForecastPage() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const forecast = useMemo(() => generateForecast(SAMPLE_MOODS, weekOffset), [weekOffset]);
  const avgProb = Math.round(forecast.days.reduce((s, d) => s + d.probability, 0) / 7);
  const hardDays = forecast.days.filter(d => d.severity >= 3);

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col">
      <div className="h-11" />
      <AppHeader title="Mood Forecast" />

      <div className="flex-1 overflow-auto scrollbar-none px-5 pb-24">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#E5E7EB] cursor-pointer flex items-center justify-center hover:border-[#1A3448] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="font-boogaloo text-xl text-[#1A3448] m-0 mb-0.5">{getWeekLabel(weekOffset)}</h2>
            <div className="flex items-center justify-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: avgProb >= 80 ? '#4CAF50' : avgProb >= 65 ? '#FFC107' : '#EF5350' }}
              />
              <span className="text-xs text-[#6B7280]">Akurasi rata-rata: {avgProb}%</span>
            </div>
          </div>

          <button
            onClick={() => weekOffset < 2 && setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 2}
            className="w-9 h-9 rounded-xl bg-white border-[1.5px] border-[#E5E7EB] cursor-pointer flex items-center justify-center hover:border-[#1A3448] transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#1A3448" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 7-day forecast cards */}
        <Card className="p-3.5 mb-4">
          <div className="flex justify-between gap-0.5">
            {forecast.days.map((d, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-0.5 rounded-2xl border-[1.5px]"
                style={{
                  background: d.day === 'Sel' && weekOffset === 0 ? '#EDF4F8' : 'transparent',
                  borderColor: d.day === 'Sel' && weekOffset === 0 ? '#A8C8D8' : 'transparent',
                }}
              >
                <span className="text-[11px] font-medium text-[#6B7280]">{d.day}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: (EMOTION_COLORS[d.emotion] ?? '#78909C') + '18' }}
                >
                  <span className="text-[22px]">{EMOTION_EMOJIS[d.emotion] ?? '😐'}</span>
                </div>
                <span className="text-[9px] text-[#6B7280] font-medium text-center leading-tight">
                  {d.emotion === 'Biasa aja' ? 'Biasa' : d.emotion}
                </span>
                {/* Probability bar */}
                <div className="w-4/5 h-0.5 rounded-sm bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${d.probability}%`,
                      background: d.probability >= 80 ? '#4CAF50' : d.probability >= 65 ? '#FFC107' : '#EF5350',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: d.probability >= 80 ? '#4CAF50' : d.probability >= 65 ? '#B8860B' : '#EF5350' }}
                >
                  {d.probability}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Hard days warning */}
        {hardDays.length > 0 && (
          <Card className="p-3.5 mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' } as React.CSSProperties}>
            <div className="flex gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="m-0 mb-1.5 text-sm font-semibold text-[#92400E]">
                  {hardDays.length} hari butuh perhatian lebih
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hardDays.map((d, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-xl text-[12px] font-medium"
                      style={{
                        background: (EMOTION_COLORS[d.emotion] ?? '#EF5350') + '20',
                        color: EMOTION_COLORS[d.emotion] ?? '#EF5350',
                      }}
                    >
                      {d.day}: {EMOTION_EMOJIS[d.emotion]} {d.emotion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Prevention strategies */}
        <div className="mb-4">
          <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5 flex items-center gap-2">
            🛡️ Strategi Pencegahan
          </h3>
          <Card className="p-4">
            <p className="m-0 mb-3 text-sm font-semibold text-[#1A3448]">
              {forecast.prevention_plan.title}
            </p>
            <p className="m-0 mb-3 text-sm text-[#6B7280] leading-relaxed">
              {forecast.prevention_plan.description}
            </p>
            <div className="flex flex-col gap-2.5">
              {forecast.prevention_plan.actions.map((action, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-lg flex-shrink-0 mt-0.5 bg-[#EDF4F8] flex items-center justify-center text-[11px] font-bold text-[#1A3448]">
                    {i + 1}
                  </div>
                  <p className="m-0 text-sm text-[#1A3448] leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Mitigation per day */}
        {hardDays.length > 0 && (
          <div className="mb-4">
            <h3 className="font-boogaloo text-lg text-[#1A3448] mb-2.5 flex items-center gap-2">
              🎯 Mitigasi Hari Berat
            </h3>
            <div className="flex flex-col gap-2">
              {hardDays.map((d, i) => (
                <Card
                  key={i}
                  className="p-3.5"
                  style={{ background: '#FEFCE8', border: '1px solid #FEF08A' } as React.CSSProperties}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-white border border-[#FDE68A] flex flex-col items-center justify-center">
                      <span className="text-base">{EMOTION_EMOJIS[d.emotion] ?? '😐'}</span>
                      <span className="text-[9px] font-semibold text-[#6B7280]">{d.day}</span>
                    </div>
                    <div>
                      <p className="m-0 mb-1 text-[13px] font-semibold text-[#92400E]">
                        Prediksi: {d.emotion}
                      </p>
                      <p className="m-0 text-[13px] text-[#78350F] leading-relaxed">
                        {d.severity >= 3
                          ? `Di hari ${d.day}, siapkan sesi cerita atau hubungi psikolog jika perlu.`
                          : `Di hari ${d.day}, coba teknik grounding: sentuh 5 benda, dengar 4 suara.`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Accuracy info */}
        <Card
          className="p-4 cursor-pointer mb-2"
          onClick={() => setShowInfo(!showInfo)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🧠</span>
              <span className="text-sm font-semibold text-[#1A3448]">Bagaimana akurasi dihitung?</span>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              style={{ transform: showInfo ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
            >
              <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          {showInfo && (
            <div className="mt-3 text-[13px] text-[#6B7280] leading-relaxed">
              <p className="m-0 mb-2.5">Persentase akurasi dihitung berdasarkan:</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '📅', title: 'Jarak waktu', body: 'Semakin dekat tanggalnya, semakin akurat. Minggu ini ~85-92%, minggu depan ~70-80%.' },
                  { icon: '💬', title: 'Frekuensi interaksi', body: 'Semakin sering check-in & sesi cerita, semakin banyak data (+0-10% bonus).' },
                  { icon: '📊', title: 'Pola historis', body: 'Riwayat mood dan sesi ceritamu membentuk pola yang bisa diprediksi.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span>{item.icon}</span>
                    <div>
                      <strong className="text-[#1A3448]">{item.title}</strong>
                      <p className="m-0 mt-0.5">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
