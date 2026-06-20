'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinDoraIcon } from '@/components/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';

function checkPassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const REQUIREMENTS = [
    { key: 'length' as const, label: t('register', 'reqLength') },
    { key: 'upper'  as const, label: t('register', 'reqUpper') },
    { key: 'lower'  as const, label: t('register', 'reqLower') },
    { key: 'number' as const, label: t('register', 'reqNumber') },
  ];

  const pwChecks = useMemo(() => checkPassword(form.password), [form.password]);
  const pwValid = Object.values(pwChecks).every(Boolean);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError(t('register', 'errorRequired'));
      return;
    }
    if (!pwValid) {
      setError(t('register', 'errorWeak'));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('register', 'errorMismatch'));
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
      },
    });

    setLoading(false);

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already exists')) {
        setError(t('register', 'errorExists'));
      } else {
        setError(`Gagal mendaftar: ${authError.message}`);
      }
      return;
    }

    localStorage.setItem('mindora_onboarded', '1');

    if (data.session) {
      router.replace('/dashboard');
    } else {
      setAwaitingConfirmation(true);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (awaitingConfirmation) {
    return (
      <div className="mobile-shell bg-white flex flex-col items-center justify-center px-8 text-center gap-5">
        <span className="text-7xl">📬</span>
        <h2 className="font-boogaloo text-[28px] text-[#1A3448]">{t('register', 'confirmTitle')}</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">
          {t('register', 'confirmBody')} (<strong>{form.email}</strong>)
        </p>
        <Button onClick={() => router.push('/auth/login')}>
          {t('register', 'backToLogin')}
        </Button>
        <button
          onClick={() => setAwaitingConfirmation(false)}
          className="text-sm text-[#6B7280] bg-transparent border-none cursor-pointer font-poppins"
        >
          ← {t('register', 'title')}
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-shell bg-white">
      <div className="h-11" />
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="flex justify-center my-2">
          <MinDoraIcon size={64} withBackground={false} />
        </div>

        <h2 className="font-boogaloo text-[28px] text-[#1A3448] text-center mb-6">
          {t('register', 'title')}
        </h2>

        <div className="flex flex-col gap-3.5">
          <InputField
            label={t('register', 'name')}
            placeholder={t('register', 'namePlaceholder')}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
          <InputField
            label={t('register', 'email')}
            type="email"
            placeholder={t('register', 'emailPlaceholder')}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />

          {/* Password with live requirements */}
          <div>
            <InputField
              label={t('register', 'password')}
              type="password"
              placeholder={t('register', 'passwordPlaceholder')}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            {(passwordFocused || form.password.length > 0) && (
              <div className="mt-2 px-1 flex flex-col gap-1">
                {REQUIREMENTS.map(req => {
                  const met = pwChecks[req.key];
                  return (
                    <div key={req.key} className="flex items-center gap-2">
                      <span className="text-[13px]">{met ? '✅' : '⬜'}</span>
                      <span
                        className="text-[12px] font-poppins transition-colors"
                        style={{ color: met ? '#2E7D32' : '#9CA3AF' }}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <InputField
            label={t('register', 'confirm')}
            type="password"
            placeholder={t('register', 'confirmPlaceholder')}
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            autoComplete="new-password"
          />
          {form.confirm.length > 0 && form.password !== form.confirm && (
            <p className="text-[12px] text-red-500 -mt-2 ml-1">{t('register', 'errorMismatch')}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mt-3">{error}</p>
        )}

        <div className="mt-6">
          <Button onClick={handleRegister} disabled={loading}>
            {loading ? t('register', 'signingUp') : t('register', 'signUp')}
          </Button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[13px] text-gray-400">{t('register', 'or')}</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3.5 flex items-center justify-center gap-2.5 bg-white border-[1.5px] border-[#E5E7EB] rounded-2xl cursor-pointer font-poppins text-[15px] text-[#1A3448] hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon />
          {t('register', 'google')}
        </button>

        <p className="text-center mt-4 text-sm text-[#6B7280]">
          {t('register', 'haveAccount')}{' '}
          <Link href="/auth/login" className="text-[#1A3448] font-semibold no-underline">
            {t('register', 'login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
