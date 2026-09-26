#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { issueToken, verifyToken } = require('../lib/reference-token.js');
const upload = require('../api/reference-upload.js');
const brief = require('../api/design-brief.js');
const originalFetch = global.fetch;
process.env.LEAD_SHARED_SECRET = 'regression-secret';
process.env.LEAD_APPS_SCRIPT_URL = 'https://example.invalid';
process.env.REFERENCE_UPLOAD_ENABLED = 'true';
const now = Date.now(), token = issueToken('ORD-MXABC123', process.env.LEAD_SHARED_SECRET, now);
assert.ok(verifyToken(token, 'ORD-MXABC123', process.env.LEAD_SHARED_SECRET, now));
assert.equal(verifyToken(token, 'ORD-MXABC124', process.env.LEAD_SHARED_SECRET, now), false);
assert.equal(verifyToken(token + 'x', 'ORD-MXABC123', process.env.LEAD_SHARED_SECRET, now), false);
assert.equal(verifyToken(token, 'ORD-MXABC123', process.env.LEAD_SHARED_SECRET, now + 3600001), false);
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(24)]).toString('base64');
const body = { order_id:'ORD-MXABC123', upload_token:token, filename:'reference.png', mime:'image/png', data:png };
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
assert.equal(forwarded.order_id, 'ORD-MXABC123');
assert.equal(forwarded.secret, process.env.LEAD_SHARED_SECRET);
global.fetch = async () => ({ ok:true, json:async () => ({ ok:false, error:'limit_reached' }) });
assert.equal((await invoke(upload, { method:'POST', body })).statusCode, 409);
global.fetch = async (_url, options) => {
  const action = JSON.parse(options.body).action;
  if (action === 'order_track') return { ok:true, json:async()=>({ok:true,order:{status:'Payment Confirmed'}}) };
  if (action === 'order_update') return { ok:true, json:async()=>({ok:true}) };
  throw new Error('unexpected action');
};
const briefResult = await invoke(brief, { method:'POST', body:{ order_id:'ORD-MXABC123', mobile:'9876543210', notes:'Design brief' }, headers:{} });
assert.equal(briefResult.statusCode, 200);
assert.ok(verifyToken(briefResult.payload.upload_token, 'ORD-MXABC123', process.env.LEAD_SHARED_SECRET));
global.fetch = async () => ({ ok:true, json:async()=>({ok:true,order:{status:'Payment Failed'}}) });
const unpaid = await invoke(brief, { method:'POST', body:{order_id:'ORD-MXABC123',mobile:'9876543210',notes:'Not paid'},headers:{} });
assert.equal(unpaid.statusCode, 403);
assert.equal(unpaid.payload.upload_token, undefined);
delete process.env.REFERENCE_UPLOAD_ENABLED;
assert.equal((await invoke(upload, { method:'POST', body })).statusCode, 503);
global.fetch = originalFetch;
console.log('Reference upload: token, validation, storage failure and feature gate passed');
