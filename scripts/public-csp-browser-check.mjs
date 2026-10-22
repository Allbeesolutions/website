#!/usr/bin/env node
// Local strict-CSP browser smoke; uses Chrome only when installed, never production.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const chrome=[process.env.CHROME,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(x=>x&&fs.existsSync(x));
if(!chrome){if(process.env.CSP_BROWSER_REQUIRED==='1')throw new Error('Required Chrome binary is unavailable');console.log('Chrome missing: browser smoke skipped');process.exit(0);}
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const csp=config.headers.find(x=>x.source==='/(.*)').headers.find(h=>h.key==='Content-Security-Policy').value;
const viewport=process.env.CSP_BROWSER_VIEWPORT||'desktop';
const dimensions={mobile:'390,844',tablet:'820,1180',desktop:'1440,900'};
if(!Object.hasOwn(dimensions,viewport))throw new Error('Unknown viewport: '+viewport);
const harness=`(function(){
 var errors=[];
 window.addEventListener('error',function(e){ if(e.message && !String(e.message).includes('ResizeObserver') && !String(e.message).includes('Error creating WebGL context')) errors.push(String(e.message).slice(0,100));});
 window.addEventListener('securitypolicyviolation',function(e){ if(String(e.effectiveDirective).startsWith('script-src')) errors.push('CSP script violation: '+String(e.blockedURI).slice(0,100)); });
 window.addEventListener('securitypolicyviolation',function(e){if(e.violatedDirective && e.violatedDirective.startsWith('script-src') && e.blockedURI==='inline')errors.push('Blocked inline script');});
 window.addEventListener('securitypolicyviolation',function(e){if(e.violatedDirective && e.violatedDirective.startsWith('style-src-elem') && e.blockedURI==='inline')errors.push('Blocked inline stylesheet');});
 window.addEventListener('securitypolicyviolation',function(e){if(String(e.effectiveDirective||'').startsWith('style-src-attr'))errors.push('Blocked style attribute: '+String(e.blockedURI));});
 function verify(){
   var p=location.pathname,behavior='loaded',pass=true;
   try {
     // HVD public brand typography must be present and applied, while admin
     // and individual invitation templates must retain their own identities.
     if(!p.startsWith('/admin/') && !p.startsWith('/demo/')){
       if(!document.querySelector('link[href="/assets/hvd-typography.css"]'))
         throw Error('HVD public typography stylesheet missing');
       if(!getComputedStyle(document.body).fontFamily.includes('Instrument Sans'))
         throw Error('HVD body font not applied');
       var heading=document.querySelector('h1');
       if(heading&&!getComputedStyle(heading).fontFamily.includes('Bricolage Grotesque'))
         throw Error('HVD display typography missing');
     }else{
       if(document.querySelector('link[href="/assets/hvd-typography.css"]'))
         throw Error('Admin or invitation design unexpectedly uses HVD override');
     }
     var linked=[].slice.call(document.querySelectorAll('link[href^="/assets/csp-style-"]'));
     for(var i=0;i<linked.length;i++){
       var sheet=linked[i].sheet;
       if(!sheet||!sheet.cssRules||sheet.cssRules.length===0)throw Error('CSS not applied: '+linked[i].getAttribute('href'));
     }
     if(p==='/'){
       var a=document.querySelector('[data-csp-click="open-modal"]'),b=document.querySelector('[data-csp-click="close-modal"]');
       if(!a||!b)throw Error('Modal controls missing');
       a.click();if(!document.getElementById('enrollModal').classList.contains('open'))throw Error('Modal failed to open');
       b.click();if(document.getElementById('enrollModal').classList.contains('open'))throw Error('Modal failed to close');
       var consent=document.getElementById('allbee-analytics-choice');
       var manage=document.getElementById('allbee-analytics-manage');
       var sheet=document.querySelector('link[data-allbee-analytics-css]');
       if(!consent||!manage||!sheet)throw Error('Consent controls or external CSS missing');
       if(!sheet.sheet || !sheet.sheet.cssRules.length)throw Error('Consent CSS failed to load');
       if(getComputedStyle(consent).position!=='fixed')throw Error('Consent banner CSS not applied');
       if(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'))
         throw Error('Analytics started before consent');
       var no=[].slice.call(consent.querySelectorAll('button')).find(function(x){return x.textContent==='No thanks';});
       if(!no)throw Error('Consent opt-out button missing');
       no.click();
       if(localStorage.getItem('allbee-analytics-consent-v2')!=='no')throw Error('Opt-out not stored');
       if(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'))
         throw Error('Analytics started after opt-out');
       if(innerWidth<=768){
         var gallery=document.querySelector('.zp-sticky');
         var hint=document.querySelector('.zp-swipe-hint');
         if(!gallery||!hint||!gallery.hasAttribute('tabindex'))throw Error('Accessible mobile gallery missing');
         if(gallery.scrollWidth<=gallery.clientWidth+30)throw Error('Mobile photo gallery cannot swipe');
         if(getComputedStyle(gallery).overflowX!=='auto')throw Error('Gallery must own horizontal scroll');
         if(getComputedStyle(hint).display==='none')throw Error('Mobile gallery guidance hidden');
         gallery.scrollTo({left:gallery.clientWidth*1.2,behavior:'instant'});
         if(gallery.scrollLeft<10)throw Error('Photo gallery scroll not working');
       }
       behavior='modal and consent opt-out works';
     }else if(p==='/admin/ceo.html'){
       document.getElementById('demoLink').click();
       if(!document.querySelector('#kpis .kpi'))throw Error('Executive demo dashboard missing');
       var bar=document.querySelector('#catRev [data-ab-pct]');
       if(!bar||!getComputedStyle(bar).width)throw Error('Executive chart widths missing');
       behavior='executive dashboard and charts';
     }else if(p==='/admin/invitation-leads.html'){
       document.getElementById('demoLink').click();
       if(!document.querySelector('#list .lead'))throw Error('Lead records missing');
       if(!document.querySelector('#pipe .dot'))throw Error('Lead stage colors missing');
       behavior='lead pipeline demo';
     }else if(p==='/admin/invitation-orders.html'){
       document.getElementById('demoLink').click();
       if(!document.querySelector('#list .ord'))throw Error('Order records missing');
       document.getElementById('reportsBtn').click();
       if(!document.querySelector('#reports [data-ab-pct]'))throw Error('Order report chart missing');
       behavior='orders pipeline and report charts';
     }else if(p==='/order.html'){
       if(typeof window.buildSummary!=='function')throw Error('Checkout summary unavailable');
       window.buildSummary('#summary');
       if(!document.querySelector('#summary .ab-summary-features'))throw Error('Checkout summary styles missing');
       behavior='checkout summary';
     }else if(p==='/about.html'){
       var el=document.querySelector('[data-csp-enter="m0"]');
       if(!el)throw Error('Team item missing');
       el.dispatchEvent(new MouseEvent('mouseenter'));
       if(!el.classList.contains('is-active'))throw Error('Team hover failed');
       el.dispatchEvent(new MouseEvent('mouseleave'));
       if(el.classList.contains('is-active'))throw Error('Team unhover failed');
       behavior='team hover works';
     }else if(p.endsWith('/blessed-abode.html')){
       var f=document.querySelector('form[data-csp-demo-submit="show-ok"]');
       f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
       if(document.getElementById('ok').hidden)throw Error('RSVP preview submit failed');
       behavior='demo RSVP works';
     }else if(p.endsWith('/botanical-letterpress.html')){
       var f=document.querySelector('form[data-csp-demo-submit="preview-message"]');
       f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
       if(!f.querySelector('button').textContent.includes('Preview only'))throw Error('Demo form failed');
       behavior='demo form works';
     }else{
       if(!document.body)throw Error('Missing document body');
     }
   }catch(e){pass=false;errors.push(e.message);}
   var overflow=Math.max(0,document.documentElement.scrollWidth-innerWidth);
   // A nested, swipeable photo gallery can have large scrollWidth by design.
   // Detect the actual regression: can the *page itself* scroll sideways?
   if(p==='/' && innerWidth<=820){
     try{window.scrollTo({left:300,top:0,behavior:'instant'});}catch(_){window.scrollTo(300,0);}
     var pageSideScroll=Math.abs(window.scrollX)>2;
     if(pageSideScroll){pass=false;errors.push('Document horizontally scrollable by '+window.scrollX+'px');}
     window.scrollTo({left:0,top:0,behavior:'instant'});
   }
   if(overflow>5 && p==='/'){
     var offenders=[].slice.call(document.body.querySelectorAll('*')).map(function(el){return {el:el,box:el.getBoundingClientRect()};}).filter(function(x){return x.box.right>innerWidth+8 && x.box.width>0 && x.box.height>0;}).sort(function(a,b){return b.box.right-a.box.right;}).slice(0,3).map(function(x){return x.el.tagName.toLowerCase()+'#'+x.el.id+'.'+String(x.el.className||'').slice(0,35)+'@'+Math.round(x.box.right);});
     behavior+=':offenders='+offenders.join(',');
   }
   document.documentElement.dataset.cspSmoke=(pass&&!errors.length)?'PASS':'FAIL';
   document.documentElement.dataset.cspSmokeDetail=(behavior+':'+errors.join('|')+':viewport='+innerWidth+':overflow='+overflow).slice(0,460);
 }
 document.addEventListener('DOMContentLoaded',function(){setTimeout(verify,350);});
})();`;
const mime={'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.html':'text/html'};
const server=http.createServer((req,res)=>{
 const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(route.startsWith('/api/')){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,rows:[],reviews:[]}));return;}
 if(route==='/__csp_smoke.js'){
  res.writeHead(200,{'Content-Type':'application/javascript'});res.end(harness);return;
 }
 let dest=path.resolve(root,'.'+(route==='/'?'/index.html':route));
 if(!fs.existsSync(dest) && !path.extname(dest) && fs.existsSync(dest+'.html'))dest+='.html';
 if(!dest.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{
  if(path.extname(dest)==='.html'){
    let html=fs.readFileSync(dest,'utf8');
    // This harness validates our local CSS declarations, not remote vendors.
    // Strip remote font CSS and third-party scripts from the test response so
    // GitHub's headless Chrome cannot stall on blocked external DNS requests.
    // Production and Google Fonts availability are verified separately.
    html=html.replace(/<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com\/css2\?[^"']+["'][^>]*>/gi,'');
    html=html.replace(/<script\b[^>]*src=["']https?:\/\/[^"']+["'][^>]*><\/script>/gi,'');
    html=html.replace('</head>','<script src="/__csp_smoke.js"></script></head>');
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':csp});res.end(html);
  }else{
    res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});res.end(fs.readFileSync(dest));
  }
 }catch(err){if(!route.startsWith('/favicon'))console.error('LOCAL HTTP',route,err.message);if(!res.headersSent)res.writeHead(404);if(!res.writableEnded)res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const routes=process.env.CSP_BROWSER_QUICK==='1'?['/','/about.html','/invitation-samples.html','/admin/ceo.html','/admin/invitation-leads.html','/admin/invitation-orders.html','/order.html','/demo/blessed-abode.html','/demo/botanical-letterpress.html']:['/','/404.html','/about.html','/contact.html','/courses.html','/digitalmarketing.html','/invitation-samples.html','/invitation.html','/portfolio.html','/privacy.html','/refund.html','/services.html','/terms.html','/top-templates.html','/webdevelopment.html','/demo/blessed-abode.html','/demo/botanical-letterpress.html','/demo/muslim-wedding.html','/demo/business-launch.html','/demo/royal-scroll.html','/admin/ceo.html','/admin/invitation-leads.html','/admin/invitation-orders.html','/order.html','/track-order.html'];
async function test(route){
 // Keep the CI smoke deterministic: offline external vendors and GPU/WebGL
 // effects are not required to verify CSP, CSS loading, and DOM interactions.
 const args=['--headless','--disable-gpu','--disable-webgl','--disable-software-rasterizer',
   '--disable-dev-shm-usage','--disable-extensions','--disable-background-networking',
   '--blink-settings=imagesEnabled=false',
   '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1',
   '--no-first-run','--no-default-browser-check','--window-size='+dimensions[viewport],'--force-device-scale-factor=1','--virtual-time-budget=1400',
   '--dump-dom','http://127.0.0.1:'+server.address().port+route];
 return await new Promise(resolve=>{
  const p=spawn(chrome,args,{stdio:['ignore','pipe','ignore']});
  let output='',done=false;const finish=result=>{if(done)return;done=true;clearTimeout(timer);p.kill();resolve(result);};
  p.stdout.on('data',data=>{output+=data.toString('utf8');if(output.length>4000000)finish('TOO_LARGE');});
  p.on('error',()=>finish('LAUNCH_ERROR'));
  p.on('close',()=>{const status=output.match(/data-csp-smoke="([^"]+)"/)?.[1]||'NO_RESULT';const info=output.match(/data-csp-smoke-detail="([^"]+)"/)?.[1]||'';finish(status+' '+info);});
  const timer=setTimeout(()=>finish('TIMEOUT'),13500);
 });
}
let failures=0;
try{
 for(const r of routes){
  const status=await test(r);console.log(status+' '+r);if(!status.startsWith('PASS'))failures++;
 }
}finally{server.close();}
if(failures)process.exitCode=1;
else console.log('Strict CSP browser interactions: '+routes.length+' representative pages PASS');
