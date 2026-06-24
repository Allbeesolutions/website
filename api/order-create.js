/**
 * AllBee Invitations — create an order (Vercel Serverless Function).
 * Computes the authoritative price server-side and creates a Razorpay order.
 * Gracefully returns {configured:false} when Razorpay keys are not set, so the
 * order wizard can fall back to capturing the order (no customer lost).
 *
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET   [required for live payments]
 */

// Configurable pricing structure (must mirror the wizard display).
const PRICING = {
  'PDF Invitation':       { Basic: 299,  Premium: 599,  Elite: 999 },
  'Website Invitation':   { Basic: 999,  Premium: 1999, Elite: 3999 },
  'Both (PDF + Website)': { Basic: 1299, Premium: 2499, Elite: 4999 },
};
const EVENTS = ['Wedding','Nikah','Birthday','Housewarming','Dargah Event','School Event','Business Event','Political Event','Other'];

const s = v => (typeof v === 'string' ? v.trim() : '');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false, error:'method_not_allowed' })); }

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b || '{}'); if (!b || typeof b !== 'object') b = {}; } catch { b = {}; }

  const event = s(b.event), type = s(b.type), pkg = s(b.pkg);
  const name = s(b.name).slice(0,80), mobile = s(b.mobile).slice(0,20), email = s(b.email).slice(0,120);
  const event_date = s(b.event_date).slice(0,20);
  const lead_id = s(b.lead_id).slice(0,20), source = s(b.source).slice(0,60) || '/order';

  // validate + authoritative price
  const price = PRICING[type] && PRICING[type][pkg];
  if (!EVENTS.includes(event) || !price || name.length < 2 || !/^[+0-9 ()\-]{8,20}$/.test(mobile)) {
    res.statusCode = 422; return res.end(JSON.stringify({ ok:false, error:'validation_error' }));
  }
  const amountPaise = price * 100;
  const receipt = 'ORD-' + Date.now().toString(36).toUpperCase();

  const KEY = process.env.RAZORPAY_KEY_ID, SECRET = process.env.RAZORPAY_KEY_SECRET;
  if (!KEY || !SECRET) {
    // Not wired yet → tell the client to use the capture fallback.
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok:true, configured:false, amount:amountPaise, receipt }));
  }

  try {
    const auth = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const rp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise, currency: 'INR', receipt,
        notes: { event, type, pkg, name, mobile, email, event_date, receipt, lead_id, source },
      }),
    });
    const order = await rp.json();
    if (!rp.ok || !order.id) throw new Error('razorpay ' + rp.status);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok:true, configured:true, order_id:order.id, amount:amountPaise, key_id:KEY, receipt }));
  } catch (e) {
    console.error('[order-create] error:', String(e.message || e));
    res.statusCode = 502;
    return res.end(JSON.stringify({ ok:false, error:'gateway_error' }));
  }
};
