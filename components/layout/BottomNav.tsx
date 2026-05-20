'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    id: 'home',
    label: 'Beranda',
    href: '/dashboard',
    icon: 'M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z',
    strokeIcon: false,
  },
  {
    id: 'journal',
    label: 'Jurnal',
    href: '/dashboard/journal',
    icon: 'M4 2h12a2 2 0 012 2v16a2 2 0 01-2 2H4V2zm2 4h8m-8 4h8m-8 4h5',
    strokeIcon: true,
  },
  {
    id: 'booking',
    label: 'Booking',
    href: '/dashboard/psikolog',
    icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 10H7v-5h5v5z',
    strokeIcon: false,
  },
  {
    id: 'community',
    label: 'Komunitas',
    href: '/dashboard/community',
    icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z',
    strokeIcon: false,
  },
  {
    id: 'profile',
    label: 'Profil',
    href: '/dashboard/profile',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    strokeIcon: false,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex border-t border-gray-200 bg-white pb-5 pt-2 flex-shrink-0">
      {tabs.map(tab => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={tab.icon}
                fill={tab.strokeIcon ? 'none' : (active ? '#1A3448' : '#9CA3AF')}
                stroke={tab.strokeIcon ? (active ? '#1A3448' : '#9CA3AF') : 'none'}
                strokeWidth={tab.strokeIcon ? 1.5 : 0}
              />
            </svg>
            <span
              className="font-poppins text-[11px]"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? '#1A3448' : '#9CA3AF',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
