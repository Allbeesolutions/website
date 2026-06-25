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
const crypto = require('crypto');

function readRaw(req) {
  return new Promise((resolve) => {
    if (typeof req.body === 'string') return resolve(req.body);
    if (req.body && typeof req.body === 'object' && req.rawBody) return resolve(req.rawBody.toString());
    let data = ''; req.on('data', c => data += c); req.on('end', () => resolve(data));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false })); }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const raw = await readRaw(req);

  // verify signature
  if (secret) {
    const sig = req.headers['x-razorpay-signature'] || '';
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (sig !== expected) { res.statusCode = 401; return res.end(JSON.stringify({ ok:false, error:'bad_signature' })); }
  }

  let evt; try { evt = JSON.parse(raw || '{}'); } catch { evt = {}; }
  const ev = evt.event || '';
  const pay = (evt.payload && evt.payload.payment && evt.payload.payment.entity) || {};
  const ref = (evt.payload && evt.payload.refund && evt.payload.refund.entity) || {};
  const n = pay.notes || {};
  const url = process.env.LEAD_APPS_SCRIPT_URL;

  // Persist via Apps Script. order_create is idempotent (dedups by payment_id),
  // so duplicate/retried webhooks are safe.
  async function persist(payload) {
    if (!url) { console.log('[order-webhook]', ev, 'no sheet configured:', pay.id || ref.id || ''); return; }
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, secret: process.env.LEAD_SHARED_SECRET || '' }) });
    } catch (e) { console.error('[order-webhook]', ev, 'persist failed:', String(e.message || e)); }
  }

  if (ev === 'payment.captured') {
    await persist({ action: 'order_create',
      payment_id: pay.id, amount: (pay.amount || 0) / 100,
      name: n.name, mobile: n.mobile, email: n.email,
      event_type: n.event, invitation_type: n.type, package: n.pkg,
      event_date: n.event_date, receipt: n.receipt, lead_id: n.lead_id, source: n.source,
      template_id: n.template_id, template_name: n.template_name, demo: n.demo });
  } else if (ev === 'payment.failed') {
    await persist({ action: 'order_mark', payment_id: pay.id, status: 'Payment Failed',
      note: 'Payment failed — ' + (pay.error_description || pay.error_reason || pay.error_code || 'unknown') + ' · ' + (n.name || '') + ' ' + (n.mobile || '') });
  } else if (ev === 'refund.created' || ev === 'refund.processed') {
    await persist({ action: 'order_mark', payment_id: ref.payment_id, status: 'Refunded',
      note: ev + ' — ₹' + ((ref.amount || 0) / 100) + ' (refund ' + (ref.id || '') + ')' });
  } else {
    res.statusCode = 200; return res.end(JSON.stringify({ ok:true, ignored:true, event: ev }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok:true, event: ev }));
};
