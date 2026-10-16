#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const handler=require('../api/order-webhook.js');
process.env.RAZORPAY_WEBHOOK_SECRET='test-webhook-signature-secret';
process.env.RAZORPAY_KEY_ID='rzp_test_synthetic';
process.env.RAZORPAY_KEY_SECRET='synthetic-key';
process.env.LEAD_APPS_SCRIPT_URL='https://example.invalid/script';
process.env.LEAD_SHARED_SECRET='synthetic-shared';
const originalFetch=global.fetch;
let writes=0, lookups=0, badAmount=false;
global.fetch=async(url,options)=>{
  if(String(url).startsWith('https://api.razorpay.com/v1/orders/')){
    lookups++;
    assert.ok(String(options.headers.Authorization).startsWith('Basic '));
    return {ok:true,json:async()=>({id:'order_synthetic',currency:'INR',amount:29900+(badAmount?1:0),receipt:'ORD-TEST1234',notes:{name:'Test',mobile:'9000000000',event:'Wedding',type:'PDF Invitation',pkg:'Basic'}})};
  }
  if(String(url)==='https://example.invalid/script'){
    writes++;
    const p=JSON.parse(options.body);
    assert.equal(p.action,'order_create');
    assert.equal(p.secret,'synthetic-shared');
    assert.equal(p.payment_id,'pay_synthetic');
    return {ok:true,json:async()=>({ok:true,id:'ORD-TEST1234'})};
  }
  throw new Error('unexpected network target');
};
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},end(s){this.body=JSON.parse(s);}};}
async function call(event,valid=true){
  const raw=Buffer.from(JSON.stringify(event));
  const signature=valid?crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex'):'invalid';
  const res=response();await handler({method:'POST',headers:{'x-razorpay-signature':signature},rawBody:raw},res);return res;
}
const event={event:'payment.captured',payload:{payment:{entity:{id:'pay_synthetic',order_id:'order_synthetic',amount:29900,currency:'INR'}}}};
assert.equal((await call(event,false)).statusCode,401);
assert.equal(writes,0);
assert.equal((await call(event)).statusCode,200);
assert.equal(lookups,1);
assert.equal(writes,1);
assert.equal((await call(event)).statusCode,200); // Persistence must dedup repeated deliveries.
assert.equal(writes,2);
badAmount=true;
assert.equal((await call(event)).statusCode,503);
assert.equal(writes,2);
global.fetch=originalFetch;
// Simulate the checked-in Apps Script's payment-ID dedup and refund-note replay behavior.
const rows=[['Order ID'], Array(20).fill('')];
rows[1][0]='ORD-TEST1234';rows[1][9]='pay_synthetic';rows[1][10]='Refunded';rows[1][16]='[2026-10-16] refund.created — ₹299 (refund rf_synthetic)';
let cellWrites=0;
const sheet={getLastRow:()=>rows.length,getDataRange:()=>({getValues:()=>rows}),getRange(r,c){return {setValue(v){cellWrites++;rows[r-1][c-1]=v;}};},appendRow(r){rows.push(r);}};
const context={SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet})},Date,Number,String,Object,Array};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../docs/lead-apps-script.gs',import.meta.url),'utf8'),context);
assert.equal(context.orderCreate_({payment_id:'pay_synthetic'}).duplicate,true);
assert.equal(rows.length,2,'duplicate event did not append an order');
assert.equal(context.orderMark_('pay_synthetic','Refunded','refund.created — ₹299 (refund rf_synthetic)').duplicate,true);
assert.equal(cellWrites,0,'duplicate refund did not rewrite cells');
assert.equal(context.orderMark_('pay_synthetic','Refunded','refund.processed — ₹299 (refund rf_synthetic)').ok,true);
assert.equal(cellWrites,3,'new refund stage persisted');
assert.equal(context.orderMark_('pay_synthetic','Refunded','refund.processed — ₹299 (refund rf_synthetic)').duplicate,true);
assert.equal(cellWrites,3,'repeat refund stage did not duplicate notes');
console.log('Webhook security: synthetic signatures, amount binding, payment and refund dedup passed');
