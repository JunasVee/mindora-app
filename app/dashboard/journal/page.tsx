'use client';

import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function JournalPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Jurnal" showBack={false} />

      <div className="px-5 pb-5">
        <p className="text-sm text-[#6B7280] mb-4">Riwayat check-in dan sesi cerita kamu</p>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-6xl mb-4">📔</span>
          <h2 className="font-boogaloo text-xl text-[#1A3448] mb-2">Belum ada catatan</h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            Mulai check-in atau sesi cerita untuk mengisi jurnalmu.
          </p>
          <Button onClick={() => router.push('/dashboard/checkin')} fullWidth={false} className="px-8">
            Mulai Check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
