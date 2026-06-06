import { createHash } from 'crypto';

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';

// Base URLs differ between sandbox and production
const SNAP_BASE = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

export const SNAP_JS_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

// Authorization header: Basic base64(ServerKey:)
function authHeader(): string {
  const encoded = Buffer.from(`${SERVER_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
}

export interface SnapTokenParams {
  order_id: string;
  gross_amount: number;
  item_name: string;
  customer_name: string;
  customer_email: string;
}

export interface SnapTokenResult {
  token: string;
  redirect_url: string;
}

/**
 * Creates a Snap payment token via MidTrans API.
 * Must only be called server-side (uses SERVER_KEY).
 */
export async function createSnapToken(params: SnapTokenParams): Promise<SnapTokenResult> {
  const body = {
    transaction_details: {
      order_id: params.order_id,
      gross_amount: params.gross_amount,
    },
    item_details: [
      {
        id: params.order_id,
        price: params.gross_amount,
        quantity: 1,
        name: params.item_name.slice(0, 50), // MidTrans max 50 chars
      },
    ],
    customer_details: {
      first_name: params.customer_name,
      email: params.customer_email,
    },
  };

  const res = await fetch(`${SNAP_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MidTrans API error ${res.status}: ${err}`);
  }

  return res.json() as Promise<SnapTokenResult>;
}

/**
 * Verifies a MidTrans webhook notification signature.
 * Formula: sha512(order_id + status_code + gross_amount + server_key)
 */
export function verifyWebhookSignature(notification: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const raw = `${notification.order_id}${notification.status_code}${notification.gross_amount}${SERVER_KEY}`;
  const expected = createHash('sha512').update(raw).digest('hex');
  return expected === notification.signature_key;
}

/**
 * Maps MidTrans transaction_status to a simple internal status.
 * https://docs.midtrans.com/reference/transaction-status
 */
export function resolvePaymentStatus(
  transactionStatus: string,
  fraudStatus?: string,
): 'paid' | 'pending' | 'failed' {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' ? 'paid' : 'failed';
  }
  if (transactionStatus === 'settlement') return 'paid';
  if (['pending', 'authorize'].includes(transactionStatus)) return 'pending';
  // cancel, deny, expire, refund, partial_refund, chargeback
  return 'failed';
}
