const STAGES=['New','Designing','Review','Delivered','Completed'];
const BADGE={'New':'b-new','Designing':'b-designing','Review':'b-review','Delivered':'b-delivered','Completed':'b-completed'};
const DOT={'New':'var(--new)','Designing':'var(--designing)','Review':'var(--review)','Delivered':'var(--delivered)','Completed':'var(--completed)'};
const DEMO=[
 {id:'ORD-1001',date:'2026-06-22',name:'Haji Khan',mobile:'+91 90000 00005',email:'haji@example.com',event_type:'Nikah',invitation_type:'Website Invitation',package:'Premium',amount:1999,payment_id:'pay_demo01',status:'New',source:'demo:muslim-wedding',lead_id:'',template_id:'AB-NIK-002',template_name:'Crescent Elegance',demo:'muslim-wedding',notes:''},
 {id:'ORD-1002',date:'2026-06-21',name:'Priya M',mobile:'+91 90000 00006',email:'priya@example.com',event_type:'Housewarming',invitation_type:'PDF Invitation',package:'Basic',amount:299,payment_id:'pay_demo02',status:'Designing',source:'lead_crm',lead_id:'AB-0006',notes:'[21 Jun] Draft in progress.'},
 {id:'ORD-1003',date:'2026-06-20',name:'Grace Joseph',mobile:'+91 90000 00004',email:'grace@example.com',event_type:'Wedding',invitation_type:'Both (PDF + Website)',package:'Elite',amount:4999,payment_id:'pay_demo03',status:'Review',source:'lead_crm',lead_id:'AB-0004',template_id:'AB-WED-006',template_name:'The Editorial',demo:'wedding-magazine',notes:'[20 Jun] Shared for approval.'},
 {id:'ORD-1004',date:'2026-06-18',name:'Karthik R',mobile:'+91 90000 00009',email:'karthik@example.com',event_type:'Wedding',invitation_type:'Website Invitation',package:'Premium',amount:1999,payment_id:'pay_demo04',status:'Delivered',source:'/order',lead_id:'',notes:'[19 Jun] Website live.'},
 {id:'ORD-1005',date:'2026-06-15',name:'Ayesha N',mobile:'+91 90000 00010',email:'',event_type:'Birthday',invitation_type:'PDF Invitation',package:'Premium',amount:599,payment_id:'pay_demo05',status:'Completed',source:'/invitation',lead_id:'',notes:'[16 Jun] Delivered & closed.'},
 {id:'ORD-1006',date:'2026-06-23',name:'Suresh B',mobile:'+91 90000 00007',email:'suresh@example.com',event_type:'Business Event',invitation_type:'Both (PDF + Website)',package:'Basic',amount:1299,payment_id:'pay_demo06',status:'New',source:'demo:luxury-watch',lead_id:'',template_id:'AB-BIZ-004',template_name:'Luxury Watch',demo:'luxury-watch',notes:''}
];
let ORDERS=[],MODE='demo',PASS='',activeStage='',editing=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fmt=n=>'₹'+(Number(n)||0).toLocaleString('en-IN');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function apiGet(){const r=await fetch('/api/invitation-orders',{headers:{'x-admin-pass':PASS}});if(r.status===401)throw{code:401};if(r.status===503)throw{code:503};const d=await r.json();if(!r.ok||d.ok!==true)throw{code:r.status};return d;}
async function apiUpdate(id,patch){if(MODE==='demo'){const o=ORDERS.find(x=>x.id===id);Object.assign(o,patch);return{ok:true};}const r=await fetch('/api/invitation-orders',{method:'POST',headers:{'x-admin-pass':PASS,'Content-Type':'application/json'},body:JSON.stringify({action:'update',id,patch})});const d=await r.json();if(!r.ok||d.ok!==true||d.configured!==true)throw{code:r.status};return d;}

async function unlock(pass){$('#lockErr').textContent='';try{await window.AllBeeAdminAuth.signIn(pass,$('#passInput'));PASS=window.AllBeeAdminAuth.isMfa()?'':pass;const d=await apiGet();MODE='live';ORDERS=d.orders||[];$('#conn').className=d.configured?'conn live':'conn demo';$('#conn').textContent=d.configured?'Live':'Read-only';if(!d.configured){$('#banner').style.display='block';$('#banner').textContent='Read-only: the Orders sheet is not connected. Edits cannot be saved.';}if(!window.AllBeeAdminAuth.isMfa())sessionStorage.setItem('crm_pass',pass);$('#lock').style.display='none';render();}catch(e){$('#lockErr').textContent=e.code===401?'Incorrect passcode.':e.code===503?'Admin access is not configured. Use the demo preview.':'Could not load orders. Try again.';}}
function loadDemo(){MODE='demo';PASS='';ORDERS=JSON.parse(JSON.stringify(DEMO));$('#conn').className='conn demo';$('#conn').textContent='Demo';$('#banner').style.display='block';$('#banner').innerHTML='Showing <b>demo data</b> — fictional orders for preview.';$('#lock').style.display='none';render();}

function filtered(){const q=$('#search').value.trim().toLowerCase(),s=$('#fStatus').value||activeStage,from=$('#fFrom').value,to=$('#fTo').value;
  return ORDERS.filter(o=>{if(q&&!((o.name||'').toLowerCase().includes(q)||(o.mobile||'').toLowerCase().includes(q)||(o.id||'').toLowerCase().includes(q)))return false;if(s&&o.status!==s)return false;if(from&&(o.date||'')<from)return false;if(to&&(o.date||'')>to)return false;return true;});}

function render(){
  const total=ORDERS.length,rev=ORDERS.reduce((a,o)=>a+(Number(o.amount)||0),0);
  const pending=ORDERS.filter(o=>['New','Designing','Review'].includes(o.status)).length;
  const completed=ORDERS.filter(o=>o.status==='Completed').length;
  const aov=total?Math.round(rev/total):0;
  const overdue=ORDERS.filter(slaOverdue).length;
  $('#stats').innerHTML=[['Orders',total],['Revenue',fmt(rev),'rev'],['Avg Order',fmt(aov)],['Pending',pending],['Overdue',overdue,overdue?'warn':''],['Completed',completed]]
    .map(([l,v,c])=>`<div class="stat ${c||''}"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');
  $('#pipe').innerHTML=STAGES.map(s=>`<div class="pchip ${activeStage===s?'active':''}" data-stage="${s}"><div class="pc-n">${ORDERS.filter(o=>o.status===s).length}</div><div class="pc-l"><span class="dot" style="background:${DOT[s]}"></span>${s}</div></div>`).join('');
  const rows=filtered();$('#empty').style.display=rows.length?'none':'block';
  $('#list').innerHTML=rows.map(o=>`<div class="ord" data-id="${esc(o.id)}">
    <div><span class="cell-label">Order</span><strong>${esc(o.id)}</strong><br><small>${esc(o.date||'')}</small></div>
    <div><span class="cell-label">Customer</span><span class="nm">${esc(o.name)}</span><br><small>${esc(o.mobile||'')}</small></div>
    <div><span class="cell-label">Package</span>${esc(o.package||'')}<br><small>${esc((o.invitation_type||'').replace(' (PDF + Website)',''))}</small></div>
    <div><span class="cell-label">Amount</span><span class="amt">${fmt(o.amount)}</span></div>
    <div><span class="cell-label">Status</span><span class="badge ${BADGE[o.status]||'b-new'}">${esc(o.status)}</span>${slaOverdue(o)?` <span class="badge" style="background:#fdecea;color:#b5302a">⏱ Overdue</span>`:''}${o.assignee&&o.assignee!=='Unassigned'?`<br><small>👤 ${esc(o.assignee)}</small>`:''}</div>
    <div class="ord-actions"><button class="mini" data-view="${esc(o.id)}">View</button></div></div>`).join('');
  if(!$('#fStatus').dataset.filled){$('#fStatus').innerHTML='<option value="">All statuses</option>'+STAGES.map(s=>`<option>${s}</option>`).join('');$('#fStatus').dataset.filled='1';}
}
/* ---------- operations: SLA, tasks, assignees, notifications ---------- */
const ASSIGNEES=['Unassigned','Haji','Alim','Team'];
const SLA_DAYS={New:1,Designing:3,Review:2};
function ageDays(o){var d=o.updated||o.date;if(!d)return 0;var t=Date.parse(d);return isNaN(t)?0:(Date.now()-t)/864e5;}
function slaOverdue(o){var lim=SLA_DAYS[o.status];return lim?ageDays(o)>lim:false;}
function tasksFor(o){var step={New:0,Designing:1,Review:2,Delivered:3,Completed:4}[o.status]||0;return [['Design',step>=1],['Review',step>=2],['Delivery',step>=3]];}
function waNotify(o,stage){
  var nm=o.name||'there', M={
    received:'Hi '+nm+', we’ve received your order '+o.id+'. Our design team is starting work and we’ll share a draft soon. — AllBee Invitations',
    design:'Hi '+nm+', good news — we’ve started designing your '+(o.template_name||o.event_type||'invitation')+' ('+o.id+'). — AllBee Invitations',
    review:'Hi '+nm+', your draft for '+o.id+' is ready for review. Please take a look and share any changes. — AllBee Invitations',
    delivered:'Hi '+nm+', your invitation ('+o.id+') is delivered! You can view it anytime here: https://www.allbeesolutions.com/track-order — AllBee Invitations',
    brief:'Hi '+nm+', to start your invitation ('+o.id+') please share your event details here: https://www.allbeesolutions.com/design-brief?order='+encodeURIComponent(o.id)+' — and send any photos on WhatsApp. — AllBee Invitations',
    followup:'Hi '+nm+', just following up on your invitation ('+o.id+'). Any changes or questions? We’re happy to help. — AllBee Invitations'};
  return 'https://wa.me/'+(o.mobile||'').replace(/\D/g,'')+'?text='+encodeURIComponent(M[stage]||'');
}
function openOrder(id){const o=ORDERS.find(x=>x.id===id);if(!o)return;editing=id;$('#mTitle').textContent=o.id+' · '+o.name;
  $('#mBody').innerHTML=`<div class="kv">
    <div class="field"><label>Customer</label>${esc(o.name)}</div>
    <div class="field"><label>Mobile</label><a href="https://wa.me/${(o.mobile||'').replace(/\\D/g,'')}" target="_blank" rel="noopener">${esc(o.mobile)}</a></div>
    <div class="field"><label>Email</label>${o.email?esc(o.email):'—'}</div>
    <div class="field"><label>Event</label>${esc(o.event_type||'—')}</div>
    <div class="field"><label>Invitation</label>${esc(o.invitation_type||'—')}</div>
    <div class="field"><label>Template</label>${o.template_name?esc(o.template_name)+(o.template_id?` <small style="color:var(--muted)">(${esc(o.template_id)})</small>`:''):'—'}${o.demo?` · <a href="/demo/${esc(o.demo)}" target="_blank" rel="noopener">demo</a>`:''}</div>
    <div class="field"><label>Package</label>${esc(o.package||'—')}</div>
    <div class="field"><label>Amount</label><strong>${fmt(o.amount)}</strong></div>
    <div class="field"><label>Payment ID</label><small>${esc(o.payment_id||'—')}</small></div>
    <div class="field"><label>Lead Source</label>${esc(o.source||'—')}${o.lead_id?` · <a href="/admin/invitation-leads" target="_blank" rel="noopener">${esc(o.lead_id)}</a>`:''}</div>
    <div class="field"><label>Status</label><select id="eStatus" aria-label="Order status">${STAGES.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="field"><label>Assigned To</label><select id="eAssignee" aria-label="Assigned to">${ASSIGNEES.map(a=>`<option ${a===(o.assignee||'Unassigned')?'selected':''}>${a}</option>`).join('')}</select></div>
    <div class="field"><label>SLA</label>${slaOverdue(o)?`<span style="color:#b5302a;font-weight:700">⏱ Overdue — ${esc(o.status)} for ${Math.floor(ageDays(o))}d</span>`:'<span style="color:#16A34A;font-weight:700">✓ On track</span>'}</div>
    <div class="field"><label>Order Date</label>${esc(o.date||'—')}</div></div>
    <div class="field"><label>Tasks</label><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px">${tasksFor(o).map(([t,d])=>`<span style="font-weight:700;color:${d?'#16A34A':'var(--muted)'}">${d?'✓':'○'} ${t}</span>`).join('')}</div></div>
    <div class="field"><label>Delivery links (PDF / Website / ZIP URLs — space or comma separated)</label><textarea id="eDelivery" aria-label="Delivery links" rows="2" placeholder="https://… (shown to the customer on /track-order once status is Delivered)">${esc(o.delivery||'')}</textarea></div>
    <div class="field"><label>Notify customer on WhatsApp</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'received')}">Order received</a>
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'brief')}">Brief request</a>
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'design')}">Design started</a>
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'review')}">Review ready</a>
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'delivered')}">Delivered</a>
      <a class="mini" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="${waNotify(o,'followup')}">Follow-up</a></div></div>
    <div class="field"><label>Activity Log</label><div class="notelog">${esc(o.notes||'No notes yet.')}</div></div>
    <div class="field"><label>Add Note</label><textarea id="eNote" aria-label="Add note" rows="2" placeholder="Log an update…"></textarea></div>`;
  $('#modal').classList.add('open');}
function closeModal(){$('#modal').classList.remove('open');editing=null;}
async function save(){const o=ORDERS.find(x=>x.id===editing);if(!o)return;const status=$('#eStatus').value,note=$('#eNote').value.trim();let notes=o.notes||'';if(note){notes=(notes?notes+'\n':'')+`[${new Date().toISOString().slice(0,10)}] ${note}`;}const patch={status,notes};const asg=$('#eAssignee');if(asg)patch.assignee=asg.value;const dlv=$('#eDelivery');if(dlv)patch.delivery=dlv.value.trim();try{await apiUpdate(o.id,patch);Object.assign(o,patch);toast('Order updated');closeModal();render();}catch(e){toast('Save failed');}}

$('#passGo').onclick=()=>unlock($('#passInput').value);$('#passInput').addEventListener('keydown',e=>{if(e.key==='Enter')unlock($('#passInput').value);});
$('#demoLink').onclick=loadDemo;$('#signoutBtn').onclick=()=>window.AllBeeAdminAuth.signOut();
$('#refreshBtn').onclick=async()=>{if(MODE==='live'){try{const d=await apiGet();ORDERS=d.orders||[];render();toast('Refreshed');}catch(e){toast('Failed');}}else render();};
['#search','#fStatus','#fFrom','#fTo'].forEach(s=>$(s).addEventListener('input',render));
$('#clearBtn').onclick=()=>{$('#search').value='';$('#fStatus').value='';$('#fFrom').value='';$('#fTo').value='';activeStage='';render();};
$('#pipe').addEventListener('click',e=>{const c=e.target.closest('.pchip');if(!c)return;activeStage=activeStage===c.dataset.stage?'':c.dataset.stage;$('#fStatus').value='';render();});
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)openOrder(b.dataset.view);});

/* ---------- reporting ---------- */
let reportsOn=false;
function group(key){const m={};ORDERS.forEach(o=>{const k=key(o)||'—';(m[k]=m[k]||{count:0,rev:0}).count++;m[k].rev+=Number(o.amount)||0;});return m;}
function bars(obj,title){
  const ents=Object.entries(obj).sort((a,b)=>b[1].rev-a[1].rev);const max=Math.max(1,...ents.map(e=>e[1].rev));
  return `<div class="rep-card"><h3>${title}</h3>${ents.map(([k,v])=>`
    <div class="rep-row"><div class="top"><b>${esc(k)}</b><span class="amt">${fmt(v.rev)}</span></div>
    <div class="rep-bar"><span style="width:${Math.round(v.rev/max*100)}%"></span></div>
    <small>${v.count} order${v.count===1?'':'s'}</small></div>`).join('')||'<small>No data.</small>'}</div>`;
}
function renderReports(){
  const ym=new Date().toISOString().slice(0,7);
  const month=ORDERS.filter(o=>(o.date||'').slice(0,7)===ym);
  const monthRev=month.reduce((a,o)=>a+(Number(o.amount)||0),0);
  $('#reports').innerHTML=`<div class="rep-grid">
    <div class="rep-card rep-month"><div><div class="l" style="font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);font-weight:700">Revenue this month</div><div class="big">${fmt(monthRev)}</div></div><div><div class="l" style="font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);font-weight:700">Orders this month</div><div class="big" style="color:var(--teal-d)">${month.length}</div></div></div>
    ${bars(group(o=>o.package),'Revenue by Package')}
    ${bars(group(o=>o.event_type),'Revenue by Event Type')}
    ${bars(group(o=>o.source||'direct'),'Lead Source Performance')}
    ${bars(group(o=>o.template_name||o.template_id||'—'),'Template Performance')}
  </div>`;
}
$('#reportsBtn').onclick=()=>{
  reportsOn=!reportsOn;
  ['#stats','#pipe','.toolbar','.lhead','#list','#empty'].forEach(s=>{const el=document.querySelector(s);if(el)el.style.display=reportsOn?'none':'';});
  $('#reports').style.display=reportsOn?'block':'none';
  $('#reportsBtn').textContent=reportsOn?'← Orders':'Reports';
  if(reportsOn)renderReports();
};
$$('[data-close]').forEach(x=>x.addEventListener('click',closeModal));$('#mSave').onclick=save;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
(async function(){try{const state=await window.AllBeeAdminAuth.prepare($('#passInput'));if(state.mode==='totp'){if(state.authenticated)await unlock('');}else{const p=sessionStorage.getItem('crm_pass');if(p){$('#passInput').value=p;await unlock(p);}}}catch(e){$('#lockErr').textContent='Admin login is temporarily unavailable.';}})();
