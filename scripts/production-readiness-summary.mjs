#!/usr/bin/env node
// Public/read-only configuration readiness; do not print environment variables,
// secret values, account IDs, customer records or authorization headers.
import {appendFileSync} from 'node:fs';
if(!process.argv.includes('--live')) {
  console.log('Usage: node scripts/production-readiness-summary.mjs --live');
  process.exit(0);
}
const endpoint='https://www.allbeesolutions.com/api/health';
const response=await fetch(endpoint,{method:'GET',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
if(!response.ok)throw new Error('Public health probe failed: HTTP '+response.status);
const data=await response.json();
if(!data || typeof data.ready!=='boolean' || !data.checks || typeof data.checks!=='object')throw new Error('Health schema unexpectedly changed');
const allowed=['razorpay','webhook','appsScript','crm','notifyEmail','tracking'];
for(const key of allowed)if(typeof data.checks[key]!=='boolean')throw new Error('Expected readiness field missing: '+key);
const lines=['## AllBee production readiness (configuration only)','',
  '| Subsystem | Status |','|---|---|',...allowed.map(k=>`| ${k} | ${data.checks[k]?'Configured':'Not configured'} |`),
  '',`**Overall ready:** ${data.ready?'Yes':'No'}`,
  '', 'This checks public configuration indicators only; it does not verify payments, private data recovery or customer workflows.',
];
const brief=lines.join('\n')+'\n';
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,brief);
console.log('Readiness booleans: '+allowed.map(k=>k+'='+data.checks[k]).join(', '));
if(!data.ready)console.warn('Payment/launch configuration is not fully ready; do not treat this as confirmation of live checkout.');
