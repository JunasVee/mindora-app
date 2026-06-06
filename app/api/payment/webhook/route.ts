import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, resolvePaymentStatus } from '@/lib/midtrans';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * MidTrans sends a POST to this endpoint whenever a transaction status changes.
 * Configure this URL in:
 *   Sandbox:    dashboard.sandbox.midtrans.com → Settings → Configuration → Payment Notification URL
 *   Production: dashboard.midtrans.com         → Settings → Configuration → Payment Notification URL
 *
 * Set it to: https://your-vercel-domain.vercel.app/api/payment/webhook
 */
export async function POST(req: NextRequest) {
  let notification: any;
  try {
    notification = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 1. Verify signature to ensure request genuinely comes from MidTrans
  const isValid = verifyWebhookSignature({
    order_id:      notification.order_id,
    status_code:   notification.status_code,
    gross_amount:  notification.gross_amount,
    signature_key: notification.signature_key,
  });

  if (!isValid) {
    console.warn('MidTrans webhook: invalid signature for order', notification.order_id);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const paymentStatus = resolvePaymentStatus(
    notification.transaction_status,
    notification.fraud_status,
  );

  const orderId: string = notification.order_id ?? '';

  // 2. Supabase client (service role via server client — webhooks are server-to-server)
  const supabase = await createServerSupabaseClient();

  // ── Premium purchase ────────────────────────────────────────────────────
  if (orderId.startsWith('premium-')) {
    if (paymentStatus === 'paid') {
      // Extract user_id slice we embedded in the order_id: "premium-{userId8}-{timestamp}"
      const parts = orderId.split('-');
      // user_id slice is parts[1]; match against profiles
      const userSlice = parts[1];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', `${userSlice}%`);

      if (profiles && profiles.length === 1) {
        await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', profiles[0].id);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── Booking payment ─────────────────────────────────────────────────────
  if (orderId.startsWith('booking-')) {
    // Update booking by order_id stored at creation time
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : paymentStatus === 'failed' ? 'cancelled' : 'pending',
        midtrans_order_id: orderId,
      })
      .eq('midtrans_order_id', orderId);

    if (error) {
      console.error('Webhook: failed to update booking', error.message);
    }
    return NextResponse.json({ ok: true });
  }

  // Unknown order type — acknowledge so MidTrans doesn't retry endlessly
  return NextResponse.json({ ok: true });
}
