#!/usr/bin/env node
// Regression contract for static and runtime inline styles.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const pages=[...readdirSync(root).filter(x=>x.endsWith('.html')),...readdirSync(resolve(root,'admin')).filter(x=>x.endsWith('.html')).map(x=>'admin/'+x),...readdirSync(resolve(root,'demo')).filter(x=>x.endsWith('.html')).map(x=>'demo/'+x)];
const css=read('assets/csp-inline-attrs.css');
const keys=new Set([...css.matchAll(/\[data-ab-style="(s\d{4})"\]/g)].map(x=>x[1]));
assert.equal(keys.size,204,'The 204 original static styles must have equivalent rules');
let count=0,pagesWithStyles=0;
for(const path of pages){
 const html=read(path);
 assert.ok(!/\sstyle\s*=\s*['"]/i.test(html),`Static inline attribute forbidden: ${path}`);
 const attrs=[...html.matchAll(/\bdata-ab-style="(s\d{4})"/g)];
 if(attrs.length){
   assert.ok(html.includes('href="/assets/csp-inline-attrs.css"'),`Missing runtime-attribute CSS on ${path}`);
   pagesWithStyles++;
 }
 for(const a of attrs){assert.ok(keys.has(a[1]),`Missing CSS rule ${a[1]} on ${path}`);count++;}
}
assert.equal(count,457,'Every original static inline style must be preserved as CSS');
assert.equal(pagesWithStyles,62,'All 62 formerly styled pages must keep CSS coverage');
const runtimeFiles=readdirSync(resolve(root,'assets')).filter(x=>x.endsWith('.js'));
for(const file of runtimeFiles){
 const code=read('assets/'+file);
 assert.ok(!/\sstyle\s*=\s*['"]/i.test(code),`Runtime HTML literal style attribute: ${file}`);
 assert.ok(!/\.style\.cssText\s*=/.test(code),`CSS text injection: ${file}`);
 assert.ok(!/\.setAttribute\(\s*['"]style['"]/.test(code),`Runtime style attribute: ${file}`);
}
for(let i=0;i<=100;i++){
 assert.ok(css.includes(`[data-ab-pct="${i}"] { width:${i}%; }`),`Missing bounded percentage ${i}`);
}
const config=JSON.parse(read('vercel.json'));
for(const group of config.headers){
 const policy=group.headers.find(h=>h.key==='Content-Security-Policy')?.value;
 if(!policy)continue;
 const style=policy.match(/(?:^|;)\s*style-src\s+([^;]+)/)?.[1]||'';
 const attr=policy.match(/(?:^|;)\s*style-src-attr\s+([^;]+)/)?.[1]||'';
 assert.ok(!style.includes("'unsafe-inline'"),`Broad CSP style exemption: ${group.source}`);
 if(['/order','/order.html'].includes(group.source)) {
   assert.ok(attr.includes("'unsafe-inline'"),`Checkout must retain its documented vendor compatibility exception: ${group.source}`);
 } else {
   assert.ok(attr.includes("'none'"),`Inline style attributes must be rejected: ${group.source}`);
 }
}
console.log(`Inline-style CSP: ${count} attributes converted on ${pagesWithStyles} pages, ${keys.size} CSS rules, ${runtimeFiles.length} JS files checked, strict policy PASS`);
