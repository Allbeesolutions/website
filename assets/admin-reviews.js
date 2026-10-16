(function(){
  var $=function(s){return document.querySelector(s);};
  var REVIEWS=[],PASS='',MODE='live',FILTER='pending';
  var DEMO=[
    {id:'REV-0001',date:'2026-06-24',name:'Priya & Karthik',city:'Nagapattinam',event_type:'Wedding',rating:5,review:'Our relatives loved this invitation — everyone asked who designed it.',moderated:true},
    {id:'REV-0002',date:'2026-06-23',name:'Ayesha N.',city:'Nagore',event_type:'Nikah',rating:5,review:'Very premium looking website, and so easy to share on WhatsApp.',moderated:false},
    {id:'REV-0003',date:'2026-06-22',name:'Suresh B.',city:'Chennai',event_type:'Business Event',rating:4,review:'Worth every rupee. Looked very professional.',moderated:false}
  ];
  function stars(n){return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  function render(){
    var rows=REVIEWS.filter(function(r){return FILTER==='all'?true:(FILTER==='approved'?r.moderated:!r.moderated);});
    $('#list').innerHTML=rows.map(function(r){
      return '<div class="rev"><div class="h"><span class="st">'+stars(r.rating)+'</span><span class="badge '+(r.moderated?'a':'p')+'">'+(r.moderated?'Approved':'Pending')+'</span></div>'+
        '<p>&ldquo;'+esc(r.review)+'&rdquo;</p><div class="who">'+esc(r.name)+(r.city?' · '+esc(r.city):'')+(r.event_type?' · '+esc(r.event_type):'')+' · '+esc(r.date)+'</div>'+
        '<div class="acts">'+(r.moderated?'<button class="rej" data-id="'+esc(r.id)+'" data-m="0">Unpublish</button>':'<button class="ap" data-id="'+esc(r.id)+'" data-m="1">Approve</button>')+'</div></div>';
    }).join('')||'<div class="empty">No '+FILTER+' reviews.</div>';
  }
  function open(){$('#lock').classList.add('hidden');$('#app').classList.remove('hidden');}
  function loadDemo(){MODE='demo';REVIEWS=DEMO.slice();$('#banner').classList.remove('hidden');$('#banner').textContent='Demo data — connect the data layer for live reviews.';open();render();}
  async function load(pass){
    try{await window.AllBeeAdminAuth.signIn(pass,$('#pass'));if(window.AllBeeAdminAuth.isMfa())pass='';var r=await fetch('/api/reviews',{method:'POST',headers:{'x-admin-pass':pass,'Content-Type':'application/json'},body:JSON.stringify({action:'list'})});
      if(r.status===401){alert('Wrong passcode.');return;}var d=await r.json();
      if(!r.ok||d.ok!==true){alert('Could not load reviews.');return;}
      if(d.configured===false){alert('Review storage is not connected. Use the demo preview.');return;}
      PASS=pass;MODE='live';REVIEWS=d.reviews||[];open();render();}catch(e){alert('Failed to load.');}
  }
  async function moderate(id,m){
    if(MODE==='demo'){var x=REVIEWS.find(function(r){return r.id===id;});if(x)x.moderated=!!m;render();return;}
    try{var response=await fetch('/api/reviews',{method:'POST',headers:{'x-admin-pass':PASS,'Content-Type':'application/json'},body:JSON.stringify({action:'moderate',id:id,moderated:!!m})});var result=await response.json();if(!response.ok||result.ok!==true)throw Error('moderation failed');var y=REVIEWS.find(function(r){return r.id===id;});if(y)y.moderated=!!m;render();}catch(e){alert('Failed.');}
  }
  $('#go').onclick=function(){var p=$('#pass').value;if(p||window.AllBeeAdminAuth.isMfa())load(p);};
  $('#pass').addEventListener('keydown',function(e){if(e.key==='Enter')$('#go').click();});
  $('#demoLink').onclick=loadDemo;
  $('#abAdminSignOut').onclick=function(){window.AllBeeAdminAuth.signOut();};
  document.querySelector('.tabs').addEventListener('click',function(e){var t=e.target.closest('.tab');if(!t)return;FILTER=t.dataset.f;document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x===t);});render();});
  $('#list').addEventListener('click',function(e){var b=e.target.closest('[data-id]');if(b)moderate(b.dataset.id,b.dataset.m==='1');});
  if(new URLSearchParams(location.search).get('demo'))loadDemo();
  else window.AllBeeAdminAuth.prepare($('#pass')).then(function(s){if(s.mode==='totp'&&s.authenticated)load('');}).catch(function(){});
})();
