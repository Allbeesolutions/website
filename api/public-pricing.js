const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogacjpwlbhmonycjevml.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FALLBACK = [
  { service_slug:'invitation-pdf', package_slug:'basic', label:'Basic PDF', price:299 },
  { service_slug:'invitation-pdf', package_slug:'premium', label:'Premium PDF', price:599 },
  { service_slug:'invitation-pdf', package_slug:'elite', label:'Elite PDF', price:999 },
  { service_slug:'invitation-website', package_slug:'basic', label:'Basic Website', price:999 },
  { service_slug:'invitation-website', package_slug:'premium', label:'Premium Website', price:1999 },
  { service_slug:'invitation-website', package_slug:'elite', label:'Elite Website', price:3999 },
  { service_slug:'invitation-both', package_slug:'basic', label:'Basic PDF + Website', price:1299 },
  { service_slug:'invitation-both', package_slug:'premium', label:'Premium PDF + Website', price:2499 },
  { service_slug:'invitation-both', package_slug:'elite', label:'Elite PDF + Website', price:4999 }
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    if (!SUPABASE_KEY) return res.status(200).json({ ok: true, source: 'fallback', rows: FALLBACK });
    const url = `${SUPABASE_URL}/rest/v1/knowledge_public_pricing_catalog?select=*&order=service_slug,package_slug,source_type,label`;
    const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' } });
    if (!r.ok) throw new Error(`Pricing catalog request failed (${r.status})`);
    const rows = await r.json();
    return res.status(200).json({ ok: true, updatedAt: new Date().toISOString(), rows });
  } catch (error) {
    console.error('public-pricing:', error);
    return res.status(200).json({ ok: true, source: 'fallback', rows: FALLBACK });
  }
}
