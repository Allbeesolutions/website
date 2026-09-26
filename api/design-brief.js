/**
 * Paid-order design brief endpoint.
 * Validates the order against the private Apps Script order tracker before
 * forwarding the brief. The browser never receives the shared secret.
 */
const { guard, noStore } = require('./_security');
const { issueToken } = require('../lib/reference-token');
const clean = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const digits = v => clean(v, 30).replace(/\D/g, '').slice(-10);

module.exports = async (req, res) => {
  noStore(res);
  const blocked = guard(req, res, 'design-brief', 20); if (blocked) return;
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false, error:'method_not_allowed' })); }
  const url = process.env.LEAD_APPS_SCRIPT_URL;
  const secret = process.env.LEAD_SHARED_SECRET;
  if (!url || !secret) { res.statusCode = 503; return res.end(JSON.stringify({ ok:false, error:'design_brief_not_configured' })); }
  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b || '{}'); } catch { b = {}; }
  b = b && typeof b === 'object' ? b : {};
  const orderId = clean(b.order_id, 40), mobile = digits(b.mobile);
  if (!orderId || mobile.length !== 10) { res.statusCode = 422; return res.end(JSON.stringify({ ok:false, error:'order_and_mobile_required' })); }

  try {
    const lookup = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ action:'order_track', id:orderId, mobile, secret }) });
    const tracked = await lookup.json().catch(() => ({}));
    const status = String(tracked && tracked.order && tracked.order.status || '').toLowerCase();
    if (!tracked.ok || !['payment confirmed','details submitted','designing','first preview ready','revision requested','revision in progress','final approval','delivered'].includes(status)) {
      res.statusCode = 403; return res.end(JSON.stringify({ ok:false, error:'paid_order_required' }));
    }
    const brief = {
      action:'order_update', id:orderId,
      patch:{ notes: clean(b.notes, 5000), status:'Details Submitted' },
      secret
    };
    const saved = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(brief) });
    if (!saved.ok) throw new Error('order update failed '+saved.status);
    const result = await saved.json().catch(() => ({}));
    if (!result.ok) throw new Error(result.error || 'order update rejected');
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok:true, order_id:orderId,
      ...(process.env.REFERENCE_UPLOAD_ENABLED === 'true' ? { upload_token:issueToken(orderId, secret) } : {}) }));
  } catch (e) {
    console.error('[design-brief]', String(e.message || e));
    res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'brief_save_failed' }));
  }
};
