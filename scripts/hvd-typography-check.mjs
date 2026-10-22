#!/usr/bin/env node
// HajiHaz Visual DNA typography audit: public site only, no admin/template changes.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const pages=readdirSync(root).filter(name=>name.endsWith('.html')&&!name.startsWith('google21'));
const admins=readdirSync(resolve(root,'admin')).filter(name=>name.endsWith('.html'));
const demos=readdirSync(resolve(root,'demo')).filter(name=>name.endsWith('.html'));
const fontSheet='/assets/hvd-typography.css';
const typo=read(fontSheet.slice(1));
assert.ok(typo.includes("'Bricolage Grotesque'"),'Expressive HVD display family');
assert.ok(typo.includes("'Instrument Sans'"),'Accessible HVD body/UI family');
assert.match(typo,/--font-display\s*:/);
assert.match(typo,/--font-body\s*:/);
assert.ok(!/(?:background|color\s*:|grid-template|position:|transform:|@keyframes|animation\s*:)/.test(typo),
  'HVD typography override must not change colors, layout or motion');
let sources=0;
for(const page of pages){
 const html=read(page);
 assert.equal((html.match(/href="\/assets\/hvd-typography\.css"/g)||[]).length,1,
   page+' includes one HVD override stylesheet');
 const links=[...html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/g)].map(m=>m[0]);
 assert.ok(links.length>0,page+' must request legal open-source Google fonts');
 for(const url of links){
   assert.ok(url.includes('family=Bricolage+Grotesque:')&&url.includes('family=Instrument+Sans:'),
     page+' font URL must request both branded families');
   assert.ok(url.includes('display=swap'),page+' fonts should not block visible text');
   assert.ok(!url.includes('Playfair+Display')&&!url.includes('Lato'),page+' old fonts removed');
   sources++;
 }
 assert.ok(html.lastIndexOf('href="'+fontSheet+'"')<html.indexOf('</head>'),
   page+' override must load within head');
}
for(const page of admins){
 const html=read('admin/'+page);
 assert.ok(!html.includes(fontSheet),'Never alter owner/admin dashboard typography: '+page);
 assert.ok(!html.includes('family=Bricolage+Grotesque:'),'Admin keeps its own fonts: '+page);
}
for(const page of demos){
 const html=read('demo/'+page);
 assert.ok(!html.includes(fontSheet),'Invitation demo typography remains bespoke: '+page);
 assert.ok(!html.includes('family=Bricolage+Grotesque:'),'Invitation demo font loading unchanged: '+page);
}
// Shared stylesheet tokens and page-specific CSS must agree, without leaving
// the old serif/sans pairing on the branded public site.
const publicCss=new Set();
for(const page of pages){
 const html=read(page);
 for(const match of html.matchAll(/<link[^>]+href="(\/assets\/[^"']+\.css(?:\?[^"']*)?)"/g)){
   const file=match[1].split('?')[0].slice(1);
   if(file===fontSheet.slice(1))continue;
   assert.ok(existsSync(resolve(root,file)),page+' missing stylesheet '+file);
   publicCss.add(file);
 }
}
for(const file of publicCss){
 const css=read(file);
 assert.ok(!css.includes('Playfair Display')&&!/\bLato\b/.test(css),
   'Branded public CSS must not revert to the previous font pairing: '+file);
}
assert.equal(pages.length,24,'24 customer-facing HTML pages expected');
assert.equal(admins.length,5,'All five admin pages deliberately excluded');
assert.equal(demos.length,39,'All 39 standalone invitation demos deliberately excluded');
console.log(`HVD typography: ${pages.length} public pages, ${sources} Google Fonts links, ${publicCss.size} CSS files; ${admins.length} admin + ${demos.length} demo pages untouched PASS`);
