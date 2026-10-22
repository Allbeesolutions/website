/* ---------- configurable pricing (display) — server re-computes authoritatively ---------- */
const PRICING={
  'PDF Invitation':   {Basic:299, Premium:599, Elite:999},
  'Website Invitation':{Basic:999, Premium:1999, Elite:3999},
  'Both (PDF + Website)':{Basic:1299, Premium:2499, Elite:4999}
};
const PRICING_SERVICE={
  'PDF Invitation':'invitation-pdf',
  'Website Invitation':'invitation-website',
  'Both (PDF + Website)':'invitation-both'
};
const EVENTS=['Wedding','Nikah','Birthday','Housewarming','Dargah Event','School Event','Business Event','Political Event','Other'];
const TYPES=[
 {k:'PDF Invitation',d:'A beautiful downloadable invitation card to share on WhatsApp.'},
 {k:'Website Invitation',d:'A live invitation website with RSVP, countdown, maps & gallery.'},
 {k:'Both (PDF + Website)',d:'Get the card and the website together — best value.'}
];
const PKG_FEATURES={
 Basic:['1 design concept','Standard delivery','WhatsApp ready'],
 Premium:['Premium design','Priority delivery','Revisions included'],
 Elite:['Signature design','Fastest delivery','Unlimited revisions','Custom domain (website)']
};
const fmt=n=>'₹'+Number(n).toLocaleString('en-IN');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const order={event:'',type:'',pkg:'',name:'',mobile:'',email:'',event_date:'',amount:0,lead_id:'',source:'/order',template_id:'',template_name:'',demo:''};
/* Prefill from URL (e.g. "Convert Lead to Order" from the CRM, or "Order this design" from a demo) */
(function(){const q=new URLSearchParams(location.search);
  if(q.get('name'))order.name=q.get('name'); if(q.get('mobile'))order.mobile=q.get('mobile');
  if(q.get('email'))order.email=q.get('email'); if(q.get('event'))order.event=q.get('event');
  if(q.get('type'))order.type=q.get('type'); if(q.get('event_date'))order.event_date=q.get('event_date');
  if(q.get('lead_id')){order.lead_id=q.get('lead_id');order.source='lead_crm';}
  if(q.get('template_id'))order.template_id=q.get('template_id').slice(0,20);
  if(q.get('template_name'))order.template_name=q.get('template_name').slice(0,60);
  if(q.get('demo'))order.demo=q.get('demo').slice(0,40);
  if(q.get('source'))order.source=q.get('source');
  // Only real catalogue choices can be preselected from an external URL.
  if(!EVENTS.includes(order.event))order.event='';
  if(!TYPES.some(t=>t.k===order.type))order.type='';})();
let step=1; const TOTAL=6;
let selectedTemplate=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

function renderSteps(){
  $('#steps').innerHTML=Array.from({length:TOTAL},(_,i)=>`<div class="stepdot ${i+1<step?'done':''} ${i+1===step?'active':''}"></div>`).join('');
  $('#stepnum').textContent=`Step ${step} of ${TOTAL}`;
}
function show(){
  $$('.step').forEach(s=>s.classList.toggle('hidden',+s.dataset.step!==step));
  const hint=$('#designHint');
  if(hint){ hint.style.display=order.template_id||order.template_name?'block':'none'; if(order.template_id||order.template_name){ hint.innerHTML='<div class="sline"><span class="lbl">Selected design</span><strong>'+esc(order.template_name||order.template_id)+'</strong></div><div class="ab-order-hint">You can change the design before ordering by going back to the catalogue.</div>'; } }
  $('#backBtn').style.visibility=step===1?'hidden':'visible';
  $('#nav').style.display=step===6?'none':'flex';
  if(step===3) buildPackages();
  if(step===5) buildSummary('#summary');
  if(step===6) buildPay();
  renderSteps();
  window.scrollTo({top:0,behavior:'smooth'});
}
function amount(){ return (PRICING[order.type]&&PRICING[order.type][order.pkg])||0; }
async function loadPricing(){
  try{
    const res=await fetch('/api/public-pricing',{headers:{Accept:'application/json'},cache:'no-store'});
    const data=await res.json();
    if(!data || !data.ok || !Array.isArray(data.rows)) return;
    data.rows.forEach(function(row){
      const type=Object.keys(PRICING_SERVICE).find(function(k){return PRICING_SERVICE[k]===row.service_slug;});
      const pkg=String(row.package_slug||'').replace(/^./,function(ch){return ch.toUpperCase();});
      const price=Number(row.price);
      if(type && PRICING[type] && ['Basic','Premium','Elite'].indexOf(pkg)>=0 && Number.isFinite(price) && price>=0) PRICING[type][pkg]=price;
    });
  }catch(_error){ /* Keep the last-known safe fallback if the catalogue is unavailable. */ }
}

/* step builders */
$('#evGrid').innerHTML=EVENTS.map(e=>`<div class="ev" data-ev="${e}">${e}</div>`).join('');
$('#typeGrid').innerHTML=TYPES.map(t=>`<div class="opt" data-type="${t.k}"><h3>${t.k.replace(' (PDF + Website)','')}</h3><div class="d">${t.d}</div></div>`).join('');
/* reflect any URL prefill in the UI */
(function(){
  if(order.event){const el=$$('#evGrid [data-ev]').find(x=>x.dataset.ev===order.event);if(el)el.classList.add('sel');}
  if(order.type){const el=$$('#typeGrid [data-type]').find(x=>x.dataset.type===order.type);if(el)el.classList.add('sel');}
  const f=$('#custForm'); if(order.name)f.name.value=order.name; if(order.mobile)f.mobile.value=order.mobile;
  if(order.email)f.email.value=order.email; if(order.event_date)f.event_date.value=order.event_date;
})();
function allowedPackages(){
  return selectedTemplate && Array.isArray(selectedTemplate.pkgs) ? selectedTemplate.pkgs : ['Basic','Premium','Elite'];
}
function buildPackages(){
  $('#pkgFor').textContent=order.type;
  const p=PRICING[order.type];
  const allowed=allowedPackages();
  if(order.pkg && !allowed.includes(order.pkg)) order.pkg='';
  $('#pkgGrid').innerHTML=['Basic','Premium','Elite'].filter(k=>allowed.includes(k)).map(k=>`
    <div class="opt ${k==='Premium'?'':''}" data-pkg="${k}">
      ${k==='Premium'?'<span class="pop">Most Popular</span>':''}
      <h3>${k}</h3><div class="price">${fmt(p[k])}</div>
      <ul>${PKG_FEATURES[k].map(f=>`<li>${f}</li>`).join('')}</ul>
    </div>`).join('');
  $$('#pkgGrid .opt').forEach(o=>o.classList.toggle('sel',o.dataset.pkg===order.pkg));
}
function buildSummary(sel){
  $(sel).innerHTML=`
    ${order.template_name?`<div class="sline"><span class="lbl">Design</span><span>${esc(order.template_name)}${order.template_id?` <small class="ab-muted-small">(${esc(order.template_id)})</small>`:''}</span></div>`:''}
    <div class="sline"><span class="lbl">Event</span><span>${esc(order.event||'—')}</span></div>
    <div class="sline"><span class="lbl">Invitation</span><span>${esc(order.type.replace(' (PDF + Website)','')||'—')}</span></div>
    <div class="sline"><span class="lbl">Package</span><span>${esc(order.pkg||'—')}</span></div>
    <div class="sline"><span class="lbl">Name</span><span>${esc(order.name||'—')}</span></div>
    <div class="sline"><span class="lbl">Mobile</span><span>${esc(order.mobile||'—')}</span></div>
    <div class="sline"><span class="lbl">Event date</span><span>${esc(order.event_date||'—')}</span></div>
    <div class="sline"><span class="lbl">Total</span><span class="stotal">${fmt(amount())}</span></div>
    <div class="ab-summary-features">
      <span>&#10003; Mobile Friendly</span><span>&#10003; Share on WhatsApp</span>
      <span>&#10003; Unlimited Guests</span><span>&#10003; 100% Custom Design</span>
      <span>&#10003; Fast Delivery</span><span>&#10003; Support Available</span>
    </div>
    `;
}
function buildPay(){ buildSummary('#paySummary'); $('#payAmt').textContent=fmt(amount()); }

/* selection events */
$('#evGrid').addEventListener('click',e=>{const c=e.target.closest('.ev');if(!c)return;order.event=c.dataset.ev;$$('#evGrid .ev').forEach(x=>x.classList.toggle('sel',x===c));});
$('#typeGrid').addEventListener('click',e=>{const c=e.target.closest('.opt');if(!c)return;order.type=c.dataset.type;order.pkg='';$$('#typeGrid .opt').forEach(x=>x.classList.toggle('sel',x===c));});
$('#pkgGrid').addEventListener('click',e=>{const c=e.target.closest('.opt');if(!c)return;order.pkg=c.dataset.pkg;$$('#pkgGrid .opt').forEach(x=>x.classList.toggle('sel',x===c));});

/* validation per step */
function valid(){
  if(step===1) return !!order.event;
  if(step===2) return !!order.type;
  if(step===3) return !!order.pkg;
  if(step===4){const f=$('#custForm');order.name=f.name.value.trim();order.mobile=f.mobile.value.trim();order.email=f.email.value.trim();order.event_date=f.event_date.value;
    if(!order.name||!/^[+0-9 ()-]{8,20}$/.test(order.mobile)){f.reportValidity();return false;} return true;}
  return true;
}
$('#nextBtn').onclick=()=>{ if(!valid()){alert('Please complete this step to continue.');return;} order.amount=amount(); if(step<TOTAL){step++;show();} };
$('#backBtn').onclick=()=>{ if(step>1){step--;show();} };

/* ---------- payment ---------- */
function loadRzp(cb){ if(window.Razorpay)return cb(); const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=cb; s.onerror=()=>{$('#payErr').textContent='Could not load the payment gateway. Please try again.';}; document.head.appendChild(s); }
function showResult(html){ $('#payView').classList.add('hidden'); $('#resultView').classList.remove('hidden'); $('#resultView').innerHTML=html; $('#nav').style.display='none'; renderSteps(); }
function successView(orderId, paymentId){ gax('payment_success',{template_id:order.template_id||'',template_name:order.template_name||'',event:order.event||'',value:order.amount||0,currency:'INR'}); gax('order_complete',{template_id:order.template_id||'',template_name:order.template_name||'',event:order.event||'',value:order.amount||0,paid:true}); showResult(`<div class="big">🎉</div><h2>Payment submitted</h2><p>Thank you, ${esc(order.name)}. Payment for order <strong>${esc(orderId||'')}</strong> was submitted. We are verifying it now and will confirm your order on WhatsApp at ${esc(order.mobile)}.</p><p class="sub">Keep this reference for support: ${esc(paymentId||orderId||'pending')}</p><div class="ab-order-success-actions"><a class="btn btn-primary" href="/design-brief?order=${encodeURIComponent(orderId||'')}">Share your event details →</a><a class="btn btn-secondary" href="https://wa.me/918903607506">Ask about your payment</a></div>`); }

$('#payBtn').onclick=async(e)=>{
  $('#payErr').textContent=''; $('#payBtn').disabled=true; $('#payBtn').textContent='Processing…';
  try{
    const res=await fetch('/api/order-create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
    const data=await res.json();
    if(!data.ok){ $('#payErr').textContent=data.error==='validation_error'?'Please check your details.':'Something went wrong. Please try again.'; reset(); return; }
    if(!data.configured){
      /* Save the exact package request. A previous lead does not record this selection. */
      const captureRes=await fetch('/api/invitation-enquiry',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:order.name,mobile:order.mobile,email:order.email,event_type:order.event,event_date:order.event_date,
          interested_in:[order.type],notes:`ORDER REQUEST · ${order.template_name?order.template_name+' ['+order.template_id+'] · ':''}${order.type} · ${order.pkg} · ${fmt(order.amount)}${order.lead_id?' · Previous lead '+order.lead_id:''}`,source:order.source||'/order',template_id:order.template_id,template_name:order.template_name,demo:order.demo,render_ts:Date.now()-3000})});
      const capture=await captureRes.json().catch(()=>({}));
      if(!captureRes.ok || capture.captured!==true || !capture.lead_id){
        $('#payErr').textContent='We could not save your request. Please try again or contact us on WhatsApp.';
        reset();
        return;
      }
      gax('order_request_saved',{template_id:order.template_id||'',template_name:order.template_name||'',event:order.event||'',value:order.amount||0,paid:false}); gax('enquiry_success',{source:'order_fallback',template_id:order.template_id||'',event:order.event||'',value:order.amount||0});
      showResult(`<div class="big">✅</div><h2>Request received</h2><p>Thank you, ${esc(order.name)}. We saved your request for the <strong>${esc(order.pkg)} ${esc(order.type.replace(' (PDF + Website)',''))}</strong> (${fmt(order.amount)}). Payment is still pending; our team will send a secure payment link on WhatsApp shortly.</p><p class="sub">Reference: ${esc(capture.lead_id)}. No payment was taken on this screen.</p><a class="btn btn-primary" href="https://wa.me/918903607506">Contact us about this request</a>`);
      return;
    }
    loadRzp(()=>{
      const rzp=new Razorpay({key:data.key_id,order_id:data.order_id,amount:data.amount,currency:'INR',
        name:'AllBee Invitations',description:`${order.pkg} · ${order.type}`,image:'/logo.png',
        prefill:{name:order.name,email:order.email,contact:order.mobile},theme:{color:'#0F7B6E'},
        handler:function(resp){ successView(data.receipt, resp.razorpay_payment_id); },
        modal:{ondismiss:function(){ gax('checkout_dismissed',{template_id:order.template_id||'',event:order.event||'',value:order.amount||0,currency:'INR'}); reset(); }}});
      rzp.on('payment.failed',function(resp){ gax('payment_failure',{template_id:order.template_id||'',event:order.event||'',value:order.amount||0,currency:'INR',reason:(resp&&resp.error&&resp.error.reason)||'failed'}); $('#payErr').textContent='Payment failed or cancelled. Please try again.'; reset(); });
      gax('checkout_start',{template_id:order.template_id||'',template_name:order.template_name||'',event:order.event||'',value:order.amount||0,currency:'INR'});
      rzp.open();
    });
  }catch(e){ $('#payErr').textContent='Network error. Please try again.'; reset(); }
  function reset(){ $('#payBtn').disabled=false; $('#payBtn').innerHTML='Pay <span id="payAmt">'+fmt(amount())+'</span> &amp; Place Order'; }
};

Promise.all([
  loadPricing(),
  order.template_id ? fetch('/assets/invitation-templates.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(rows=>{
    selectedTemplate=Array.isArray(rows)?rows.find(t=>t.id===order.template_id)||null:null;
    if(order.template_id && !selectedTemplate){ order.template_id=''; order.template_name=''; order.demo=''; }
  }).catch(()=>{ selectedTemplate=null; }) : Promise.resolve()
]).finally(function(){ show(); gax('order_start',{event:order.event||'',template_id:order.template_id||'',template_name:order.template_name||''}); });
fetch('/api/health').then(r=>r.json()).then(h=>{const el=document.getElementById('paymentStatus');if(!el)return;if(h&&h.checks&&h.checks.razorpay){el.textContent='🔒 Payments are processed securely via Razorpay. We never store your card details.';}else{el.textContent='ℹ️ Online payment is not active yet. Your order request can still be saved; no payment will be taken until checkout is enabled.';}}).catch(()=>{const el=document.getElementById('paymentStatus');if(el)el.textContent='ℹ️ Online checkout status is unavailable. No payment is taken unless the secure gateway opens.'});
