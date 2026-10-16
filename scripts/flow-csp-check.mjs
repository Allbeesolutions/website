#!/usr/bin/env node
// Checks high-risk customer flows work with CSP blocking inline JavaScript.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {Script} from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const cfg=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'));
let files=0;
for(const page of ['order','design-brief','track-order','review']) {
 const html=readFileSync(resolve(root,page+'.html'),'utf8');
 const routes=['/'+page,'/'+page+'.html'];
 for(const route of routes){
   const h=cfg.headers.find(x=>x.source===route)?.headers.find(x=>x.key==='Content-Security-Policy')?.value;
   assert.ok(h,'CSP route '+route);
   const script=h.split('script-src ')[1].split(';')[0];
   assert.ok(!script.includes("'unsafe-inline'"),'Inline scripts blocked at '+route);
   assert.ok(h.includes("script-src-attr 'none'"),'Inline events blocked at '+route);
   if(page==='order')assert.ok(script.includes('https://checkout.razorpay.com'),'Payment checkout allowed');
 }
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 for(const m of scripts){
   if(m[1].includes('application/ld+json'))continue;
   assert.equal(m[2].trim(),'','No inline JS on '+page);
   const src=m[1].match(/\bsrc="([^"]+)"/i)?.[1];
   assert.ok(src,'All flow scripts have src');
   if(src.startsWith('/')){
     const local=src.split('?')[0].slice(1);
     assert.ok(existsSync(resolve(root,local)),src);
     new Script(readFileSync(resolve(root,local),'utf8'),{filename:local});
   }
   files++;
 }
 assert.ok(!/\son[a-z]+\s*=/.test(html),'No inline event attributes on '+page);
}
console.log(`Customer flow CSP: four critical pages, ${files} scripts, no inline execution`);
