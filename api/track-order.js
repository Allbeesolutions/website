/**
 * AllBee Invitations — public order tracking (no login).
 * POST { order_id, mobile } → looks up the order via Apps Script `order_track`
 * (matches Order ID + mobile digits) and returns a safe public subset.
 * Returns { ok:true, configured:false } when the data layer isn't wired yet,
 * so /track-order can fall back to demo mode.
 *
 * Env: LEAD_APPS_SCRIPT_URL, LEAD_SHARED_SECRET
 */
const s = v => (typeof v === 'string' ? v.trim() : '');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false, error:'method_not_allowed' })); }

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b || '{}'); if (!b || typeof b !== 'object') b = {}; } catch { b = {}; }
  const order_id = s(b.order_id).slice(0, 24);
  const mobile = s(b.mobile).slice(0, 20);
  if (!order_id || !mobile) { res.statusCode = 422; return res.end(JSON.stringify({ ok:false, error:'missing_fields' })); }

  const url = process.env.LEAD_APPS_SCRIPT_URL;
  if (!url) { res.statusCode = 200; return res.end(JSON.stringify({ ok:true, configured:false })); }

  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'order_track', id: order_id, mobile, secret: process.env.LEAD_SHARED_SECRET || '' }),
    });
    const d = await r.json();
    if (!d || !d.ok) { res.statusCode = 200; return res.end(JSON.stringify({ ok:false, configured:true, error:'not_found' })); }
    res.statusCode = 200; return res.end(JSON.stringify({ ok:true, configured:true, order: d.order }));
  } catch (e) {
    console.error('[track-order] error:', String(e.message || e));
    res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' }));
  }
};
