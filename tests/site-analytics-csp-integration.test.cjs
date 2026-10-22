const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('strict CSP runtime never initializes vendor analytics unconditionally',()=>{
 for(const name of ['csp-index-1.js','csp-about-1.js','csp-contact-1.js','csp-courses-1.js','shared-runtime-1.js']){
  assert.doesNotMatch(read('assets/'+name),/\bloadAnalytics\(\);/,'unsafe auto init: '+name);
 }
});
test('all published static demos must use consent-controlled script and no external unconditional GA',()=>{
 const demos=fs.readdirSync(path.join(root,'demo')).filter(f=>f.endsWith('.html'));
 assert.ok(demos.length>=25);
 for(const file of demos){
  const html=read('demo/'+file);
  assert.doesNotMatch(html,/<script[^>]+src="https:\/\/www\.googletagmanager\.com\/gtag\/js/i,file);
  assert.match(html,/src="\/assets\/site-analytics\.js" defer/,file);
 }
});
test('site analytics excludes forms, customer content, private routes and dynamic identities',()=>{
 const source=read('assets/site-analytics.js');
 assert.doesNotMatch(source,/\.textContent\s*\|\|\s*''/);
 assert.match(source,/allbee-analytics-consent-v2/);
 assert.match(source,/globalPrivacyControl/);
 assert.match(source,/checkout/);
});
