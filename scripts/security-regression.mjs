#!/usr/bin/env node
// Safe, synthetic security regression tests. Never contact production.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import crypto from 'node:crypto';
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
const { cellText, cellFields } = require('../lib/sheet-safety.js');
assert.equal(cellText('=SUM(1,1)'), "'=SUM(1,1)");
assert.equal(cellText('  +IMPORTXML(A1,B1)'), "'  +IMPORTXML(A1,B1)");
assert.equal(cellText('normal message'), 'normal message');
assert.equal(cellFields({name:'=1+1',status:'Contacted'},['name']).name,"'=1+1");

let checks = 0;
function ok(condition, message) { assert.ok(condition, message); checks++; }
function eq(actual, expected, message) { assert.equal(actual, expected, message); checks++; }
function response() {
  const headers = {};
  return { statusCode: 200, headers,
    setHeader(k,v){ headers[k.toLowerCase()]=v; },
    end(v){ this.payload = JSON.parse(v); return this; } };
}
async function invoke(handler, method, body, headers={}) {
  const res=response();
  await handler({method, body, headers},res);
  return res;
}
process.env.ADMIN_PASSCODE='security-regression-pass';
process.env.LEAD_APPS_SCRIPT_URL='https://example.invalid/script';
process.env.LEAD_SHARED_SECRET='synthetic-secret';
const { guard }=require('../api/_security.js');
function guardResponse(req,key='security-synthetic',limit=2){const res=response();guard(req,res,key,limit);return res;}
eq(guardResponse({headers:{'content-length':'999999'}}).statusCode,413,'oversized declared request rejected');
eq(guardResponse({headers:{},body:'X'.repeat(257*1024)}).statusCode,413,'oversized undeclared request rejected');
eq(guardResponse({headers:{'content-length':'not-a-number'}}).statusCode,413,'malformed length rejected');
eq(guardResponse({headers:{},body:{payload:'X'.repeat(257*1024)}}).statusCode,413,'oversized parsed JSON request rejected');
const voidEnding=response();
voidEnding.end=function(v){this.payload=JSON.parse(v);}; // intentionally returns undefined
ok(guard({headers:{},body:{payload:'X'.repeat(257*1024)}},voidEnding,'void-ending',3)===true,'blocked requests explicitly return true');
eq(voidEnding.statusCode,413,'response ended with too-large status');
const tinyResponse=response();
ok(guard({headers:{},body:{normal:'ok'}},tinyResponse,'small-body',3)===false,'allowed requests explicitly return false');

eq(guardResponse({headers:{'x-real-ip':'192.0.2.4'}},'test-429').statusCode,200,'first request allowed');
eq(guardResponse({headers:{'x-real-ip':'192.0.2.4'}},'test-429').statusCode,200,'second request allowed');
const limited=guardResponse({headers:{'x-real-ip':'192.0.2.4'}},'test-429');
eq(limited.statusCode,429,'third request rate limited');ok(Number(limited.headers['retry-after'])>0,'retry-after set');
const leads=require('../api/invitation-leads.js');
const orders=require('../api/invitation-orders.js');
const reviews=require('../api/reviews.js');
const track=require('../api/track-order.js');
checks+=4;
const upload=require('../api/reference-upload.js');
const makeAuth={ 'x-admin-pass':'security-regression-pass' };
let upstreamCalls=0;
global.fetch=async()=>{upstreamCalls++;return {ok:true,json:async()=>({ok:true,leads:[],orders:[],reviews:[]})};};
for(const handler of [leads,orders]) {
  let res=await invoke(handler,'GET',null);
  eq(res.statusCode,401,'missing admin credentials rejected');
  eq(res.headers['cache-control'],'no-store');
  res=await invoke(handler,'GET',null,{'x-admin-pass':'wrong'});
  eq(res.statusCode,401,'bad admin credentials rejected');
  res=await invoke(handler,'GET',null,makeAuth);
  eq(res.statusCode,200,'valid admin can read');
  eq(res.headers['x-content-type-options'],'nosniff');
  res=await invoke(handler,'DELETE',null,makeAuth);
  eq(res.statusCode,405,'unsupported method rejected');
}
const invalidMutations = [
  {action:'update',id:'../escape',patch:{status:'Contacted'}},
  {action:'update',id:'AB-123',patch:{admin:true}},
  {action:'update',id:'AB-123',patch:{status:'<script>alert(1)</script>'}},
  {action:'update',id:'AB-123',patch:{__proto__:'poison',constructor:'bad'}},
];
for(const x of invalidMutations) {
  eq((await invoke(leads,'POST',x,makeAuth)).statusCode,422,'invalid lead patch rejected');
}
for(const x of [
  {action:'update',id:'../escape',patch:{status:'Delivered'}},
  {action:'update',id:'ORD-123',patch:{admin:true}},
  {action:'update',id:'ORD-123',patch:{notes: 'x'.repeat(5001)}},
]) eq((await invoke(orders,'POST',x,makeAuth)).statusCode,422,'invalid order patch rejected');
eq((await invoke(reviews,'POST',{action:'list'})).statusCode,401,'private reviews denied');
eq((await invoke(reviews,'POST',{action:'moderate',id:'REV-1',moderated:true})).statusCode,401,'moderation denied');
let r=await invoke(track,'GET',{});eq(r.statusCode,405,'order lookup requires POST');
global.fetch=async()=>({ok:true,json:async()=>({ok:true,order:{id:'ORD-TEST',status:'Delivered',delivery:'https://example.com',payment_id:'SECRET-PRIVATE',email:'private@example.invalid',mobile:'9000000000',name:'Private',notes:'private text'}})});
r=await invoke(track,'POST',{order_id:'ORD-TEST',mobile:'9000000000'});
eq(r.statusCode,200);eq(r.payload.order.delivery,'https://example.com');
for(const k of ['payment_id','email','mobile','name','notes']) ok(!(k in r.payload.order),'private order field filtered '+k);
eq((await invoke(upload,'GET',{})).statusCode,405,'upload POST only');
eq((await invoke(upload,'POST',{order_id:'ORD-TEST',upload_token:'bad',mime:'image/png',filename:'x.png',data:'AAAA'})).statusCode,503,'upload gated if disabled');
// DOM script compilation catches syntax errors in inline JS without running it.
for(const p of ['admin/ceo.html','admin/invitation-leads.html','admin/invitation-orders.html','admin/reviews.html','track-order.html','order.html','design-brief.html']) {
  const html=readFileSync(resolve(root,p),'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  for(const source of scripts) if(source.trim()) new Script(source,{filename:p});
  checks++;
}
// Execute the real order-summary renderer with malicious URL-prefill values.
const orderPage=readFileSync(resolve(root,'assets/flow-order-2.js'),'utf8');
const orderEscape=orderPage.match(/^const esc=.*;$/m)?.[0];
const orderSummary=orderPage.match(/function buildSummary\(sel\)\{[\s\S]*?\n\}\nfunction buildPay/)?.[0].replace(/\nfunction buildPay$/, '');
ok(Boolean(orderEscape&&orderSummary), 'order summary renderer and encoding found');
const attack='<img src=x onerror=alert(1)>';
const summarySink={innerHTML:''};
new Script(orderEscape+'\n'+orderSummary+'\nbuildSummary(\"#summary\");').runInNewContext({
  order:{event:attack,type:attack,pkg:attack,name:attack,mobile:attack,event_date:attack,template_name:attack,template_id:attack},
  $:()=>summarySink,
  fmt:()=> '₹100', amount:()=>100,
});
ok(!summarySink.innerHTML.includes(attack) && !/<img\s/i.test(summarySink.innerHTML), 'URL-controlled values encoded before HTML rendering');
ok(summarySink.innerHTML.includes('&lt;img'), 'malicious value displayed as text rather than removed');
ok(!orderPage.includes('String(order.template_name||order.template_id).replace(/[<>]/g'), 'design hint uses full output encoding');
ok(orderPage.includes('if(!EVENTS.includes(order.event))order.event=') && orderPage.includes('if(!TYPES.some(t=>t.k===order.type))order.type='), 'URL prefill must match actual catalogue choices');
const ceo=readFileSync(resolve(root,'assets/admin-ceo.js'),'utf8');
ok(ceo.includes('esc(e[0])') && ceo.includes('esc(k)'), 'executive XSS sink encoded');
const deploymentConfig = JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'));
const globalHeaders = deploymentConfig.headers.find(h => h.source === '/(.*)').headers;
const headerMap = Object.fromEntries(globalHeaders.map(h => [h.key.toLowerCase(), h.value]));
for (const key of ['content-security-policy','strict-transport-security','x-content-type-options','referrer-policy','permissions-policy'])
  ok(typeof headerMap[key] === 'string' && headerMap[key].length > 0, 'security header configured: '+key);
ok(headerMap['content-security-policy'].includes("object-src 'none'"),'CSP objects denied');
ok(headerMap['content-security-policy'].includes('frame-ancestors'),'CSP framing constrained');
const home=readFileSync(resolve(root,'index.html'),'utf8');
ok(/three\.min\.js[^>]+integrity="sha384-[^"]+"/.test(home),'pinned CDN subresource integrity');
const trackingPage=readFileSync(resolve(root,'assets/flow-track-order-1.js'),'utf8');
ok(trackingPage.includes("parsed.protocol==='https:'"),'delivery links scheme checked');
// Real signature validation, using a synthetic signed unhandled event.
const webhook=require('../api/order-webhook.js');
process.env.RAZORPAY_WEBHOOK_SECRET='synthetic-webhook-key';
const raw=Buffer.from(JSON.stringify({event:'security.synthetic',payload:{}}));
const webhookCall=async signature=> {
 const res=response();
 await webhook({method:'POST',headers:{'x-razorpay-signature':signature},rawBody:raw},res);
 return res;
};
eq((await webhookCall('invalid')).statusCode,401,'invalid webhook signature');
const sig=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
r=await webhookCall(sig);eq(r.statusCode,200,'valid signed unknown event acknowledged');ok(r.payload.ignored,'unknown event not processed');
console.log(`Security regression: ${checks} checks passed (synthetic only)`);
