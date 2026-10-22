const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
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
test('consent controls are styled with local CSS, never runtime inline CSS text',()=>{
 const source=read('assets/site-analytics.js');
 const css=read('assets/site-analytics.css');
 assert.doesNotMatch(source,/\.style\.cssText\s*=/);
 assert.match(source,/href\s*=\s*['"]\/assets\/site-analytics\.css/);
 assert.match(css,/#allbee-analytics-choice/);
 assert.match(css,/#allbee-analytics-manage/);
});
test('site analytics excludes forms, customer content, private routes and dynamic identities',()=>{
 const source=read('assets/site-analytics.js');
 assert.doesNotMatch(source,/\.textContent\s*\|\|\s*''/);
 assert.match(source,/allbee-analytics-consent-v2/);
 assert.match(source,/globalPrivacyControl/);
 assert.match(source,/var PUBLIC = new Set/);
 assert.match(source,/!PUBLIC.has\(leaf\)/);
});

test('published demo allowlist and fixed public pages stay in sync with current source',()=>{
 const source=read('assets/site-analytics.js');
 const demos=fs.readdirSync(path.join(root,'demo')).filter(f=>f.endsWith('.html'));
 for(const file of demos)assert.ok(source.includes('"'+file.slice(0,-5)+'"'),file+' missing in GA route allowlist');
});

test('all legacy invitation demo scripts create no GA queue before consent',()=>{
  const files=fs.readdirSync(path.join(root,'assets')).filter(f=>/^csp-demo-.*\.js$/.test(f));
  let tested=0;
  for(const filename of files){
    const code=read('assets/'+filename);
    if(!code.includes('data-abx-order'))continue;
    assert.doesNotMatch(code,/\b(?:dataLayer|window\.gtag|gtag\('(?:event|config|js)'|G-TEX4FWGJFQ)\b/,filename);
    const handlers={};
    const elements={
      '[data-abx-order]':[{href:'',addEventListener:(name,fn)=>{handlers.order=fn;}}],
      '[data-abx-enq]':[{href:'',addEventListener:(name,fn)=>{handlers.enquiry=fn;}}],
      '[data-abx-wa]':[{href:'',addEventListener:(name,fn)=>{handlers.whatsapp=fn;}}],
    };
    const window={};
    const document={querySelectorAll:sel=>elements[sel]||[],querySelector:()=>null};
    vm.runInNewContext(code,{window,document,location:{search:''},URLSearchParams,encodeURIComponent},{timeout:1000,filename});
    assert.equal(window.dataLayer,undefined,filename+' pre-consent GA queue');
    assert.equal(window.gtag,undefined,filename+' pre-consent tracking shim');
    const events=[];
    window.AllBeeAnalytics={track:(name)=>events.push(name)};
    for(const name of ['order','enquiry','whatsapp'])assert.equal(typeof handlers[name],'function',filename+' missing click handler '+name);
    handlers.order();handlers.enquiry();handlers.whatsapp();
    assert.deepEqual(events,['order_start_click','cta_click','whatsapp_click'],filename+' must emit only whitelisted consent-aware events');
    tested++;
  }
  assert.equal(tested,25,'Expected all 25 published legacy demo CTA controllers');
});
