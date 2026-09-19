import crypto from 'crypto';

import Razorpay from 'razorpay';

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay test credentials are not configured.');
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function normalizeAmount(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const error = new Error('Booking amount must be a valid positive number.');
    error.statusCode = 400;
    throw error;
  }

  return Math.round(numericAmount * 100);
}

export async function createRazorpayOrder({ amountInRupees, receipt, notes = {} }) {
  const client = getClient();
  const amountInPaise = normalizeAmount(amountInRupees);

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: String(receipt || `order_${Date.now()}`),
    notes: {
      ...notes,
    },
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
    createdAt: order.created_at,
  };
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay secret is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  return generatedSignature === razorpay_signature;
}

export function verifyWebhookSignature(rawBody, signature, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
