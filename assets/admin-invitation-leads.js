const STAGES=['New Lead','Contacted','Quotation Sent','Negotiation','Won','Lost'];
const BADGE={'New Lead':'b-new','Contacted':'b-contacted','Quotation Sent':'b-quote','Negotiation':'b-nego','Won':'b-won','Lost':'b-lost'};
const DOT={'New Lead':'var(--new)','Contacted':'var(--contacted)','Quotation Sent':'var(--quote)','Negotiation':'var(--nego)','Won':'var(--won)','Lost':'var(--lost)'};
const EVENT_TYPES=['Wedding','Nikah','Birthday','Housewarming','Dargah Event','School Event','Business Event','Political Event','Other'];

/* Demo dataset (fictional — used for preview/testing; real data comes from the API) */
const DEMO=[
 {id:'AB-0001',date:'2026-06-20',name:'Ravi Kumar',mobile:'+91 90000 00001',email:'ravi@example.com',event_type:'Wedding',event_date:'2026-12-12',interested_in:'Both',notes:'Wants royal theme',source:'/invitation',status:'New Lead',value:0,crm_notes:''},
 {id:'AB-0002',date:'2026-06-19',name:'Fathima S',mobile:'+91 90000 00002',email:'fathima@example.com',event_type:'Nikah',event_date:'2026-09-13',interested_in:'Website Invitation',notes:'Needs Tamil + English',source:'/invitation-samples',status:'Contacted',value:0,crm_notes:'[19 Jun] Called, sending samples.'},
 {id:'AB-0003',date:'2026-06-18',name:'Anand R',mobile:'+91 90000 00003',email:'anand@example.com',event_type:'Birthday',event_date:'2026-08-15',interested_in:'PDF Invitation',notes:'Kids party',source:'/invitation',status:'Quotation Sent',value:0,crm_notes:'[18 Jun] Quote ₹299 sent.'},
 {id:'AB-0004',date:'2026-06-16',name:'Grace Joseph',mobile:'+91 90000 00004',email:'grace@example.com',event_type:'Wedding',event_date:'2026-11-21',interested_in:'Both',notes:'Christian wedding website',source:'demo:christian-wedding',status:'Negotiation',value:0,crm_notes:'[17 Jun] Discussing premium add-ons.',template_id:'AB-WED-004',template_name:'Classic Elegance',demo:'christian-wedding'},
 {id:'AB-0005',date:'2026-06-14',name:'Haji Khan',mobile:'+91 90000 00005',email:'haji@example.com',event_type:'Nikah',event_date:'2026-10-05',interested_in:'Website Invitation',notes:'Walima reception',source:'demo:muslim-wedding',status:'Won',value:999,crm_notes:'[15 Jun] Paid ₹999. Delivered.',template_id:'AB-NIK-001',template_name:'Noor Nikah',demo:'muslim-wedding'},
 {id:'AB-0006',date:'2026-06-12',name:'Priya M',mobile:'+91 90000 00006',email:'priya@example.com',event_type:'Housewarming',event_date:'2026-07-30',interested_in:'PDF Invitation',notes:'',source:'/invitation',status:'Won',value:299,crm_notes:'[13 Jun] Paid ₹299.'},
 {id:'AB-0007',date:'2026-06-10',name:'Suresh B',mobile:'+91 90000 00007',email:'',event_type:'Business Event',event_date:'2026-09-07',interested_in:'Both',notes:'Store opening',source:'/demo/business-launch',status:'Lost',value:0,crm_notes:'[12 Jun] Went with another vendor.'},
 {id:'AB-0008',date:'2026-06-22',name:'Lakshmi V',mobile:'+91 90000 00008',email:'lakshmi@example.com',event_type:'Wedding',event_date:'2026-09-13',interested_in:'Both',notes:'Hindu muhurtham',source:'/demo/hindu-wedding',status:'New Lead',value:0,crm_notes:''}
];

let LEADS=[], MODE='demo', PASS='', activeStage='', editing=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmtMoney=n=>'₹'+(Number(n)||0).toLocaleString('en-IN');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);};

/* ---------- data layer (future-ready) ---------- */
async function apiGet(){
  const r=await fetch('/api/invitation-leads',{headers:{'x-admin-pass':PASS}});
  if(r.status===401) throw {code:401};
  if(r.status===503) throw {code:503};
  const data=await r.json(); if(!r.ok||data.ok!==true) throw {code:r.status}; return data;
}
async function apiUpdate(id,patch){
  if(MODE==='demo'){const l=LEADS.find(x=>x.id===id);Object.assign(l,patch);return {ok:true};}
  const r=await fetch('/api/invitation-leads',{method:'POST',headers:{'x-admin-pass':PASS,'Content-Type':'application/json'},body:JSON.stringify({action:'update',id,patch})});
  const data=await r.json(); if(!r.ok||data.ok!==true||data.configured!==true) throw {code:r.status}; return data;
}

/* ---------- auth ---------- */
async function unlock(pass){
  $('#lockErr').textContent='';
  try{
    await window.AllBeeAdminAuth.signIn(pass,$('#passInput'));
    PASS=window.AllBeeAdminAuth.isMfa()?'':pass; const data=await apiGet();
    MODE='live'; LEADS=data.leads||[];
    $('#conn').className=data.configured?'conn live':'conn demo'; $('#conn').textContent=data.configured?'Live':'Read-only';
    if(!data.configured){ $('#banner').style.display='block'; $('#banner').textContent='Read-only: the Leads sheet is not connected. Edits cannot be saved.'; }
    if(!window.AllBeeAdminAuth.isMfa()) sessionStorage.setItem('crm_pass',pass);
    $('#lock').style.display='none'; render();
  }catch(e){ $('#lockErr').textContent=e.code===401?'Incorrect passcode. Try again.':e.code===503?'Admin access is not configured. Use the demo preview.':'Could not load leads. Try again.'; }
}
function loadDemo(){
  MODE='demo'; PASS=''; LEADS=JSON.parse(JSON.stringify(DEMO));
  $('#conn').className='conn demo'; $('#conn').textContent='Demo';
  $('#banner').style.display='block'; $('#banner').innerHTML='Showing <b>demo data</b> — fictional leads for preview. Enter your passcode (Sign out → reload) to load real leads.';
  $('#lock').style.display='none'; render();
}

/* ---------- filters ---------- */
function filtered(){
  const q=$('#search').value.trim().toLowerCase();
  const t=$('#fType').value, s=$('#fStatus').value||activeStage, from=$('#fFrom').value, to=$('#fTo').value;
  return LEADS.filter(l=>{
    if(q && !((l.name||'').toLowerCase().includes(q)||(l.mobile||'').toLowerCase().includes(q)||(l.email||'').toLowerCase().includes(q))) return false;
    if(t && l.event_type!==t) return false;
    if(s && l.status!==s) return false;
    if(from && (l.date||'') < from) return false;
    if(to && (l.date||'') > to) return false;
    return true;
  });
}

/* ---------- render ---------- */
function render(){
  // stats
  const total=LEADS.length, nw=LEADS.filter(l=>l.status==='New Lead').length;
  const won=LEADS.filter(l=>l.status==='Won').length, lost=LEADS.filter(l=>l.status==='Lost').length;
  const conv=(won+lost)? Math.round(won/(won+lost)*100):0;
  const rev=LEADS.filter(l=>l.status==='Won').reduce((a,l)=>a+(Number(l.value)||0),0);
  $('#stats').innerHTML=[
    ['Total Leads',total],['New Leads',nw],['Won',won],['Lost',lost],['Conversion',conv+'%'],['Revenue',fmtMoney(rev),'rev']
  ].map(([l,v,c])=>`<div class="stat ${c||''}"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');
  // pipeline
  $('#pipe').innerHTML=STAGES.map(s=>{
    const n=LEADS.filter(l=>l.status===s).length;
    return `<div class="pchip ${activeStage===s?'active':''}" data-stage="${s}"><div class="pc-n">${n}</div><div class="pc-l"><span class="dot"></span>${s}</div></div>`;
  }).join('');
  // list
  const rows=filtered();
  $('#empty').style.display=rows.length?'none':'block';
  $('#list').innerHTML=rows.map(l=>`
    <div class="lead" data-id="${esc(l.id)}">
      <div><span class="cell-label">Lead ID</span><strong>${esc(l.id)}</strong></div>
      <div><span class="cell-label">Name</span><span class="nm">${esc(l.name)}</span><br><small>${esc(l.mobile||'')}</small></div>
      <div><span class="cell-label">Event</span>${esc(l.event_type||'')}<br><small>${esc(l.event_date||'')}</small></div>
      <div><span class="cell-label">Source</span><small>${esc(l.source||'')}</small><br><small>${esc(l.date||'')}</small></div>
      <div><span class="cell-label">Status</span><span class="badge ${BADGE[l.status]||'b-new'}">${esc(l.status)}</span></div>
      <div class="lead-actions"><button class="mini" data-view="${esc(l.id)}">View</button></div>
    </div>`).join('');
  // populate filter selects once
  if(!$('#fType').dataset.filled){
    $('#fType').innerHTML='<option value="">All event types</option>'+EVENT_TYPES.map(t=>`<option>${t}</option>`).join('');
    $('#fStatus').innerHTML='<option value="">All statuses</option>'+STAGES.map(s=>`<option>${s}</option>`).join('');
    $('#fType').dataset.filled='1';
  }
}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ---------- modal ---------- */
function openLead(id){
  const l=LEADS.find(x=>x.id===id); if(!l) return; editing=id;
  $('#mTitle').textContent=l.id+' · '+l.name;
  $('#mBody').innerHTML=`
    <div class="kv">
      <div class="field"><label>Name</label><div class="val">${esc(l.name)}</div></div>
      <div class="field"><label>Mobile</label><div class="val"><a href="https://wa.me/${(l.mobile||'').replace(/\\D/g,'')}" target="_blank" rel="noopener">${esc(l.mobile)}</a></div></div>
      <div class="field"><label>Email</label><div class="val">${l.email?`<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>`:'—'}</div></div>
      <div class="field"><label>Event Type</label><div class="val">${esc(l.event_type)}</div></div>
      <div class="field"><label>Event Date</label><div class="val">${esc(l.event_date||'—')}</div></div>
      <div class="field"><label>Interested In</label><div class="val">${esc(l.interested_in||'—')}</div></div>
      <div class="field"><label>Source</label><div class="val">${esc(l.source||'—')}</div></div>
      <div class="field"><label>Template</label><div class="val">${l.template_name?esc(l.template_name)+(l.template_id?` <small>(${esc(l.template_id)})</small>`:''):'—'}${l.demo?` · <a href="/demo/${esc(l.demo)}" target="_blank" rel="noopener">demo</a>`:''}</div></div>
      <div class="field"><label>Enquiry Date</label><div class="val">${esc(l.date||'—')}</div></div>
    </div>
    <div class="field"><label>Enquiry Notes</label><div class="val">${esc(l.notes||'—')}</div></div>
    <div class="kv">
      <div class="field"><label>Status / Stage</label><select id="eStatus" aria-label="Status or stage">${STAGES.map(s=>`<option ${s===l.status?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="field"><label>Deal Value (₹)</label><input id="eValue" aria-label="Deal value in rupees" type="number" min="0" value="${Number(l.value)||0}"></div>
    </div>
    <div class="field"><label>Activity Log</label><div class="notelog">${esc(l.crm_notes||'No notes yet.')}</div></div>
    <div class="field"><label>Add Note</label><textarea id="eNote" aria-label="Add note" rows="2" placeholder="Log a call, message or update…"></textarea></div>`;
  $('#modal').classList.add('open');
}
function closeModal(){$('#modal').classList.remove('open');editing=null;}

async function saveLead(extra){
  const l=LEADS.find(x=>x.id===editing); if(!l) return;
  const status=$('#eStatus').value, value=Number($('#eValue').value)||0, note=$('#eNote').value.trim();
  let crm=l.crm_notes||'';
  if(note){const stamp=new Date().toISOString().slice(0,10);crm=(crm?crm+'\n':'')+`[${stamp}] ${note}`;}
  const patch=Object.assign({status,value,crm_notes:crm},extra||{});
  try{
    await apiUpdate(l.id,patch); Object.assign(l,patch);
    toast('Lead updated'); closeModal(); render();
  }catch(e){ toast('Save failed'); }
}

/* ---------- events ---------- */
$('#passGo').onclick=()=>unlock($('#passInput').value);
$('#passInput').addEventListener('keydown',e=>{if(e.key==='Enter')unlock($('#passInput').value);});
$('#demoLink').onclick=loadDemo;
$('#signoutBtn').onclick=()=>window.AllBeeAdminAuth.signOut();
$('#refreshBtn').onclick=async()=>{ if(MODE==='live'){try{const d=await apiGet();LEADS=d.leads||[];render();toast('Refreshed');}catch(e){toast('Refresh failed');}} else render(); };
['#search','#fType','#fStatus','#fFrom','#fTo'].forEach(s=>$(s).addEventListener('input',render));
$('#clearBtn').onclick=()=>{$('#search').value='';$('#fType').value='';$('#fStatus').value='';$('#fFrom').value='';$('#fTo').value='';activeStage='';render();};
$('#pipe').addEventListener('click',e=>{const c=e.target.closest('.pchip');if(!c)return;activeStage=activeStage===c.dataset.stage?'':c.dataset.stage;$('#fStatus').value='';render();});
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)openLead(b.dataset.view);});
$$('[data-close]').forEach(x=>x.addEventListener('click',closeModal));
$('#mSave').onclick=()=>saveLead();
$('#mConvert').onclick=()=>{const l=LEADS.find(x=>x.id===editing);if(!l)return;
  const ii=(l.interested_in||'');const type=/both/i.test(ii)?'Both (PDF + Website)':/website/i.test(ii)?'Website Invitation':/pdf/i.test(ii)?'PDF Invitation':'';
  const p=new URLSearchParams({name:l.name||'',mobile:l.mobile||'',email:l.email||'',event:l.event_type||'',event_date:l.event_date||'',type:type,lead_id:l.id,source:l.source||'lead_crm'});
  window.open('/order?'+p.toString(),'_blank');};
$('#mWon').onclick=()=>{const v=prompt('Deal value won (₹):',$('#eValue').value||'0');if(v===null)return;$('#eValue').value=Number(v)||0;$('#eStatus').value='Won';saveLead({status:'Won'});};
$('#mLost').onclick=()=>{$('#eStatus').value='Lost';saveLead({status:'Lost'});};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* auto-resume session */
(async function(){try{const state=await window.AllBeeAdminAuth.prepare($('#passInput'));if(state.mode==='totp'){if(state.authenticated)await unlock('');}else{const p=sessionStorage.getItem('crm_pass');if(p){$('#passInput').value=p;await unlock(p);}}}catch(e){$('#lockErr').textContent='Admin login is temporarily unavailable.';}})();
