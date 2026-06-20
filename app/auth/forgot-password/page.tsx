'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MinDoraIcon } from '@/components/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      setError('Masukkan email kamu ya.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError('Gagal mengirim email reset. Coba lagi ya.');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mobile-shell bg-white">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[64px] mb-4">📧</span>
          <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-3">Cek Email Kamu</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Kami sudah kirim link reset password ke <strong>{email}</strong>. Buka email itu dan ikuti instruksinya untuk bikin password baru.
          </p>
          <Button onClick={() => router.push('/auth/login')}>Kembali ke Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-shell bg-white">
      <div className="h-11" />
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="flex justify-center my-6">
          <MinDoraIcon size={64} withBackground={false} />
        </div>

        <h2 className="font-boogaloo text-[26px] text-[#1A3448] text-center mb-2">
          Lupa Password?
        </h2>
        <p className="text-sm text-[#6B7280] text-center mb-7 leading-relaxed">
          Masukkan email yang kamu daftarkan. Kami akan kirim link untuk bikin password baru.
        </p>

        <InputField
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />

        {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}

        <div className="mt-6">
          <Button onClick={handleSend} disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
        </div>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full mt-4 py-2 bg-transparent border-none text-sm text-[#6B7280] cursor-pointer font-poppins text-center"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}
