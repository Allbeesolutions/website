/**
 * AllBee Invitations — Razorpay order webhook (Vercel Serverless Function).
 * On payment.captured: verify signature (idempotent) and persist the order to
 * the "Orders" sheet via the Apps Script (status "New"). Future-ready: swap the
 * Apps Script call for Supabase later.
 *
 * Env: RAZORPAY_WEBHOOK_SECRET, LEAD_APPS_SCRIPT_URL, LEAD_SHARED_SECRET
 *
 * NOTE: configure this URL in Razorpay Dashboard → Webhooks for the
 * `payment.captured` event, using RAZORPAY_WEBHOOK_SECRET as the secret.
 */
const { guard, noStore } = require('./_security');
const crypto = require('crypto');

async function readRaw(req) {
  // Accessing Vercel's req.body getter parses and consumes the stream. Read the
  // original bytes first so the Razorpay signature covers the exact payload.
  if (req.rawBody) return Buffer.from(req.rawBody);
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk); size += bytes.length;
    if (size > 1024 * 1024) throw new Error('payload_too_large');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  noStore(res); const blocked = guard(req, res, 'order-webhook', 60); if (blocked) return;
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false })); }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) { res.statusCode = 503; return res.end(JSON.stringify({ ok:false, error:'webhook_not_configured' })); }
  let raw;
  try { raw = await readRaw(req); }
  catch { res.statusCode = 413; return res.end(JSON.stringify({ ok:false, error:'invalid_payload' })); }

  // The exact raw bytes must match the signature. Never accept unsigned events.
  const sig = req.headers['x-razorpay-signature'] || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!/^[a-f0-9]{64}$/i.test(sig) ||
      !crypto.timingSafeEqual(Buffer.from(sig.toLowerCase(), 'hex'), Buffer.from(expected, 'hex'))) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ ok:false, error:'bad_signature' }));
  }

  let evt; try { evt = JSON.parse(raw || '{}'); } catch { evt = {}; }
  const ev = evt.event || '';
  const pay = (evt.payload && evt.payload.payment && evt.payload.payment.entity) || {};
  const ref = (evt.payload && evt.payload.refund && evt.payload.refund.entity) || {};
  const url = process.env.LEAD_APPS_SCRIPT_URL;

  // Customer details are attached to the Razorpay order at creation, not to
  // the payment. Fetch that order after verifying the signed webhook.
  async function orderForPayment() {
    if (!pay.id || !/^order_[A-Za-z0-9]+$/.test(pay.order_id || '') || !Number.isSafeInteger(pay.amount) || pay.amount <= 0 || pay.currency !== 'INR') throw new Error('invalid_payment');
    const key = process.env.RAZORPAY_KEY_ID, secretKey = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secretKey) throw new Error('gateway_not_configured');
    const response = await fetch('https://api.razorpay.com/v1/orders/' + pay.order_id, {
      headers: { Authorization: 'Basic ' + Buffer.from(key + ':' + secretKey).toString('base64') }
    });
    const order = await response.json().catch(() => null);
    if (!response.ok || !order || order.id !== pay.order_id || order.currency !== 'INR' || order.amount !== pay.amount) throw new Error('order_mismatch');
    const notes = order.notes;
    if (!notes || typeof notes !== 'object' || !notes.name || !notes.mobile || !notes.event || !notes.type || !notes.pkg) throw new Error('order_details_missing');
    return { order, notes };
  }

  // Persist via Apps Script. order_create is idempotent (dedups by payment_id),
  // so duplicate/retried webhooks are safe.
  async function persist(payload) {
    if (!url || !process.env.LEAD_SHARED_SECRET) throw new Error('sheet_not_configured');
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, secret: process.env.LEAD_SHARED_SECRET }) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ok !== true || !result.id) throw new Error('sheet_rejected_event');
    return result;
  }

  try {
  if (ev === 'payment.captured') {
    const { order, notes: n } = await orderForPayment();
    await persist({ action: 'order_create',
      payment_id: pay.id, amount: pay.amount / 100,
      name: n.name, mobile: n.mobile, email: n.email,
      event_type: n.event, invitation_type: n.type, package: n.pkg,
      event_date: n.event_date, receipt: order.receipt, lead_id: n.lead_id, source: n.source,
      template_id: n.template_id, template_name: n.template_name, demo: n.demo });
  } else if (ev === 'payment.failed') {
    await persist({ action: 'order_mark', payment_id: pay.id, status: 'Payment Failed',
      note: 'Payment failed — ' + (pay.error_description || pay.error_reason || pay.error_code || 'unknown') });
  } else if (ev === 'refund.created' || ev === 'refund.processed') {
    await persist({ action: 'order_mark', payment_id: ref.payment_id, status: 'Refunded',
      note: ev + ' — ₹' + ((ref.amount || 0) / 100) + ' (refund ' + (ref.id || '') + ')' });
    } else {
      res.statusCode = 200; return res.end(JSON.stringify({ ok:true, ignored:true, event: ev }));
    }
  } catch (error) {
    console.error('[order-webhook] persistence failed:', ev, String(error.message || error));
    res.statusCode = 503;
    return res.end(JSON.stringify({ ok:false, error:'persistence_unavailable' }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok:true, event: ev }));
};
