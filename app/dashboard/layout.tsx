import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-shell bg-[#F5F5F5]">
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
