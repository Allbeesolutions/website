const catalog = require('../lib/catalog');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({
    ok: true,
    source: 'allbee-catalogue',
    rows: catalog.publicPricingRows,
  }));
};
