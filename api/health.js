/**
 * AllBee Invitations — launch readiness probe.
 * Returns ONLY booleans about whether each integration's env vars are present
 * (never the values). Powers /admin/launch.
 */
module.exports = async (req, res) => {
  const env = process.env;
  const has = (...keys) => keys.every(k => !!(env[k] && String(env[k]).trim()));
  const checks = {
    razorpay:   has('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'),
    webhook:    has('RAZORPAY_WEBHOOK_SECRET'),
    appsScript: has('LEAD_APPS_SCRIPT_URL', 'LEAD_SHARED_SECRET'),
    crm:        has('ADMIN_PASSCODE'),
    notifyEmail: has('NOTIFY_EMAIL'),
  };
  checks.tracking = checks.appsScript; // /track-order needs the data layer
  const required = ['razorpay', 'webhook', 'appsScript', 'crm', 'tracking'];
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ok: true, checks, ready: required.every(k => checks[k]) }));
};
