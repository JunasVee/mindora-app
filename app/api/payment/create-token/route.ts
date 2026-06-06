import { NextRequest, NextResponse } from 'next/server';
import { createSnapToken } from '@/lib/midtrans';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const Schema = z.object({
  /**
   * 'booking'  — session with a professional
   * 'premium'  — MinDora Premium subscription
   */
  type: z.enum(['booking', 'premium']),
  amount: z.number().int().positive(),
  item_name: z.string().min(1),
  /** For booking: pass the professional_id so we can store it in order metadata */
  professional_id: z.string().optional(),
  time_slot: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, amount, item_name, professional_id, time_slot } = parsed.data;

  // Fetch user profile for customer details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  const customerName = profile?.full_name ?? 'MinDora User';
  const customerEmail = user.email ?? '';

  // Build a unique, meaningful order_id (MidTrans requires uniqueness per merchant)
  const timestamp = Date.now();
  const order_id =
    type === 'premium'
      ? `premium-${user.id.slice(0, 8)}-${timestamp}`
      : `booking-${(professional_id ?? 'x').slice(0, 8)}-${timestamp}`;

  try {
    const { token, redirect_url } = await createSnapToken({
      order_id,
      gross_amount: amount,
      item_name,
      customer_name: customerName,
      customer_email: customerEmail,
    });

    return NextResponse.json({ token, redirect_url, order_id });
  } catch (err: any) {
    console.error('MidTrans create-token error:', err?.message);
    return NextResponse.json(
      { error: 'Gagal membuat sesi pembayaran. Coba lagi.' },
      { status: 502 },
    );
  }
}
