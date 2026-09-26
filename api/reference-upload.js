const { verifyToken } = require('../lib/reference-token');
const MAX_BYTES = 1536 * 1024;
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function matchesImage(bytes, mime) {
  if (mime === 'image/jpeg') return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png') return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === 'image/webp') return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, error, extra = {}) => { res.statusCode = status; return res.end(JSON.stringify({ ok: !error, ...(error ? { error } : {}), ...extra })); };
  if (req.method !== 'POST') return reply(405, 'method_not_allowed');
  const secret = process.env.LEAD_SHARED_SECRET;
  const url = process.env.LEAD_APPS_SCRIPT_URL;
  if (process.env.REFERENCE_UPLOAD_ENABLED !== 'true' || !secret || !url) return reply(503, 'upload_unavailable');
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch { return reply(400, 'invalid_request'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, 'invalid_request');
  const { lead_id: leadId, upload_token: token, mime, data, filename } = body;
  if (!verifyToken(token, leadId, secret)) return reply(403, 'invalid_upload_token');
  if (!Object.hasOwn(TYPES, mime) || typeof data !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data) ||
      data.length > Math.ceil(MAX_BYTES / 3) * 4 || typeof filename !== 'string' || filename.length > 180) return reply(422, 'invalid_image');
  const bytes = Buffer.from(data, 'base64');
  if (bytes.length < 16 || bytes.length > MAX_BYTES || !matchesImage(bytes, mime)) return reply(422, 'invalid_image');
  const cleanName = filename.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/^\.+/, '').slice(0, 70) || 'reference';
  try {
    const response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reference_upload', secret, lead_id: leadId, filename: cleanName, mime, data }),
      signal: AbortSignal.timeout(25000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ok !== true || !result.id) return reply(result && result.error === 'limit_reached' ? 409 : 502, result && result.error === 'limit_reached' ? 'limit_reached' : 'upload_failed');
    return reply(200, null, { id: String(result.id) });
  } catch { return reply(502, 'upload_failed'); }
};
