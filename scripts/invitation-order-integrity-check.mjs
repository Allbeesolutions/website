#!/usr/bin/env node
// Synthetic order API contract checks. No actual payments or customer writes.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const orderCreate=require('../api/order-create.js');
const catalog=require('../lib/catalog.js');
const base={event:'Wedding',type:'PDF Invitation',pkg:'Premium',name:'Synthetic Test',mobile:'9000000000',template_id:'AB-WED-002',template_name:'Untrusted name',demo:'untrusted'};
const saved=new Map(['RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','RAZORPAY_WEBHOOK_SECRET','LEAD_APPS_SCRIPT_URL','LEAD_SHARED_SECRET'].map(k=>[k,process.env[k]]));
const prevFetch=global.fetch;
let calls=0,networkOrder;
for(const key of saved.keys())delete process.env[key];
const invoke=async(body,withGateway=false)=>{
  if(withGateway){
    process.env.RAZORPAY_KEY_ID='rzp_test_synthetic';
    process.env.RAZORPAY_KEY_SECRET='synthetic-secret';
    process.env.RAZORPAY_WEBHOOK_SECRET='synthetic-signature-secret';
    process.env.LEAD_APPS_SCRIPT_URL='https://example.invalid/script';
    process.env.LEAD_SHARED_SECRET='synthetic-sheet-secret';
  }else for(const key of saved.keys())delete process.env[key];
  global.fetch=async(url,opts)=>{
    assert.equal(url,'https://api.razorpay.com/v1/orders');
    calls++;
    networkOrder=JSON.parse(opts.body);
    return {ok:true,json:async()=>({id:'order_synthetic'})};
  };
  const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},end(v){this.payload=JSON.parse(v);}};
  await orderCreate({method:'POST',headers:{'x-real-ip':'192.0.2.'+(10+calls)},body},res);
  return res;
};
try{
  assert.equal(catalog.invitationTemplateById('AB-WED-002')?.name,'Floral Symphony');
  assert.equal(catalog.invitationTemplateById('AB-INVALID'),null);
  assert.equal((await invoke(base)).statusCode,200,'Supported paid-design/package combination');
  assert.equal((await invoke({...base,pkg:'Basic'})).statusCode,422,'Template rejects unsupported Basic package');
  assert.equal((await invoke({...base,event:'Nikah'})).statusCode,422,'Template rejects wrong event');
  assert.equal((await invoke({...base,template_id:'FAKE-ID'})).statusCode,422,'Unknown design rejects');
  assert.equal((await invoke({...base,template_id:'',pkg:'Basic'})).statusCode,200,'Generic order with any published package remains possible');
  assert.equal((await invoke({...base,type:'Mismatched type'})).statusCode,422,'Invalid type rejected');
  const r=await invoke({...base,pkg:'Premium',template_name:'<img src=x onerror=alert(1)>',demo:'fake',source:'template:AB-WED-002'},true);
  assert.equal(r.statusCode,200,'Valid order accepted for synthetic gateway');
  assert.equal(r.payload.configured,true);
  assert.equal(networkOrder.notes.template_id,'AB-WED-002');
  assert.equal(networkOrder.notes.template_name,'Floral Symphony','Catalog name replaces untrusted label');
  assert.equal(networkOrder.notes.demo,'hindu-wedding','Catalog demo replaces untrusted slug');
  assert.equal(networkOrder.notes.event,'Wedding');
  assert.equal(networkOrder.notes.pkg,'Premium');
  assert.equal(networkOrder.amount,59900,'Authoritative server price in paise');
  assert.equal(calls,1,'Only valid gateway-configured order contacted provider');
  console.log('Invitation order integrity: catalogue event, design, packages, canonical metadata and gateway amount PASS');
}finally{
 for(const [k,v] of saved){if(v===undefined)delete process.env[k];else process.env[k]=v;}
 global.fetch=prevFetch;
}
