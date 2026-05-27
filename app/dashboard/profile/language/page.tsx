'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩', available: true },
  { code: 'en', label: 'English',          flag: '🇬🇧', available: false },
];

const STORAGE_KEY = 'mindora_language';

export default function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('id');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelected(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, selected);
    setSaved(true);
    setTimeout(() => router.back(), 1000);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Language / Bahasa" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Pilih bahasa tampilan aplikasi MinDora.
        </p>

        <div className="flex flex-col gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => lang.available && setSelected(lang.code)}
              className="bg-transparent border-none p-0 cursor-pointer text-left"
              disabled={!lang.available}
            >
              <Card
                className="p-4 flex items-center gap-4 transition-all"
                style={selected === lang.code ? { borderColor: '#1A3448', borderWidth: 2 } as React.CSSProperties : undefined}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="m-0 text-sm font-semibold text-[#1A3448]">{lang.label}</p>
                  {!lang.available && (
                    <p className="m-0 text-[12px] text-[#9CA3AF]">Segera hadir</p>
                  )}
                </div>
                {selected === lang.code && (
                  <div className="w-5 h-5 rounded-full bg-[#1A3448] flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {!lang.available && (
                  <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Card>
            </button>
          ))}
        </div>

        {saved && <p className="text-sm text-green-600 text-center">✅ Bahasa disimpan!</p>}

        <Button onClick={handleSave}>Simpan</Button>
      </div>
    </div>
  );
}
