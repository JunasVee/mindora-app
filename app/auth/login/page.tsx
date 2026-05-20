'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinDoraIcon } from '@/components/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Lengkapi email dan password ya.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError('Email atau password salah. Coba lagi ya.');
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="mobile-shell bg-white">
      <div className="h-11" />
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="flex justify-center my-6">
          <MinDoraIcon size={64} withBackground={false} />
        </div>

        <h2 className="font-boogaloo text-[28px] text-[#1A3448] text-center mb-2">
          Selamat Datang Kembali
        </h2>
        <p className="text-sm text-[#6B7280] text-center mb-7">
          Senang ketemu lagi! Yuk lanjut cerita.
        </p>

        <div className="flex flex-col gap-3.5">
          <InputField
            label="Email"
            type="email"
            placeholder="email@contoh.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Password kamu"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>

        <div className="text-right mt-2">
          <button className="bg-transparent border-none text-[13px] text-[#A8C8D8] cursor-pointer font-poppins font-medium">
            Lupa password?
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mt-2">{error}</p>
        )}

        <div className="mt-6">
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[13px] text-gray-400">atau</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3.5 flex items-center justify-center gap-2.5 bg-white border-[1.5px] border-[#E5E7EB] rounded-2xl cursor-pointer font-poppins text-[15px] text-[#1A3448] hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon />
          Lanjut dengan Google
        </button>

        <p className="text-center mt-4 text-sm text-[#6B7280]">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-[#1A3448] font-semibold no-underline">
            Daftar
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
