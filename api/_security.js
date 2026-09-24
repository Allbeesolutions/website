const buckets = new Map();

function requestBody(req) {
  if (req.headers && Number(req.headers['content-length'] || 0) > 256 * 1024) {
    return { ok: false, code: 413, error: 'request_too_large' };
  }
  return { ok: true };
}

function rateLimit(req, key = 'api', limit = 30, windowMs = 60_000) {
  const h = req.headers || {};
  const ip = String(h['x-forwarded-for'] || h['x-real-ip'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  const old = buckets.get(bucketKey);
  if (!old || now - old.start >= windowMs) {
    buckets.set(bucketKey, { start: now, count: 1 });
    return { ok: true };
  }
  old.count += 1;
  if (old.count > limit) return { ok: false, retryAfter: Math.ceil((windowMs - (now - old.start)) / 1000) };
  return { ok: true };
}

function guard(req, res, key, limit) {
  const size = requestBody(req);
  if (!size.ok) { res.statusCode = size.code; return res.end(JSON.stringify({ ok:false, error:size.error })); }
  const rl = rateLimit(req, key, limit);
  if (!rl.ok) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    res.statusCode = 429;
    return res.end(JSON.stringify({ ok:false, error:'rate_limited' }));
  }
  return null;
}

function noStore(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

module.exports = { guard, noStore };
