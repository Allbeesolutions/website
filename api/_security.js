const crypto = require('node:crypto');
const buckets = new Map();

function requestBody(req, max = 256 * 1024) {
  const length = req.headers && req.headers['content-length'];
  if (length !== undefined && (!/^\d+$/.test(String(length)) || Number(length) > max)) {
    return { ok: false, code: 413, error: 'request_too_large' };
  }
  // JSON body parsers can remove Content-Length or provide an object. Validate
  // the actual payload too, including uploads that have a larger explicit cap.
  try {
    const body = req.body;
    const bytes = Buffer.isBuffer(body) ? body.length :
      typeof body === 'string' ? Buffer.byteLength(body, 'utf8') :
      body && typeof body === 'object' ? Buffer.byteLength(JSON.stringify(body), 'utf8') : 0;
    if (bytes > max || req.rawBody && Buffer.byteLength(req.rawBody) > max) {
      return { ok: false, code: 413, error: 'request_too_large' };
    }
  } catch {
    return { ok: false, code: 400, error: 'invalid_request' };
  }
  return { ok: true };
}

function rateLimit(req, key = 'api', limit = 30, windowMs = 60_000) {
  const h = req.headers || {};
  // Best-effort instance-local limiter; never treat forwarded IP as identity.
  // Prefer the last proxy hop rather than an arbitrary client-supplied first hop.
  const ip = String(h['x-real-ip'] || h['x-forwarded-for'] || '').split(',').pop().trim().slice(0, 80) || 'unknown';
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  // Bounded housekeeping; this limiter is best-effort per instance, not global.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k);
    if (buckets.size > 5000) buckets.clear();
  }
  const old = buckets.get(bucketKey);
  if (!old || now - old.start >= windowMs) {
    buckets.set(bucketKey, { start: now, count: 1 });
    return { ok: true };
  }
  old.count += 1;
  if (old.count > limit) return { ok: false, retryAfter: Math.ceil((windowMs - (now - old.start)) / 1000) };
  return { ok: true };
}

function guard(req, res, key, limit, windowMs = 60_000, maxBodyBytes = 256 * 1024) {
  const size = requestBody(req, maxBodyBytes);
  if (!size.ok) {
    res.statusCode = size.code;
    res.end(JSON.stringify({ ok:false, error:size.error }));
    return true;
  }
  const rl = rateLimit(req, key, limit, windowMs);
  if (!rl.ok) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    res.statusCode = 429;
    res.end(JSON.stringify({ ok:false, error:'rate_limited' }));
    return true;
  }
  return false;
}

function adminAuth(req) {
  const expected = process.env.ADMIN_PASSCODE || '';
  if (!expected) return {ok:false,code:503,error:'crm_not_configured'};
  const supplied = req.headers && req.headers['x-admin-pass'];
  if (typeof supplied !== 'string') return {ok:false,code:401,error:'unauthorized'};
  const providedBytes = Buffer.from(supplied, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return providedBytes.length === expectedBytes.length && crypto.timingSafeEqual(providedBytes,expectedBytes)
    ? {ok:true} : {ok:false,code:401,error:'unauthorized'};
}

function noStore(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

module.exports = { guard, noStore, adminAuth };
