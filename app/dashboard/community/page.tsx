'use client';

import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';

export default function CommunityPage() {
  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Komunitas" showBack={false} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        <span className="text-6xl mb-4">🌿</span>
        <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-2">Komunitas MinDora</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Fitur komunitas segera hadir! Kamu akan bisa berbagi cerita dan saling mendukung sesama pengguna MinDora.
        </p>
      </div>
    </div>
  );
}
