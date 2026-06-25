/**
 * AllBee Invitations — lead capture endpoint (Vercel Serverless Function).
 *
 * Flow:  /invitation form  →  POST /api/invitation-enquiry  →
 *   1. validate + spam-check   2. capture timestamp / IP / source
 *   3. append to Google Sheet + email (via Apps Script web app)
 *   4. notify admin on WhatsApp (Cloud API or CallMeBot)
 *
 * No npm dependencies (uses global fetch on Vercel's Node runtime).
 * Every integration is OPTIONAL and gated on env vars — missing config
 * degrades gracefully (the lead is still logged for recovery, UX stays OK).
 *
 * Required/optional environment variables — set in the Vercel dashboard:
 *   LEAD_APPS_SCRIPT_URL   Google Apps Script web-app URL (Sheet + email)   [recommended]
 *   LEAD_SHARED_SECRET     shared token sent to the Apps Script             [recommended]
 *   WHATSAPP_TOKEN         Meta WhatsApp Cloud API permanent token          [optional]
 *   WHATSAPP_PHONE_ID      Cloud API phone-number ID                        [optional]
 *   WHATSAPP_ADMIN_TO      admin number in E.164, e.g. 918903607506         [optional]
 *   WHATSAPP_TEMPLATE      approved template name (default: lead_alert)     [optional]
 *   CALLMEBOT_PHONE        admin number for CallMeBot fallback              [optional]
 *   CALLMEBOT_APIKEY       CallMeBot API key                                [optional]
 */

const EVENT_TYPES = ['Wedding', 'Nikah', 'Birthday', 'Housewarming', 'Dargah Event',
  'School Event', 'Business Event', 'Political Event', 'Other'];
const INTEREST = ['PDF Invitation', 'Website Invitation', 'Both'];

const s = (v) => (typeof v === 'string' ? v.trim() : '');
const clip = (v, n) => s(v).slice(0, n);

function validate(b) {
  const errors = {};
  const name = clip(b.name, 80);
  const mobile = clip(b.mobile, 20);
  const email = clip(b.email, 120);
  const eventType = clip(b.event_type, 40);
  const eventDate = clip(b.event_date, 20);
  const notes = clip(b.notes, 2000);
  const template_id = clip(b.template_id, 20);
  const template_name = clip(b.template_name, 60);
  const demo = clip(b.demo, 40);
  let interested = Array.isArray(b.interested_in) ? b.interested_in : (b.interested_in ? [b.interested_in] : []);
  interested = interested.filter((x) => INTEREST.includes(x));

  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!/^[+0-9 ()\-]{8,20}$/.test(mobile)) errors.mobile = 'Enter a valid mobile number.';
  if (!EVENT_TYPES.includes(eventType)) errors.event_type = 'Select an event type.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email.';
  if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) errors.event_date = 'Invalid date.';

  return { errors, lead: { name, mobile, email, event_type: eventType, event_date: eventDate, interested_in: interested, notes, template_id, template_name, demo } };
}

function isSpam(b) {
  // 1) Honeypot — bots fill hidden fields
  if (s(b._gotcha)) return 'honeypot';
  // 2) Time-trap — submitted impossibly fast (or absurdly stale)
  const t = Number(b.render_ts);
  if (Number.isFinite(t)) {
    const dt = Date.now() - t;
    if (dt < 2000) return 'too-fast';
    if (dt > 1000 * 60 * 60 * 12) return 'stale';
  }
  return null;
}

async function sendToSheetAndEmail(lead) {
  const url = process.env.LEAD_APPS_SCRIPT_URL;
  if (!url) return { ok: false, skipped: 'no LEAD_APPS_SCRIPT_URL' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...lead, secret: process.env.LEAD_SHARED_SECRET || '' }),
  });
  if (!res.ok) throw new Error('apps-script HTTP ' + res.status);
  return { ok: true };
}

async function sendWhatsApp(lead) {
  const text =
    `🪔 New AllBee Invitations lead\n\n` +
    `Name: ${lead.name}\nMobile: ${lead.mobile}\nEmail: ${lead.email || '-'}\n` +
    `Event: ${lead.event_type}${lead.event_date ? ' (' + lead.event_date + ')' : ''}\n` +
    `Interested: ${(lead.interested_in || []).join(', ') || '-'}\n` +
    `Notes: ${lead.notes || '-'}`;

  // Preferred: Meta WhatsApp Cloud API (template message)
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_ADMIN_TO) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: process.env.WHATSAPP_ADMIN_TO,
        type: 'template',
        template: {
          name: process.env.WHATSAPP_TEMPLATE || 'lead_alert',
          language: { code: 'en' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: `${lead.name} · ${lead.mobile} · ${lead.event_type}` }] }],
        },
      }),
    });
    if (!res.ok) throw new Error('whatsapp cloud HTTP ' + res.status);
    return { ok: true, via: 'cloud-api' };
  }
  // Fallback: CallMeBot (zero Meta setup)
  if (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY) {
    const u = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(process.env.CALLMEBOT_PHONE)}` +
      `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
    const res = await fetch(u);
    if (!res.ok) throw new Error('callmebot HTTP ' + res.status);
    return { ok: true, via: 'callmebot' };
  }
  return { ok: false, skipped: 'whatsapp not configured' };
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
  }

  // Parse body (Vercel parses JSON into req.body; guard for string/raw)
  let body = req.body;
  try {
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body || typeof body !== 'object') body = {};
  } catch { body = {}; }

  // Spam → pretend success (don't tip off bots), do not process
  const spam = isSpam(body);
  if (spam) {
    console.warn('[lead] dropped spam:', spam);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true }));
  }

  // Validate
  const { errors, lead } = validate(body);
  if (Object.keys(errors).length) {
    res.statusCode = 422;
    return res.end(JSON.stringify({ ok: false, error: 'validation_error', fields: errors }));
  }

  // Enrich with server-side metadata
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '';
  const enriched = {
    ...lead,
    timestamp: new Date().toISOString(),
    source: clip(body.source, 120) || (req.headers['referer'] || '/invitation'),
    ip,
  };

  // Fan-out — never let one failure block the others or the response
  const results = {};
  try { results.sheet = await sendToSheetAndEmail(enriched); }
  catch (e) { results.sheet = { ok: false, error: String(e.message || e) }; }
  try { results.whatsapp = await sendWhatsApp(enriched); }
  catch (e) { results.whatsapp = { ok: false, error: String(e.message || e) }; }

  // If the primary store failed/unconfigured, log the full lead so it is recoverable
  if (!results.sheet.ok) {
    console.error('[lead] sheet sink failed — recoverable lead follows:', JSON.stringify({ lead: enriched, results }));
  } else {
    console.log('[lead] captured:', enriched.name, enriched.event_type, JSON.stringify(results));
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
};
