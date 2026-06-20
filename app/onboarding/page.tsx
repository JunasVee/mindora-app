'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressDots from '@/components/ui/ProgressDots';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/lib/language-context';

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const { t } = useLanguage();

  const slides = [
    { emoji: '🧘', headline: t('onboarding', 'slide1Headline'), sub: t('onboarding', 'slide1Sub') },
    { emoji: '💭', headline: t('onboarding', 'slide2Headline'), sub: t('onboarding', 'slide2Sub') },
    { emoji: '🌱', headline: t('onboarding', 'slide3Headline'), sub: t('onboarding', 'slide3Sub') },
  ];
  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem('mindora_onboarded', '1');
      router.push('/auth/register');
    }
  };

  return (
    <div className="mobile-shell bg-white">
      {/* Status bar placeholder */}
      <div className="h-11" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Illustration */}
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center mb-8"
          style={{ background: 'linear-gradient(135deg, #EDF4F8, #F5EDE4)' }}
        >
          <span className="text-8xl">{current.emoji}</span>
        </div>

        <h2
          className="font-boogaloo text-[26px] text-[#1A3448] text-center mb-3 leading-snug whitespace-pre-line"
        >
          {current.headline}
        </h2>
        <p className="text-[15px] text-[#6B7280] text-center leading-relaxed">
          {current.sub}
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 flex flex-col gap-4 items-center">
        <ProgressDots total={3} current={slide} />
        <Button onClick={handleNext}>
          {slide < slides.length - 1 ? t('onboarding', 'next') : t('onboarding', 'start')}
        </Button>
        <button
          onClick={() => router.push('/auth/login')}
          className="bg-transparent border-none text-sm text-[#6B7280] cursor-pointer font-poppins"
        >
          {t('onboarding', 'haveAccount')}{' '}
          <span className="text-[#1A3448] font-semibold">{t('onboarding', 'login')}</span>
        </button>
      </div>
    </div>
  );
}
