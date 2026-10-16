#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {Script} from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const config=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'));
const header=config.headers.find(x=>x.source==='/admin/(.*)')?.headers.find(h=>h.key==='Content-Security-Policy')?.value;
assert.ok(header,'dedicated admin CSP configured');
assert.match(header,/script-src 'self'; script-src-attr 'none';/);
assert.ok(!header.split('style-src')[0].includes('unsafe-inline'),'admin script CSP does not allow inline code');
assert.ok(header.includes("frame-ancestors 'none'"));
const pages=['ceo','invitation-leads','invitation-orders','reviews','launch'];
let scripts=0;
for(const name of pages){
 const html=readFileSync(resolve(root,`admin/${name}.html`),'utf8');
 const entries=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 assert.ok(entries.length>0,name+' script tags');
 for(const m of entries){
   assert.equal(m[2].trim(),'','inline JS prohibited by admin CSP: '+name);
   const src=m[1].match(/\bsrc="([^"]+)"/i)?.[1];
   assert.ok(src&&src.startsWith('/assets/admin-'),name+' self hosted JS');
   assert.ok(existsSync(resolve(root,src.slice(1))),src);
   new Script(readFileSync(resolve(root,src.slice(1)),'utf8'),{filename:src});
   scripts++;
 }
 assert.ok(!/\son[a-z]+\s*=/i.test(html),'inline event handler prohibited: '+name);
}
console.log(`Admin CSP: five pages, ${scripts} external scripts, no inline execution`);
