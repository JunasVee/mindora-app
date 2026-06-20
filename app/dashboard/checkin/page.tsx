'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
import type { Emotion } from '@/types';

const SLEEP_KEYS = ['sleepVeryBad', 'sleepBad', 'sleepOk', 'sleepGood', 'sleepVeryGood'] as const;
const SLEEP_EMOJIS = ['😫', '😣', '😐', '😊', '😌'];

// label stays the canonical Indonesian Emotion value (stored in DB) —
// moodKey is only used to look up the display translation
const MOOD_OPTIONS: { emoji: string; label: Emotion; moodKey: string }[] = [
  { emoji: '😊', label: 'Senang',      moodKey: 'moodSenang' },
  { emoji: '😐', label: 'Biasa aja',   moodKey: 'moodBiasaAja' },
  { emoji: '😟', label: 'Cemas',       moodKey: 'moodCemas' },
  { emoji: '😔', label: 'Sedih',       moodKey: 'moodSedih' },
  { emoji: '😤', label: 'Frustrasi',   moodKey: 'moodFrustrasi' },
  { emoji: '😵', label: 'Overwhelmed', moodKey: 'moodOverwhelmed' },
];

export default function CheckinPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [sleep, setSleep] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [hasConcern, setHasConcern] = useState<boolean | null>(null);
  const [concernText, setConcernText] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const canAdvance =
    (step === 1 && sleep !== null) ||
    (step === 2 && mood !== null) ||
    (step === 3 && hasConcern !== null);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Save check-in
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('mood_entries').insert({
          user_id: user.id,
          sleep_quality: sleep,
          emotion: MOOD_OPTIONS[mood!].label,
          has_concern: hasConcern,
          concern_text: hasConcern ? concernText : null,
          date: new Date().toISOString().split('T')[0],
        });

        // Update streak
        await supabase.rpc('increment_streak', { user_id: user.id });
      }
    } catch (e) {
      console.error('Failed to save checkin:', e);
    } finally {
      setSaving(false);
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
        <div className="h-11" />
        <AppHeader title={t('checkin', 'doneTitle')} />

        <div className="flex-1 overflow-auto px-5 pb-5 flex flex-col gap-4">
          {/* Celebration */}
          <div className="text-center my-5">
            <span className="text-[64px]">🎉</span>
            <h2 className="font-boogaloo text-2xl text-[#1A3448] mt-3 mb-1">
              {t('checkin', 'doneTitle')}
            </h2>
            <p className="text-[15px] text-[#6B7280]">{t('checkin', 'doneSub')}</p>
          </div>

          {/* Summary */}
          <Card className="p-4">
            <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
              {t('checkin', 'summaryTitle')}
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">{t('checkin', 'sleepLabel')}</span>
                <span className="text-sm font-semibold">
                  {sleep}/5 {SLEEP_EMOJIS[(sleep ?? 1) - 1]}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">{t('checkin', 'moodLabel')}</span>
                <span className="text-sm font-semibold">
                  {mood !== null ? `${t('checkin', MOOD_OPTIONS[mood].moodKey)} ${MOOD_OPTIONS[mood].emoji}` : '—'}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">{t('checkin', 'concernLabel')}</span>
                <span className="text-sm font-semibold">
                  {hasConcern ? t('checkin', 'concernHas') : t('checkin', 'concernNone')}
                </span>
              </div>
            </div>
          </Card>

          {/* Smart routing */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: 'linear-gradient(135deg, #FFF9E6, #FFFDF5)', border: '1px solid #FFF0C0' }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xl">🟡</span>
              <p className="m-0 text-sm font-semibold text-[#1A3448]">
                {t('checkin', 'routingPrompt')}
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard/chat')} className="mt-2">
              {t('checkin', 'startSession')}
            </Button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-2.5 py-3 bg-transparent border-none text-sm text-[#6B7280] cursor-pointer font-poppins"
            >
              {t('checkin', 'later')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-[#F5F5F5] flex flex-col">
      <div className="h-11" />
      <AppHeader title={t('checkin', 'title')} />

      <div className="flex-1 overflow-auto scrollbar-none flex flex-col px-5">
        {/* Progress bars */}
        <div className="flex gap-1.5 mb-7">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex-1 h-1 rounded-sm transition-colors duration-300"
              style={{ background: i <= step ? '#1A3448' : '#E5E7EB' }}
            />
          ))}
        </div>
        <p className="text-xs text-[#6B7280] mb-2">{t('checkin', 'step')} {step} {t('checkin', 'of')}</p>

        {/* Step 1: Sleep */}
        {step === 1 && (
          <div className="flex-1">
            <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-6">
              {t('checkin', 'sleepQuestion')}
            </h2>
            <div className="flex flex-col gap-2.5">
              {SLEEP_KEYS.map((key, i) => {
                const val = i + 1;
                return (
                  <button
                    key={val}
                    onClick={() => setSleep(val)}
                    className="flex items-center gap-3.5 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 text-left"
                    style={{
                      background: sleep === val ? '#EDF4F8' : '#fff',
                      borderColor: sleep === val ? '#A8C8D8' : '#E5E7EB',
                    }}
                  >
                    <span className="text-3xl">{SLEEP_EMOJIS[i]}</span>
                    <span
                      className="text-[15px] text-[#1A3448]"
                      style={{ fontWeight: sleep === val ? 600 : 400 }}
                    >
                      {t('checkin', key)}
                    </span>
                    <span className="ml-auto text-[13px] text-[#6B7280]">{val}/5</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Mood */}
        {step === 2 && (
          <div className="flex-1">
            <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-6">
              {t('checkin', 'moodQuestion')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {MOOD_OPTIONS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setMood(i)}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-[18px] cursor-pointer transition-all duration-200 border-2"
                  style={{
                    background: mood === i ? '#EDF4F8' : '#fff',
                    borderColor: mood === i ? '#A8C8D8' : '#E5E7EB',
                  }}
                >
                  <span className="text-4xl">{m.emoji}</span>
                  <span
                    className="text-[13px] text-[#1A3448]"
                    style={{ fontWeight: mood === i ? 600 : 400 }}
                  >
                    {t('checkin', m.moodKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Concerns */}
        {step === 3 && (
          <div className="flex-1">
            <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-6">
              {t('checkin', 'concernQuestion')}
            </h2>
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setHasConcern(true)}
                className="flex-1 py-5 flex flex-col items-center gap-2 rounded-[18px] cursor-pointer transition-all duration-200 border-2"
                style={{
                  background: hasConcern === true ? '#FFF5F5' : '#fff',
                  borderColor: hasConcern === true ? '#EF5350' : '#E5E7EB',
                }}
              >
                <span className="text-[32px]">😬</span>
                <span className="text-sm font-semibold">{t('checkin', 'concernYes')}</span>
              </button>
              <button
                onClick={() => setHasConcern(false)}
                className="flex-1 py-5 flex flex-col items-center gap-2 rounded-[18px] cursor-pointer transition-all duration-200 border-2"
                style={{
                  background: hasConcern === false ? '#F0FFF4' : '#fff',
                  borderColor: hasConcern === false ? '#4CAF50' : '#E5E7EB',
                }}
              >
                <span className="text-[32px]">😌</span>
                <span className="text-sm font-semibold">{t('checkin', 'concernNo')}</span>
              </button>
            </div>

            {hasConcern === true && (
              <div className="animate-fade-in">
                <p className="text-sm text-[#6B7280] mb-2">{t('checkin', 'concernPrompt')}</p>
                <textarea
                  value={concernText}
                  onChange={e => setConcernText(e.target.value)}
                  placeholder={t('checkin', 'concernPlaceholder')}
                  className="w-full min-h-[100px] p-4 rounded-2xl border-[1.5px] border-[#E5E7EB] bg-[#F9FAFB] text-sm font-poppins text-[#1A3448] resize-none outline-none focus:border-[#1A3448] transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="py-4 pb-6">
          <Button onClick={handleNext} disabled={!canAdvance || saving}>
            {saving ? t('checkin', 'saving') : step < 3 ? t('checkin', 'next') : t('checkin', 'finish')}
          </Button>
        </div>
      </div>
    </div>
  );
}
