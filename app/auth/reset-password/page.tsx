'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MinDoraIcon } from '@/components/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

function checkPassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

const REQUIREMENTS = [
  { key: 'length' as const, label: 'Minimal 8 karakter' },
  { key: 'upper'  as const, label: 'Minimal 1 huruf kapital (A-Z)' },
  { key: 'lower'  as const, label: 'Minimal 1 huruf kecil (a-z)' },
  { key: 'number' as const, label: 'Minimal 1 angka (0-9)' },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pwChecks = useMemo(() => checkPassword(password), [password]);
  const pwValid = Object.values(pwChecks).every(Boolean);

  // The reset email link goes through /auth/callback, which exchanges the
  // code for a real session via cookies before redirecting here. We just
  // need to confirm that session actually exists before letting the user
  // set a new password — a stale/expired link would have no session.
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setCheckingSession(false);
    };
    check();
  }, []);

  const handleReset = async () => {
    if (!pwValid) {
      setError('Password belum memenuhi semua persyaratan.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError('Gagal mengubah password. Coba lagi ya.');
      return;
    }
    setDone(true);
  };

  if (checkingSession) {
    return (
      <div className="mobile-shell bg-white flex items-center justify-center">
        <p className="text-sm text-[#6B7280]">Memverifikasi link...</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mobile-shell bg-white">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[64px] mb-4">⏰</span>
          <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-3">Link Sudah Tidak Berlaku</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Link reset password ini sudah expired atau tidak valid. Minta link baru ya.
          </p>
          <Button onClick={() => router.push('/auth/forgot-password')}>Kirim Link Baru</Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mobile-shell bg-white">
        <div className="h-11" />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[64px] mb-4">✅</span>
          <h2 className="font-boogaloo text-2xl text-[#1A3448] mb-3">Password Berhasil Diubah</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            Password baru kamu sudah aktif. Yuk masuk lagi dengan password baru.
          </p>
          <Button onClick={() => router.push('/auth/login')}>Masuk Sekarang</Button>
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
          Bikin Password Baru
        </h2>
        <p className="text-sm text-[#6B7280] text-center mb-7">
          Masukkan password baru untuk akunmu.
        </p>

        <div className="flex flex-col gap-3.5">
          <InputField
            label="Password Baru"
            type="password"
            placeholder="Password baru"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            autoComplete="new-password"
          />

          {(passwordFocused || password.length > 0) && (
            <div className="flex flex-col gap-1.5 px-1">
              {REQUIREMENTS.map(req => (
                <div key={req.key} className="flex items-center gap-2">
                  <span className="text-xs">{pwChecks[req.key] ? '✅' : '⬜'}</span>
                  <span
                    className="text-xs"
                    style={{ color: pwChecks[req.key] ? '#4CAF50' : '#9CA3AF' }}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <InputField
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password baru"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}

        <div className="mt-6">
          <Button onClick={handleReset} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </div>
      </div>
    </div>
  );
}
