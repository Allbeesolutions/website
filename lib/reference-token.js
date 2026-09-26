const crypto = require('node:crypto');
const TTL_MS = 60 * 60 * 1000;
const LEAD_ID = /^AB-\d{4,12}$/;

function issueToken(leadId, secret, now = Date.now()) {
  if (!LEAD_ID.test(leadId) || !secret) return null;
  const payload = Buffer.from(JSON.stringify({ id: leadId, exp: now + TTL_MS })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return payload + '.' + signature;
}
function verifyToken(token, leadId, secret, now = Date.now()) {
  if (!secret || !LEAD_ID.test(leadId) || typeof token !== 'string' || token.length > 400) return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[1])) return false;
  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest();
  const actual = Buffer.from(parts[1], 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return data.id === leadId && Number.isSafeInteger(data.exp) && data.exp > now && data.exp <= now + TTL_MS;
  } catch { return false; }
}
module.exports = { issueToken, verifyToken };
