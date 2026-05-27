'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { getInitial } from '@/lib/utils';

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      setFullName(profile?.full_name ?? (user.user_metadata?.full_name as string) ?? '');
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Nama tidak boleh kosong.'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id);

    // Also update auth metadata so Google-auth display names stay in sync
    await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });

    setSaving(false);
    if (dbErr) { setError('Gagal menyimpan. Coba lagi.'); return; }
    setSuccess(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-none">
      <div className="h-11" />
      <AppHeader title="Edit Profil" />

      <div className="px-5 pb-8 flex flex-col gap-5">
        {/* Avatar preview */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-[72px] h-[72px] rounded-[20px] bg-[#1A3448] flex items-center justify-center">
            <span className="font-boogaloo text-3xl text-white">
              {fullName ? getInitial(fullName) : '?'}
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280]">Inisial dari nama kamu</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InputField
              label="Nama Lengkap"
              placeholder="Nama lengkap kamu"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
            />
            <InputField
              label="Email"
              type="email"
              value={email}
              disabled
              placeholder="Email tidak bisa diubah"
            />
            <p className="text-[12px] text-[#9CA3AF] -mt-2 ml-1">
              Email terhubung ke akun dan tidak dapat diubah.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-600 text-center">✅ Profil berhasil diperbarui!</p>}

        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}
