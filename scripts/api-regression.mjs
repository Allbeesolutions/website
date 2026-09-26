#!/usr/bin/env node
// Dependency-free regression checks for the Google Sheets adapter failure paths.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.ADMIN_PASSCODE = 'regression-only';
process.env.LEAD_APPS_SCRIPT_URL = 'https://example.invalid';
process.env.LEAD_SHARED_SECRET = 'regression-secret';

async function invoke(handler, method, body, response, admin = true) {
  global.fetch = async () => ({ ok: true, json: async () => response });
  let statusCode = 200, payload;
  const res = { setHeader() {}, get statusCode() { return statusCode; }, set statusCode(value) { statusCode = value; }, end(data) { payload = JSON.parse(data); } };
  await handler({ method, body, headers: admin ? { 'x-admin-pass': 'regression-only' } : {} }, res);
  return { statusCode, payload };
}

for (const [name, field] of [['invitation-leads', 'leads'], ['invitation-orders', 'orders']]) {
  const handler = require(`../api/${name}.js`);
  const body = { action: 'update', id: 'example', patch: { status: 'Payment Confirmed' } };
  assert.equal((await invoke(handler, 'GET', null, { ok: false })).statusCode, 502);
  assert.equal((await invoke(handler, 'GET', null, { ok: true })).statusCode, 502);
  assert.equal((await invoke(handler, 'GET', null, { ok: true, [field]: [] })).statusCode, 200);
  assert.equal((await invoke(handler, 'POST', body, { ok: false, error: 'not_found' })).statusCode, 502);
  assert.equal((await invoke(handler, 'POST', body, { ok: true })).statusCode, 200);
}

const reviews = require('../api/reviews.js');
const review = { action: 'submit', name: 'Test Customer', review: 'Useful invitation.', rating: 5, render_ts: Date.now() - 5000 };
assert.equal((await invoke(reviews, 'GET', null, { ok: false }, false)).statusCode, 502);
assert.equal((await invoke(reviews, 'GET', null, { ok: true, reviews: [] }, false)).statusCode, 200);
assert.equal((await invoke(reviews, 'POST', review, { ok: false }, false)).statusCode, 502);
assert.equal((await invoke(reviews, 'POST', review, { ok: true, id: 'REV-1' }, false)).payload.configured, true);
assert.equal((await invoke(reviews, 'POST', { action: 'moderate', id: 'REV-1', moderated: true }, { ok: false })).statusCode, 502);
assert.equal((await invoke(reviews, 'POST', { ...review, rating: 0 }, { ok: true }, false)).statusCode, 422);
const track = require('../api/track-order.js');
async function trackResult(upstream) {
  global.fetch = async () => ({ok:true,json:async()=>upstream});
  let statusCode=200,payload;
  const res={setHeader(){},get statusCode(){return statusCode;},set statusCode(v){statusCode=v;},end(v){payload=JSON.parse(v);}};
  await track({method:'POST',body:{order_id:'ORD-TEST1234',mobile:'0000000000'},headers:{}},res);
  return {statusCode,payload};
}
assert.equal((await trackResult({ok:true})).payload.error,'not_found');
assert.equal((await trackResult({ok:true,order:{id:'ORD-OTHER'}})).payload.error,'not_found');
assert.equal((await trackResult({ok:true,order:{id:'ORD-TEST1234',status:'Delivered'}})).payload.order.status,'Delivered');
delete process.env.LEAD_APPS_SCRIPT_URL;
assert.equal((await invoke(reviews, 'POST', review, null, false)).statusCode, 503);
console.log('API regression: lead, order and review failure paths passed');
