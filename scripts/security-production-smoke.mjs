#!/usr/bin/env node
// Read-only production checks, invoked explicitly AFTER an approved deployment.
// No credentials or customer details sent, no forms/payments/record mutations.
if(!process.argv.includes('--live')){console.log('Usage: node scripts/security-production-smoke.mjs --live (read-only HTTPS smoke)');process.exit(0);}
const domain='https://www.allbeesolutions.com';
let count=0;
async function get(url) {
 const r=await fetch(domain+url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'Cache-Control':'no-cache'}});
 return r;
}
for(const path of ['/admin/ceo','/admin/invitation-leads','/admin/invitation-orders','/admin/reviews','/admin/launch','/order','/design-brief','/track-order','/review']) {
 const r=await get(path);
 if(r.status!==200)throw new Error(`Public page status ${path}: ${r.status}`);
 const header=r.headers.get('content-security-policy')||'';
 if(!header.includes("script-src-attr 'none'") || !header.includes("script-src 'self'"))throw new Error(`Strict CSP missing at ${path}`);
 const html=await r.text();
 if(!html.includes('/assets/'))throw new Error(`Expected self-hosted scripts absent at ${path}`);
 count++;
}
for(const [url,status] of [['/api/health',200],['/api/invitation-leads',401],['/api/invitation-orders',401],['/api/track-order',405],['/api/reference-upload',405],['/api/order-webhook',405]]){
 const r=await get(url);if(r.status!==status)throw new Error(`Expected ${status} at ${url}, received ${r.status}`);count++;
}
const session=await get('/api/health?admin_session=1');
if(session.status!==200)throw new Error('Admin session endpoint missing');
const meta=await session.json();
if(!['legacy','totp'].includes(meta.mode))throw new Error('Admin authentication mode is invalid');
count++;
console.log(`Production read-only smoke: ${count} checks passed. Auth mode: ${meta.mode}. No state mutated.`);
