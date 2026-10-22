#!/usr/bin/env node
// Lightweight public-site SEO, accessibility and HTML weight regression.
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const pages=['index','about','contact','services','courses','webdevelopment',
  'digitalmarketing','invitation','invitation-samples','portfolio','order','track-order','review'];
let images=0,checks=0;
for(const page of pages){
 const filename=resolve(root,page+'.html');
 const html=readFileSync(filename,'utf8');
 assert.match(html,/<title>[^<]+<\/title>/i,page+' title');
 assert.match(html,/<meta\s+name="viewport"[^>]+>/i,page+' responsive viewport');
 assert.match(html,/<meta\s+name="description"[^>]+>/i,page+' description');
 assert.match(html,/<link\s+rel="canonical"\s+href="https:\/\/www\.allbeesolutions\.com\//i,page+' canonical');
 assert.equal([...html.matchAll(/<h1\b/gi)].length,1,page+' exactly one H1');
 assert.equal([...html.matchAll(/<main\b/gi)].length,1,page+' exactly one main landmark');
 assert.equal([...html.matchAll(/<\/main>/gi)].length,1,page+' closing main landmark');
 for(const m of html.matchAll(/<img\b[^>]*>/gi)){
   assert.match(m[0],/\balt\s*=\s*["'][^"']*["']/i,page+' image alt required');
   images++;
 }
 assert.ok(statSync(filename).size<=100*1024,page+' HTML budget 100 KiB');
 checks+=8;
}
const pwa=JSON.parse(readFileSync(resolve(root,'site.webmanifest'),'utf8'));
assert.equal(pwa.display,'standalone','Installed mobile website must open without browser chrome');
assert.ok(pwa.icons.some(x=>x.sizes==='192x192'));
assert.ok(pwa.icons.some(x=>x.sizes==='512x512'));
for(const icon of pwa.icons){
 assert.ok(existsSync(resolve(root,icon.src.split('?')[0].slice(1))),'PWA icon missing '+icon.src);
}
assert.match(readFileSync(resolve(root,'track-order.html'),'utf8'),/id="err"[^>]+role="alert"/);
assert.match(readFileSync(resolve(root,'review.html'),'utf8'),/id="err"[^>]+role="alert"/);
console.log(`Site quality: ${pages.length} main routes, ${images} accessible image tags, canonical/SEO/main/PWA checks PASS`);
