'use client';

import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-3.5 w-full bg-transparent border-none cursor-pointer font-poppins transition-colors hover:bg-gray-50"
    >
      <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
      <span className="flex-1 text-left text-sm text-[#1A3448]">
        {isDark ? t('profile', 'darkMode') : t('profile', 'lightMode')}
      </span>
      <div
        className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
        style={{ background: isDark ? '#4CAF50' : '#D1D5DB' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: isDark ? 22 : 2 }}
        />
      </div>
    </button>
  );
}
