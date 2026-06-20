'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translate, type Lang } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (namespace: string, key: string) => string;
}

const STORAGE_KEY = 'mindora_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    setLangState(stored === 'en' ? 'en' : 'id');
    setHydrated(true);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const t = (namespace: string, key: string) => translate(lang, namespace as any, key);

  if (!hydrated) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: 'id', setLang: () => {}, t: (_, key) => key };
  }
  return ctx;
}
