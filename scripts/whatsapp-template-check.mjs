#!/usr/bin/env node
// Synthetic customer communications check: open links only, never send messages.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('../assets/admin-invitation-orders.js',import.meta.url),'utf8');
const block=code.match(/function waNotify\(o,stage\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(block,'WhatsApp template function must exist');
const context={encodeURIComponent};vm.createContext(context);vm.runInContext(block,context,{timeout:1000});
const order={id:'ORD-SYNTHETIC1234',name:'Demo Recipient',mobile:'+91 90000 00000',template_name:'Noor Nikah',event_type:'Nikah'};
const stages=['received','brief','design','review','delivered','followup'];
for(const stage of stages){
 const url=new URL(context.waNotify(order,stage));
 assert.equal(url.origin,'https://wa.me','WhatsApp link must point to real messaging host');
 assert.equal(url.pathname,'/919000000000','Phone is normalized to digits');
 const text=url.searchParams.get('text');
 assert.ok(text?.includes(order.id),'Every message must include order reference: '+stage);
 assert.ok(text.includes('AllBee Invitations'),'Every message must identify sender');
 if(stage==='brief')assert.ok(text.includes('https://www.allbeesolutions.com/design-brief?order=ORD-SYNTHETIC1234'));
 if(stage==='delivered')assert.ok(text.includes('https://www.allbeesolutions.com/track-order'));
 if(stage==='design')assert.ok(text.includes('Noor Nikah'));
}
console.log('Six WhatsApp order lifecycle templates validated offline; no messages sent');
