import { createClient } from '@/lib/supabase';

/**
 * Lazily expires premium subscriptions past their subscription_expires_at
 * date and fires a heads-up notification ~3 days before expiry. There's no
 * cron job — this runs on the client whenever a premium-gated page loads,
 * via the check_subscription_status() Postgres function (SECURITY DEFINER).
 *
 * Safe to call even if the user isn't premium or has no expiry set — the
 * RPC no-ops in that case.
 */
export async function checkSubscriptionStatus(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('check_subscription_status', { p_user_id: userId });
  } catch {
    // Non-critical — worst case the user sees stale premium status for one
    // more page load and it self-corrects next time.
  }
}
