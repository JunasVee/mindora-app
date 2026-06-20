'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { createClient } from '@/lib/supabase';
import { checkSubscriptionStatus } from '@/lib/subscription';
import { useLanguage } from '@/lib/language-context';
import { getInitial } from '@/lib/utils';

function buildMenuSections(t: (ns: string, key: string) => string) {
  return [
    {
      title: t('profile', 'account'),
      items: [
        { icon: '👤', label: t('profile', 'editProfile'), href: '/dashboard/profile/edit' },
        { icon: '🔑', label: t('profile', 'changePassword'), href: '/dashboard/profile/password' },
        { icon: '🔔', label: t('profile', 'notifications'), href: '/dashboard/notifications' },
      ],
    },
    {
      title: t('profile', 'premiumSection'),
      items: [
        { icon: '⭐', label: t('profile', 'subscriptionStatus'), href: '/dashboard/profile/subscription', detail: true },
        { icon: '💎', label: t('profile', 'upgradeManage'), href: '/premium' },
      ],
    },
    {
      title: t('profile', 'history'),
      items: [
        { icon: '💬', label: t('profile', 'sessionHistory'), href: '/dashboard/profile/sessions' },
        { icon: '📊', label: t('profile', 'monthlyReport'), href: '/dashboard/report', premium: true },
      ],
    },
    {
      title: t('profile', 'other'),
      items: [
        { icon: '🌐', label: t('profile', 'language'), href: '/dashboard/profile/language' },
        { icon: 'ℹ️', label: t('profile', 'about'), href: '/dashboard/profile/about' },
        { icon: '🔒', label: t('profile', 'privacy'), href: '/dashboard/profile/privacy' },
        { icon: '❓', label: t('profile', 'help'), href: '/dashboard/profile/help' },
        { icon: '🚪', label: t('profile', 'logout'), danger: true, action: 'logout' },
      ],
    },
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [userName, setUserName] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      checkSubscriptionStatus(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_premium, streak, session_count')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserName(profile.full_name ?? user.email ?? 'Kamu');
        setIsPremium(profile.is_premium ?? false);
        setStreak(profile.streak ?? 0);
        setSessionCount(profile.session_count ?? 0);
      } else {
        setUserName(
          (user.user_metadata?.full_name as string) ?? user.email ?? 'Kamu'
        );
      }
    };
    loadProfile();
  }, [router]);

  const handleAction = async (action?: string, href?: string) => {
    if (action === 'logout') {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace('/auth/login');
      return;
    }
    if (href) router.push(href);
  };

  const level = Math.floor(sessionCount / 5) + 1;
  const menuSections = buildMenuSections(t);

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />

      <div className="px-5 pb-3">
        <h1 className="font-boogaloo text-[28px] text-[#1A3448] m-0">{t('profile', 'title')}</h1>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-4">
        {/* User card */}
        <Card className="p-5 text-center">
          <div
            className="w-[72px] h-[72px] rounded-[20px] mx-auto mb-3 flex items-center justify-center bg-[#1A3448]"
          >
            <span className="font-boogaloo text-3xl text-white">
              {userName ? getInitial(userName) : '?'}
            </span>
          </div>
          <h2 className="text-[18px] font-semibold text-[#1A3448] m-0 mb-1.5">{userName || '...'}</h2>
          <div
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{
              background: isPremium ? 'linear-gradient(135deg, #FFD700, #FFA000)' : '#F3F4F6',
              color: isPremium ? '#5D4037' : '#6B7280',
            }}
          >
            {isPremium && <span>👑</span>}
            {isPremium ? t('profile', 'premium') : t('profile', 'free')}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-5 mt-4">
            {[
              { icon: '🔥', val: `${streak}`, label: t('profile', 'streak') },
              { icon: '💬', val: sessionCount.toString(), label: t('profile', 'sessions') },
              { icon: '📊', val: `${level}`, label: t('profile', 'level') },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-base">{s.icon}</span>
                <p className="m-0 mt-1 text-sm font-semibold text-[#1A3448]">{s.val}</p>
                <p className="m-0 text-[11px] text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Theme toggle — standalone, applies instantly across the whole app */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 ml-1">
            {t('profile', 'appearance')}
          </p>
          <Card className="p-0 overflow-hidden">
            <ThemeToggle />
          </Card>
        </div>

        {/* Menu sections */}
        {menuSections.map((section, si) => (
          <div key={si}>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2 ml-1">
              {section.title}
            </p>
            <Card className="p-0 overflow-hidden">
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => handleAction((item as any).action, (item as any).href)}
                  className="flex items-center gap-3 px-4 py-3.5 w-full bg-transparent border-none cursor-pointer font-poppins transition-colors hover:bg-gray-50"
                  style={{
                    borderBottom: ii < section.items.length - 1 ? '1px solid #F3F4F6' : 'none',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className="flex-1 text-left text-sm"
                    style={{
                      color: (item as any).danger ? '#EF5350' : '#1A3448',
                      fontWeight: (item as any).danger ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                  {(item as any).detail === true && (
                    <span className="text-[13px] text-[#6B7280] mr-1">
                      {isPremium ? t('profile', 'premium') : t('profile', 'free')}
                    </span>
                  )}
                  {(item as any).href === '/dashboard/profile/language' && (
                    <span className="text-[13px] text-[#6B7280] mr-1">{lang.toUpperCase()}</span>
                  )}
                  {(item as any).premium && !isPremium && <span className="text-xs">🔒</span>}
                  {!(item as any).danger && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
