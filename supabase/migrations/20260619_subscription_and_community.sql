-- ════════════════════════════════════════════════════════════════════════
-- MinDora — Subscription Expiration + Komunitas (Anonymous Mood Wall)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Subscription expiration columns ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS expiry_notified_at timestamptz;

-- ── 2. RPC: lazily check & expire subscription, notify 3 days before ──────
-- Called from the client at premium-gated pages (dashboard, profile, premium,
-- forecast, report). SECURITY DEFINER so it can update profiles/notifications
-- even though the calling user only has RLS-restricted access to their own row.
CREATE OR REPLACE FUNCTION check_subscription_status(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_expires_at  timestamptz;
  v_is_premium  boolean;
  v_notified_at timestamptz;
BEGIN
  SELECT subscription_expires_at, is_premium, expiry_notified_at
  INTO v_expires_at, v_is_premium, v_notified_at
  FROM profiles
  WHERE id = p_user_id;

  IF v_is_premium IS NOT TRUE OR v_expires_at IS NULL THEN
    RETURN;
  END IF;

  -- Expired → downgrade
  IF v_expires_at < NOW() THEN
    UPDATE profiles
    SET is_premium = false,
        expiry_notified_at = NULL
    WHERE id = p_user_id;

    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      p_user_id,
      'subscription_expired',
      'Premium kamu sudah berakhir',
      'Langganan premium kamu sudah habis. Upgrade lagi untuk lanjut akses Mood Forecast dan Laporan Bulanan.',
      false
    );
    RETURN;
  END IF;

  -- Expiring within 3 days and not yet notified for this cycle → notify once
  IF v_expires_at < NOW() + INTERVAL '3 days'
     AND (v_notified_at IS NULL OR v_notified_at < v_expires_at - INTERVAL '7 days') THEN
    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      p_user_id,
      'subscription_expiring',
      'Premium kamu segera berakhir',
      'Langganan premium kamu akan berakhir dalam beberapa hari. Perpanjang sekarang agar tetap akses fitur premium.',
      false
    );

    UPDATE profiles
    SET expiry_notified_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Komunitas — anonymous mood wall ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  emotion     text,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_reactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       text NOT NULL CHECK (emoji IN ('💙', '🤗', '👏')),
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id, emoji)
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all posts (content is anonymous — user_id is
-- never selected/displayed by the client) and react/post as themselves.
DROP POLICY IF EXISTS "community_posts_select" ON community_posts;
CREATE POLICY "community_posts_select" ON community_posts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "community_posts_insert" ON community_posts;
CREATE POLICY "community_posts_insert" ON community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_reactions_select" ON community_reactions;
CREATE POLICY "community_reactions_select" ON community_reactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "community_reactions_insert" ON community_reactions;
CREATE POLICY "community_reactions_insert" ON community_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed a handful of dummy posts so the wall isn't empty on first load.
-- Uses the first existing profile as author (anonymous to all readers anyway).
DO $$
DECLARE
  v_seed_user uuid;
BEGIN
  SELECT id INTO v_seed_user FROM profiles ORDER BY created_at ASC LIMIT 1;

  IF v_seed_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM community_posts) THEN
    INSERT INTO community_posts (user_id, content, emotion, created_at) VALUES
      (v_seed_user, 'Minggu ini berat banget, tugas numpuk dan rasanya nggak ada habisnya. Tapi nulis ini aja udah bikin agak lega.', 'Cemas', NOW() - INTERVAL '2 days'),
      (v_seed_user, 'Akhirnya bisa tidur cukup setelah berminggu-minggu insomnia. Kecil tapi berasa banget.', 'Senang', NOW() - INTERVAL '1 day'),
      (v_seed_user, 'Kadang capek pura-pura baik-baik aja di depan orang lain. Semoga semua yang baca ini juga dikasih kekuatan ya.', 'Sedih', NOW() - INTERVAL '5 hours');
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════
-- Selesai. Setelah migration ini berjalan:
--   • Setiap pembayaran premium berhasil → set subscription_expires_at
--     (dilakukan otomatis dari app, tidak perlu manual)
--   • check_subscription_status(user_id) dipanggil dari app saat halaman
--     premium-gated dibuka — tidak butuh pg_cron
-- ════════════════════════════════════════════════════════════════════════
