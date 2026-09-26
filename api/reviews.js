/**
 * AllBee Invitations — reviews API.
 *   GET                         → public list (approved only) for the catalog
 *   POST {action:'submit',...}  → public review submission (spam-guarded, stored unapproved)
 *   POST {action:'list'}        → admin: all reviews (x-admin-pass)
 *   POST {action:'moderate',id,moderated} → admin: approve/reject (x-admin-pass)
 *
 * Env: LEAD_APPS_SCRIPT_URL, LEAD_SHARED_SECRET, ADMIN_PASSCODE
 */
const s = v => (typeof v === 'string' ? v.trim() : '');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = process.env.LEAD_APPS_SCRIPT_URL, secret = process.env.LEAD_SHARED_SECRET || '';
  async function script(payload) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, secret }) });
    if (!r.ok) throw new Error('review store unavailable');
    return r.json();
  }

  // ---- public approved list (catalog) ----
  if (req.method === 'GET') {
    if (!url) { res.statusCode = 200; return res.end(JSON.stringify({ ok:true, configured:false, reviews:[] })); }
    try { const d = await script({ action:'review_public' }); if (!d || d.ok !== true || !Array.isArray(d.reviews)) throw new Error('review feed failed'); return res.end(JSON.stringify({ ok:true, configured:true, reviews:d.reviews })); }
    catch { res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' })); }
  }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false })); }

  let b = req.body; try { if (typeof b === 'string') b = JSON.parse(b || '{}'); if (!b || typeof b !== 'object') b = {}; } catch { b = {}; }
  const action = b.action || 'submit';

  // ---- admin: list / moderate ----
  if (action === 'list' || action === 'moderate') {
    const exp = process.env.ADMIN_PASSCODE || '';
    if (!exp) { res.statusCode = 503; return res.end(JSON.stringify({ ok:false, error:'crm_not_configured' })); }
    if ((req.headers['x-admin-pass'] || '') !== exp) { res.statusCode = 401; return res.end(JSON.stringify({ ok:false, error:'unauthorized' })); }
    if (!url) { res.statusCode = 200; return res.end(JSON.stringify({ ok:true, configured:false, reviews:[] })); }
    try {
      if (action === 'list') { const d = await script({ action:'review_list' }); if (!d || d.ok !== true || !Array.isArray(d.reviews)) throw new Error('review list failed'); return res.end(JSON.stringify({ ok:true, configured:true, reviews:d.reviews })); }
      const d = await script({ action:'review_moderate', id: s(b.id).slice(0,20), moderated: !!b.moderated });
      if (!d || d.ok !== true) { res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' })); }
      return res.end(JSON.stringify({ ok:true }));
    } catch { res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' })); }
  }

  // ---- public submit (honeypot + time-trap, stored unapproved) ----
  if (b._gotcha) { return res.end(JSON.stringify({ ok:true })); }
  const elapsed = Number(b.render_ts) ? Date.now() - Number(b.render_ts) : 9999;
  if (elapsed < 1500) { return res.end(JSON.stringify({ ok:true })); }
  const name = s(b.name).slice(0,60), review = s(b.review).slice(0,600);
  const rating = Number(b.rating);
  if (name.length < 2 || review.length < 4 || !Number.isInteger(rating) || rating < 1 || rating > 5) { res.statusCode = 422; return res.end(JSON.stringify({ ok:false, error:'validation_error' })); }
  if (!url) { res.statusCode = 503; return res.end(JSON.stringify({ ok:false, configured:false, error:'reviews_not_configured' })); }
  try {
    const saved = await script({ action:'review_create', name, city:s(b.city).slice(0,40), event_type:s(b.event_type).slice(0,40),
      rating, review, template_id:s(b.template_id).slice(0,20), order_id:s(b.order_id).slice(0,24) });
    if (!saved || saved.ok !== true) { res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' })); }
    return res.end(JSON.stringify({ ok:true, configured:true }));
  } catch { res.statusCode = 502; return res.end(JSON.stringify({ ok:false, error:'gateway_error' })); }
};
