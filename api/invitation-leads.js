/**
 * AllBee Invitations — Lead CRM data API (Vercel Serverless Function).
 *
 * Single data-access layer for the CRM (future-ready):
 *   - TODAY:    reads/writes a Google Sheet via the Apps Script web app.
 *   - TOMORROW: swap `listLeads`/`updateLead` to Supabase — the CRM page is unchanged.
 *
 * Auth: every request must send header `x-admin-pass` matching env ADMIN_PASSCODE.
 * No npm deps (global fetch). Graceful when unconfigured.
 *
 * Env vars (Vercel → Settings → Environment Variables):
 *   ADMIN_PASSCODE        passcode the AllBee team enters to open the CRM   [required]
 *   LEAD_APPS_SCRIPT_URL  Apps Script web-app URL (Sheet read/write)        [required for live data]
 *   LEAD_SHARED_SECRET    shared token the Apps Script verifies              [recommended]
 *
 * Endpoints:
 *   GET  /api/invitation-leads                 -> { ok, configured, leads:[...] }
 *   POST /api/invitation-leads  {action:'update', id, patch:{status,value,crm_note}}
 */

function authed(req) {
  const pass = req.headers['x-admin-pass'] || '';
  const expected = process.env.ADMIN_PASSCODE || '';
  if (!expected) return { ok: false, code: 503, error: 'crm_not_configured' };
  // length-safe compare
  if (pass.length !== expected.length) return { ok: false, code: 401, error: 'unauthorized' };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= pass.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return { ok: false, code: 401, error: 'unauthorized' };
  return { ok: true };
}

async function callScript(payload) {
  const url = process.env.LEAD_APPS_SCRIPT_URL;
  if (!url) return null; // not wired yet
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret: process.env.LEAD_SHARED_SECRET || '' }),
  });
  if (!res.ok) throw new Error('apps-script HTTP ' + res.status);
  return res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  const a = authed(req);
  if (!a.ok) { res.statusCode = a.code; return res.end(JSON.stringify({ ok: false, error: a.error })); }

  try {
    if (req.method === 'GET') {
      const data = await callScript({ action: 'list' });
      if (!data) { res.statusCode = 200; return res.end(JSON.stringify({ ok: true, configured: false, leads: [] })); }
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, configured: true, leads: data.leads || [] }));
    }

    if (req.method === 'POST') {
      let body = req.body;
      try { if (typeof body === 'string') body = JSON.parse(body || '{}'); } catch { body = {}; }
      if (!body || body.action !== 'update' || !body.id) {
        res.statusCode = 422; return res.end(JSON.stringify({ ok: false, error: 'bad_request' }));
      }
      const data = await callScript({ action: 'update', id: body.id, patch: body.patch || {} });
      if (!data) { res.statusCode = 200; return res.end(JSON.stringify({ ok: true, configured: false })); }
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, configured: true, lead: data.lead || null }));
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
  } catch (e) {
    console.error('[crm] error:', String(e.message || e));
    res.statusCode = 502;
    return res.end(JSON.stringify({ ok: false, error: 'upstream_error' }));
  }
};
