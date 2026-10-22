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
const harness=`(function(){
 var errors=[];
 window.addEventListener('error',function(e){ if(e.message && !String(e.message).includes('ResizeObserver') && !String(e.message).includes('Error creating WebGL context')) errors.push(String(e.message).slice(0,100));});
 window.addEventListener('securitypolicyviolation',function(e){ if(String(e.effectiveDirective).startsWith('script-src')) errors.push('CSP script violation: '+String(e.blockedURI).slice(0,100)); });
 window.addEventListener('securitypolicyviolation',function(e){if(e.violatedDirective && e.violatedDirective.startsWith('script-src') && e.blockedURI==='inline')errors.push('Blocked inline script');});
 window.addEventListener('securitypolicyviolation',function(e){if(e.violatedDirective && e.violatedDirective.startsWith('style-src-elem') && e.blockedURI==='inline')errors.push('Blocked inline stylesheet');});
 function verify(){
   var p=location.pathname,behavior='loaded',pass=true;
   try {
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
       behavior='modal works';
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
   document.documentElement.dataset.cspSmoke=(pass&&!errors.length)?'PASS':'FAIL';
   document.documentElement.dataset.cspSmokeDetail=(behavior+':'+errors.join('|')).slice(0,200);
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
    html=html.replace('</head>','<script src="/__csp_smoke.js"></script></head>');
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':csp});res.end(html);
  }else{
    res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});res.end(fs.readFileSync(dest));
  }
 }catch(err){if(!route.startsWith('/favicon'))console.error('LOCAL HTTP',route,err.message);if(!res.headersSent)res.writeHead(404);if(!res.writableEnded)res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const routes=process.env.CSP_BROWSER_QUICK==='1'?['/','/about.html','/invitation-samples.html','/demo/blessed-abode.html','/demo/botanical-letterpress.html','/portfolio.html']:['/','/404.html','/about.html','/contact.html','/courses.html','/digitalmarketing.html','/invitation-samples.html','/invitation.html','/portfolio.html','/privacy.html','/refund.html','/services.html','/terms.html','/top-templates.html','/webdevelopment.html','/demo/blessed-abode.html','/demo/botanical-letterpress.html','/demo/muslim-wedding.html','/demo/business-launch.html','/demo/royal-scroll.html'];
async function test(route){
 const args=['--headless','--disable-gpu','--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--virtual-time-budget=2200','--dump-dom','http://127.0.0.1:'+server.address().port+route];
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
