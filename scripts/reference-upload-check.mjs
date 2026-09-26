#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { issueToken, verifyToken } = require('../lib/reference-token.js');
const upload = require('../api/reference-upload.js');
const lead = require('../api/invitation-enquiry.js');
const originalFetch = global.fetch;
process.env.LEAD_SHARED_SECRET = 'regression-secret';
process.env.LEAD_APPS_SCRIPT_URL = 'https://example.invalid';
process.env.REFERENCE_UPLOAD_ENABLED = 'true';
const now = Date.now(), token = issueToken('AB-0001', process.env.LEAD_SHARED_SECRET, now);
assert.ok(verifyToken(token, 'AB-0001', process.env.LEAD_SHARED_SECRET, now));
assert.equal(verifyToken(token, 'AB-0002', process.env.LEAD_SHARED_SECRET, now), false);
assert.equal(verifyToken(token + 'x', 'AB-0001', process.env.LEAD_SHARED_SECRET, now), false);
assert.equal(verifyToken(token, 'AB-0001', process.env.LEAD_SHARED_SECRET, now + 3600001), false);
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(24)]).toString('base64');
const body = { lead_id:'AB-0001', upload_token:token, filename:'reference.png', mime:'image/png', data:png };
let forwarded;
global.fetch = async (_url, options) => {
  forwarded = JSON.parse(options.body);
  return { ok:true, json:async () => ({ ok:true, id:'private-drive-file' }) };
};
async function invoke(handler, request) {
  let payload, statusCode = 200;
  const res = { setHeader() {}, get statusCode(){ return statusCode; }, set statusCode(v){statusCode=v;}, end(value){ payload=JSON.parse(value); } };
  await handler(request, res);
  return { statusCode, payload };
}
assert.equal((await invoke(upload, { method:'GET' })).statusCode, 405);
assert.equal((await invoke(upload, { method:'POST', body:{ ...body, upload_token:'bad' } })).statusCode, 403);
assert.equal((await invoke(upload, { method:'POST', body:{ ...body, data:Buffer.alloc(32).toString('base64') } })).statusCode, 422);
assert.equal((await invoke(upload, { method:'POST', body:{ ...body, data:'A'.repeat(3e6) } })).statusCode, 422);
assert.equal((await invoke(upload, { method:'POST', body:{ ...body, mime:'image/svg+xml' } })).statusCode, 422);
assert.equal((await invoke(upload, { method:'POST', body })).statusCode, 200);
assert.equal(forwarded.action, 'reference_upload');
assert.equal(forwarded.lead_id, 'AB-0001');
assert.equal(forwarded.secret, process.env.LEAD_SHARED_SECRET);
global.fetch = async () => ({ ok:true, json:async () => ({ ok:false, error:'limit_reached' }) });
assert.equal((await invoke(upload, { method:'POST', body })).statusCode, 409);
global.fetch = async () => ({ ok:true, json:async () => ({ ok:true, id:'AB-0001' }) });
const leadResult = await invoke(lead, { method:'POST', body:{ name:'Test Customer', mobile:'9876543210', event_type:'Wedding', source:'design_brief', render_ts:now-5000 }, headers:{} });
assert.equal(leadResult.statusCode, 200);
assert.ok(verifyToken(leadResult.payload.upload_token, 'AB-0001', process.env.LEAD_SHARED_SECRET));
delete process.env.REFERENCE_UPLOAD_ENABLED;
assert.equal((await invoke(upload, { method:'POST', body })).statusCode, 503);
global.fetch = originalFetch;
console.log('Reference upload: token, validation, storage failure and feature gate passed');
