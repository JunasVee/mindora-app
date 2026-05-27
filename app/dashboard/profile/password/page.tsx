'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';

function checkPassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper:  /[A-Z]/.test(pw),
    lower:  /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

const REQUIREMENTS = [
  { key: 'length' as const, label: 'Minimal 8 karakter' },
  { key: 'upper'  as const, label: 'Minimal 1 huruf kapital' },
  { key: 'lower'  as const, label: 'Minimal 1 huruf kecil' },
  { key: 'number' as const, label: 'Minimal 1 angka' },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newFocused, setNewFocused] = useState(false);

  const checks = checkPassword(form.newPw);
  const pwValid = Object.values(checks).every(Boolean);

  const handleSave = async () => {
    setError('');
    if (!form.current) { setError('Masukkan password lama kamu.'); return; }
    if (!pwValid) { setError('Password baru belum memenuhi semua persyaratan.'); return; }
    if (form.newPw !== form.confirm) { setError('Konfirmasi password tidak cocok.'); return; }

    setSaving(true);
    const supabase = createClient();

    // Verify current password by re-signing in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setSaving(false); setError('Sesi tidak valid. Coba login ulang.'); return; }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: form.current,
    });
    if (signInErr) {
      setSaving(false);
      setError('Password lama tidak sesuai.');
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: form.newPw });
    setSaving(false);

    if (updateErr) { setError(`Gagal mengubah password: ${updateErr.message}`); return; }
    setSuccess(true);
    setTimeout(() => router.back(), 1500);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Ubah Password" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        <div
          className="p-4 rounded-2xl text-sm text-[#6B7280] leading-relaxed"
          style={{ background: '#FFF9F0', border: '1px solid #F5E6D3' }}
        >
          🔒 Gunakan password yang kuat dan unik untuk menjaga akun tetap aman.
        </div>

        <div className="flex flex-col gap-4">
          <InputField
            label="Password Lama"
            type="password"
            placeholder="Password saat ini"
            value={form.current}
            onChange={e => setForm({ ...form, current: e.target.value })}
            autoComplete="current-password"
          />

          <div>
            <InputField
              label="Password Baru"
              type="password"
              placeholder="Min. 8 karakter"
              value={form.newPw}
              onChange={e => setForm({ ...form, newPw: e.target.value })}
              autoComplete="new-password"
              onFocus={() => setNewFocused(true)}
              onBlur={() => setNewFocused(false)}
            />
            {(newFocused || form.newPw.length > 0) && (
              <div className="mt-2 px-1 flex flex-col gap-1">
                {REQUIREMENTS.map(req => {
                  const met = checks[req.key];
                  return (
                    <div key={req.key} className="flex items-center gap-2">
                      <span className="text-[13px]">{met ? '✅' : '⬜'}</span>
                      <span className="text-[12px] font-poppins" style={{ color: met ? '#2E7D32' : '#9CA3AF' }}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <InputField
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            autoComplete="new-password"
          />
          {form.confirm.length > 0 && form.newPw !== form.confirm && (
            <p className="text-[12px] text-red-500 -mt-2 ml-1">Password tidak cocok.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-600 text-center">✅ Password berhasil diubah!</p>}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Ubah Password'}
        </Button>
      </div>
    </div>
  );
}
