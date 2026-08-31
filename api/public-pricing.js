const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ogacjpwlbhmonycjevml.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_2lhngh_yUr9nY_pIbfsRqw_ZX2IjNPu';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  try {
    const url = `${SUPABASE_URL}/rest/v1/knowledge_public_pricing_catalog?select=*&order=service_slug,package_slug,source_type,label`;
    const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!r.ok) throw new Error(`Pricing catalog request failed (${r.status})`);
    const rows = await r.json();
    return res.status(200).json({ ok: true, updatedAt: new Date().toISOString(), rows });
  } catch (error) {
    console.error('public-pricing:', error);
    return res.status(200).json({ ok: false, rows: [], error: 'Live pricing is temporarily unavailable.' });
  }
}
