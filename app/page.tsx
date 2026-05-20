'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MinDoraIcon } from '@/components/Logo';
import { createClient } from '@/lib/supabase';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/dashboard');
      } else {
        const hasSeenOnboarding = localStorage.getItem('mindora_onboarded');
        if (hasSeenOnboarding) {
          router.replace('/auth/login');
        } else {
          router.replace('/onboarding');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mobile-shell" style={{ background: '#1A3448' }}>
      {/* Concentric rings decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
        {[200, 160, 120, 80, 40].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-[#A8C8D8]"
            style={{ width: s, height: s }}
          />
        ))}
      </div>

      {/* Logo center */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
        <div className="mb-5 flex justify-center">
          <MinDoraIcon size={88} withBackground={false} />
        </div>
        <h1 className="font-boogaloo text-[42px] text-white m-0 mb-3">MinDora</h1>
        <p className="text-sm text-[#A8C8D8] mx-10 leading-relaxed">
          Aplikasi yang selalu siap mendengarkan dan membantumu melewati hari-hari berat.
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#A8C8D8] animate-pulse-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
