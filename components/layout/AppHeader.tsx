'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: ReactNode;
  light?: boolean;
}

export default function AppHeader({ title, onBack, showBack = true, rightAction, light = false }: AppHeaderProps) {
  const router = useRouter();
  const color = light ? '#fff' : 'var(--dm-text-primary)';

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 min-h-[44px]">
      {showBack ? (
        <button onClick={handleBack} className="p-1 bg-transparent border-none cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}

      <span style={{ fontFamily: 'var(--font-boogaloo), cursive', fontSize: 20, color }}>
        {title}
      </span>

      {rightAction ?? <div className="w-8" />}
    </div>
  );
}
