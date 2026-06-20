'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/lib/language-context';
import type { Lang } from '@/lib/i18n';

const LANGUAGES: { code: Lang; label: string; symbol: string; available: boolean }[] = [
  { code: 'id', label: 'Bahasa Indonesia', symbol: 'ID', available: true },
  { code: 'en', label: 'English',          symbol: 'EN', available: true },
];

export default function LanguagePage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState<Lang>('id');
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSelected(lang); }, [lang]);

  const handleSave = () => {
    setLang(selected);
    setSaved(true);
    setTimeout(() => router.back(), 800);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Language / Bahasa" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Pilih bahasa tampilan aplikasi MinDora. Perubahan berlaku langsung di semua halaman.
        </p>

        <div className="flex flex-col gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => l.available && setSelected(l.code)}
              className="bg-transparent border-none p-0 cursor-pointer text-left"
              disabled={!l.available}
            >
              <Card
                className="p-4 flex items-center gap-4 transition-all"
                style={selected === l.code ? { borderColor: '#1A3448', borderWidth: 2 } as React.CSSProperties : undefined}
              >
                <div className="w-9 h-9 rounded-lg bg-[#EDF4F8] flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-bold text-[#1A3448]">{l.symbol}</span>
                </div>
                <div className="flex-1">
                  <p className="m-0 text-sm font-semibold text-[#1A3448]">{l.label}</p>
                </div>
                {selected === l.code && (
                  <div className="w-5 h-5 rounded-full bg-[#1A3448] flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
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
