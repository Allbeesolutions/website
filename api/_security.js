const buckets = new Map();

function requestBody(req) {
  if (req.headers && Number(req.headers['content-length'] || 0) > 256 * 1024) {
    return { ok: false, code: 413, error: 'request_too_large' };
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

function guard(req, res, key, limit, windowMs = 60_000) {
  const size = requestBody(req);
  if (!size.ok) { res.statusCode = size.code; return res.end(JSON.stringify({ ok:false, error:size.error })); }
  const rl = rateLimit(req, key, limit, windowMs);
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
