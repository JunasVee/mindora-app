import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // h-[100dvh] locks the shell to viewport height so BottomNav always stays visible.
    // min-h-0 on the content div fixes the flexbox overflow bug where children push the nav down.
    <div className="mobile-shell bg-[#F5F5F5] h-[100dvh]">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
