#!/usr/bin/env node
// Enforced script CSP across public site and invitation demos.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {Script} from 'node:vm';
const root=resolve(import.meta.dirname,'..');
const config=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'));
const rules=config.headers||[];
const findCsp=route=>{
  const specific=rules.find(x=>x.source===route)?.headers.find(x=>x.key==='Content-Security-Policy')?.value;
  return specific||rules.find(x=>x.source==='/(.*)')?.headers.find(x=>x.key==='Content-Security-Policy')?.value;
};
const pages=[...readdirSync(root).filter(f=>f.endsWith('.html')),...readdirSync(resolve(root,'demo')).filter(f=>f.endsWith('.html')).map(f=>'demo/'+f),...readdirSync(resolve(root,'admin')).filter(f=>f.endsWith('.html')).map(f=>'admin/'+f)];
let scripts=0,external=0,checked=0,styles=0,stylePages=0;
for(const page of pages){
  const html=readFileSync(resolve(root,page),'utf8');
  const route='/'+page.replace(/\.html$/,'');
  const policies=[findCsp(route),findCsp('/'+page)];
  for(const csp of policies){
    assert.ok(csp,`Missing CSP on ${route}`);
    const scriptDirective=csp.match(/(?:^|;)\s*script-src\s+([^;]+)/)?.[1];
    assert.ok(scriptDirective&&scriptDirective.includes("'self'"),`Scripts must be same-origin allowed: ${route}`);
    assert.ok(!scriptDirective.includes("'unsafe-inline'"),`Inline JS must be blocked: ${route}`);
    assert.ok(csp.includes("script-src-attr 'none'"),`Inline event handlers must be blocked: ${route}`);
    assert.ok(csp.includes("object-src 'none'"),`Object code disabled: ${route}`);
    const cssElem=csp.match(/(?:^|;)\s*style-src-elem\s+([^;]+)/)?.[1]||'';
    assert.ok(cssElem.includes("'self'")&&!cssElem.includes("'unsafe-inline'"),`Style elements require external stylesheets: ${route}`);
    if (['/order','/order.html'].includes(route) || ['/order','/order.html'].includes('/'+page)) {
      assert.ok(csp.includes("style-src-attr 'unsafe-inline'"),`Checkout third-party compatibility exception: ${route}`);
    } else {
      assert.ok(csp.includes("style-src-attr 'none'"),`Inline style attributes are blocked: ${route}`);
    }
  }
  assert.ok(!/\s(onclick|onload|onerror|onsubmit|onblur|onfocus|onmouseenter|onmouseleave|onmouseover|onmouseout|onchange|oninput|onkeydown|onkeyup)\s*=/.test(html),`Unexpected inline event handler: ${page}`);
  assert.ok(!/<style(?:\s[^>]*)?>/i.test(html),`Inline style block must be external: ${page}`);
  const links=[...html.matchAll(/<link\b[^>]*\bhref="(\/assets\/csp-style-[^"]+\.css)"[^>]*>/gi)];
  for(const link of links){
    const filename=resolve(root,link[1].slice(1));
    assert.ok(filename.startsWith(root+'/')&&existsSync(filename),`Missing CSS: ${link[1]} in ${page}`);
    assert.ok(readFileSync(filename,'utf8').trim().length>0,`Empty external CSS: ${link[1]}`);
    styles++;
  }
  if(links.length)stylePages++;

  for(const tag of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const attrs=tag[1],body=tag[2];
    if(/\btype="application\/ld\+json"/i.test(attrs)){
      JSON.parse(body);continue;
    }
    assert.equal(body.trim(),'','Inline executable JS: '+page);
    const src=attrs.match(/\bsrc=['"]([^'"]+)['"]/i)?.[1];
    assert.ok(src,'Script tag needs src: '+page);
    if(src.startsWith('/')){
      const path=resolve(root,src.slice(1).split('?')[0]);
      assert.ok(path.startsWith(root+'/')&&existsSync(path),`Missing local JS: ${src} in ${page}`);
      new Script(readFileSync(path,'utf8'),{filename:path});
      external++;
    }
    scripts++;
  }
  checked++;
}
assert.ok(checked>=69,'Expected all static pages including demo routes');
assert.ok(styles===111,'111 inline stylesheet blocks should be extracted without omission');
assert.ok(stylePages===59,'59 pages with inline style blocks should have extracted CSS');
assert.ok(new Set([...pages.flatMap(page=>[...readFileSync(resolve(root,page),'utf8').matchAll(/href="(\/assets\/csp-style-[^"]+\.css)"/g)].map(m=>m[1]))]).size===63,'Deduplicated stylesheets should be shared across pages');
assert.ok(external>=80,'Expected full script migration and external assets');
const interactions=readFileSync(resolve(root,'assets/csp-interactions.js'),'utf8');
for(const action of ['open-modal','close-modal','show-ok','preview-message'])assert.ok(interactions.includes(action));
console.log(`Public CSP regression: ${checked} pages, ${scripts} script tags, ${external} local script references, ${styles} stylesheet links to 63 distinct CSS assets PASS`);
