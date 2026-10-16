'use strict';
// Opt-in admin identity layer. Legacy mode is unchanged until an operator
// explicitly sets ADMIN_AUTH_MODE=totp together with all required secrets.
const crypto = require('node:crypto');
const COOKIE = '__Host-allbee_admin';
const SESSION_SECONDS = 4 * 60 * 60;
const mode = () => !process.env.ADMIN_AUTH_MODE || process.env.ADMIN_AUTH_MODE === 'legacy' ? 'legacy' : process.env.ADMIN_AUTH_MODE === 'totp' ? 'totp' : 'invalid';
const strongSecret = () => (process.env.ADMIN_SESSION_SECRET || '').length >= 32 ? process.env.ADMIN_SESSION_SECRET : null;
const allowedScopes = new Set(['leads', 'orders', 'reviews', 'overview']);
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{3,50}$/.test(id);
function roster() {
  if (mode() !== 'totp') return null;
  try {
    const list = JSON.parse(process.env.ADMIN_USERS_JSON || '');
    if (!Array.isArray(list) || !list.length || list.length > 50) return null;
    const seen = new Set();
    for (const u of list) {
      if (!u || !validId(u.id) || seen.has(u.id) ||
          !Array.isArray(u.scopes) || !u.scopes.length || u.scopes.some(s => !allowedScopes.has(s)) ||
          !/^[a-f0-9]{32}$/i.test(u.salt || '') || !/^[a-f0-9]{64}$/i.test(u.hash || '') ||
          !/^[A-Z2-7]{16,64}$/.test(u.totp || '') ||
          (u.version !== undefined && (!Number.isSafeInteger(u.version) || u.version < 0))) return null;
      seen.add(u.id);
    }
    if (!strongSecret() || !list.some(u => u.active !== false && u.scopes.includes('overview'))) return null;
    return list;
  } catch { return null; }
}
function compare(a, b) {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function passwordValid(password, user) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) return false;
  const derived = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 310000, 32, 'sha256');
  return compare(derived, Buffer.from(user.hash, 'hex'));
}
function base32Decode(input) {
  let bits = 0, count = 0; const bytes = [];
  for (const c of input) {
    const digit = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);
    if (digit < 0) return null;
    bits = (bits << 5) | digit;
    count += 5;
    if (count >= 8) { count -= 8; bytes.push((bits >>> count) & 255); }
  }
  return Buffer.from(bytes);
}
function totpValid(code, secret, now = Date.now()) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code) || !/^[A-Z2-7]{16,64}$/.test(secret)) return false;
  const key = base32Decode(secret), slot = Math.floor(now / 30000);
  for (const skew of [-1, 0, 1]) {
    const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(slot + skew));
    const hmac = crypto.createHmac('sha1', key).update(counter).digest();
    const offset = hmac[19] & 15;
    const value = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    if (compare(Buffer.from(String(value).padStart(6, '0')), Buffer.from(code))) return true;
  }
  return false;
}
function sign(value, secret) { return crypto.createHmac('sha256', secret).update(value).digest('base64url'); }
function issue(user, now = Date.now()) {
  const payload = { id:user.id, ver:user.version || 0, iat:Math.floor(now/1000), exp:Math.floor(now/1000)+SESSION_SECONDS };
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${value}.${sign(value, strongSecret())}`;
}
function sessionFromRequest(req, list = roster(), now = Date.now()) {
  if (!list) return null;
  const raw = (req.headers && req.headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
  if (!raw) return null;
  const token = raw.slice(COOKIE.length+1);
  if (token.length > 1600) return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !/^[a-zA-Z0-9_-]+$/.test(parts[0]) || !/^[a-zA-Z0-9_-]{43}$/.test(parts[1])) return null;
  if (!compare(Buffer.from(parts[1]), Buffer.from(sign(parts[0], strongSecret())))) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!validId(data.id) || !Number.isSafeInteger(data.exp) || !Number.isSafeInteger(data.iat) ||
        data.iat > Math.floor(now/1000)+30 || data.exp <= Math.floor(now/1000) ||
        data.exp > data.iat+SESSION_SECONDS) return null;
    const user = list.find(u=>u.id===data.id && u.active!==false && (u.version||0)===data.ver);
    return user || null;
  } catch { return null; }
}
function cookie(token, maxAge) {
  return `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
function sameOrigin(req) {
  const h = req.headers || {};
  if (h['sec-fetch-site'] && h['sec-fetch-site'] !== 'same-origin') return false;
  if (!h.origin && h['sec-fetch-site'] !== 'same-origin') return false;
  if (h.origin) {
    try {
      const host = h['x-forwarded-host'] || h.host;
      if (!host || new URL(h.origin).origin !== `https://${host}`) return false;
    } catch { return false; }
  }
  return true;
}
module.exports = { COOKIE, mode, roster, compare, passwordValid, totpValid, issue, sessionFromRequest, cookie, sameOrigin };
