(function(){
  var $=function(s){return document.querySelector(s);};
  var STAGES=['New','Designing','Review','Delivered','Completed'];
  var SLA={New:1,Designing:3,Review:2};
  var ORDERS=[],LEADS=[],PASS='',MODE='live';
  var fmt=function(n){return '₹'+Number(n||0).toLocaleString('en-IN');};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];});};
  var today=new Date().toISOString().slice(0,10), ym=today.slice(0,7);
  function ageDays(o){var d=o.updated||o.date;var t=Date.parse(d);return isNaN(t)?0:(Date.now()-t)/864e5;}
  function overdue(o){var l=SLA[o.status];return l?ageDays(o)>l:false;}

  var DEMO_O=[
   {id:'ORD-1001',date:today,amount:1999,status:'Designing',template_name:'Crescent Elegance',event_type:'Nikah'},
   {id:'ORD-1002',date:today,amount:4999,status:'New',template_name:'The Editorial',event_type:'Wedding'},
   {id:'ORD-1003',date:'2026-06-20',amount:999,status:'Review',template_name:'Passport Journey',event_type:'Wedding'},
   {id:'ORD-1004',date:'2026-06-18',amount:1299,status:'Delivered',template_name:'Royal Mandap',event_type:'Wedding'},
   {id:'ORD-1005',date:today,amount:599,status:'Completed',template_name:'VIP Access',event_type:'Birthday'},
   {id:'ORD-1006',date:'2026-06-12',amount:3999,status:'Designing',template_name:'Luxury Watch',event_type:'Business Event'}
  ];
  var DEMO_L=[{date:today,template_id:'AB-NIK-002'},{date:today,template_id:'AB-WED-006'},{date:today,template_id:'AB-WED-001'},{date:'2026-06-20',template_id:'AB-WED-009'},{date:'2026-06-19',template_id:'AB-BIR-005'}];
  // add template_id + source + updated to demo orders for the new breakdowns
  DEMO_O.forEach(function(o,i){o.template_id=['AB-NIK-002','AB-WED-006','AB-WED-009','AB-WED-001','AB-BIR-005','AB-BIZ-004'][i];o.source=['demo:nikah-makkah-night','template:AB-WED-006','category:wedding','demo:hindu-wedding','featured:AB-BIR-005','demo:luxury-watch'][i];o.updated=(['Delivered','Completed'].indexOf(o.status)>=0)?new Date(Date.parse(o.date)+3*864e5).toISOString():o.updated;});

  function kpi(v,l,s,cls){return '<div class="kpi '+(cls||'')+'"><div class="v">'+v+'</div><div class="l">'+l+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>';}
  function render(){
    var revToday=ORDERS.filter(function(o){return (o.date||'').slice(0,10)===today;}).reduce(function(a,o){return a+(+o.amount||0);},0);
    var revMonth=ORDERS.filter(function(o){return (o.date||'').slice(0,7)===ym;}).reduce(function(a,o){return a+(+o.amount||0);},0);
    var ordersToday=ORDERS.filter(function(o){return (o.date||'').slice(0,10)===today;}).length;
    var leadsToday=LEADS.filter(function(l){return (l.date||'').slice(0,10)===today;}).length;
    var pending=ORDERS.filter(function(o){return ['New','Designing','Review'].indexOf(o.status)>=0;}).length;
    var over=ORDERS.filter(overdue).length;
    var conv=LEADS.length?Math.round(ORDERS.length/LEADS.length*100):0;
    var aov=ORDERS.length?Math.round(ORDERS.reduce(function(a,o){return a+(+o.amount||0);},0)/ORDERS.length):0;
    // average delivery time (order date → updated) for Delivered/Completed orders
    var deliv=ORDERS.filter(function(o){return ['Delivered','Completed'].indexOf(o.status)>=0 && o.updated && o.date;})
      .map(function(o){return (Date.parse(o.updated)-Date.parse(o.date))/864e5;}).filter(function(d){return d>=0;});
    var avgDeliv=deliv.length?(deliv.reduce(function(a,b){return a+b;},0)/deliv.length):0;
    $('#kpis').innerHTML=
      kpi(fmt(revToday),'Revenue Today','','gold')+
      kpi(fmt(revMonth),'Revenue This Month','','gold')+
      kpi(leadsToday,'Leads Today')+
      kpi(ordersToday,'Orders Today')+
      kpi(conv+'%','Conversion Rate',ORDERS.length+' orders / '+LEADS.length+' leads')+
      kpi(pending,'Pending Deliveries')+
      kpi(over,'Overdue Orders', over?'Needs attention':'All on track', over?'bad':'')+
      kpi(fmt(aov),'Avg Order Value')+
      kpi(avgDeliv?avgDeliv.toFixed(1)+'d':'—','Avg Delivery Time',deliv.length+' delivered');
    // leads per template (for conversion by template)
    var lt=Object.create(null);LEADS.forEach(function(l){if(l.template_id)lt[l.template_id]=(lt[l.template_id]||0)+1;});
    // revenue + conversion by template
    var m=Object.create(null);ORDERS.forEach(function(o){var k=o.template_name||'—';(m[k]=m[k]||{rev:0,n:0,cat:o.event_type,tid:o.template_id});m[k].rev+=(+o.amount||0);m[k].n++;});
    var top=Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return b[1].rev-a[1].rev;}).slice(0,5);
    $('#topTpl').innerHTML=top.map(function(e,i){var L=lt[e[1].tid]||0;var cv=L?Math.round(e[1].n/L*100)+'% conv':e[1].n+' ord';return '<div class="tt"><span class="rk">'+(i+1)+'</span><span class="nm">'+esc(e[0])+'<div class="ct">'+esc(e[1].cat||'')+' · '+cv+'</div></span><span class="mt">'+fmt(e[1].rev)+'</span></div>';}).join('')||'<div class="ct">No orders yet.</div>';
    // revenue by category + by source (bars)
    function bars(el,keyf){var g=Object.create(null);ORDERS.forEach(function(o){var k=keyf(o)||'—';g[k]=(g[k]||0)+(+o.amount||0);});var ks=Object.keys(g).sort(function(a,b){return g[b]-g[a];});var mx=Math.max.apply(null,ks.map(function(k){return g[k];}).concat([1]));$(el).innerHTML=ks.map(function(k){return '<div class="pr"><span class="pl" title="'+esc(k)+'">'+esc(k)+'</span><span class="bar"><span class="ab-meter-fill" data-ab-pct="'+Math.max(0,Math.min(100,Math.round(g[k]/mx*100)))+'"></span></span><span class="pn ab-report-width-auto">'+fmt(g[k])+'</span></div>';}).join('')||'<div class="ct">No data.</div>';}
    bars('#catRev',function(o){return o.event_type;});
    bars('#srcRev',function(o){return (String(o.source||'direct').split(':')[0]);});
    var max=Math.max(1,Math.max.apply(null,STAGES.map(function(s){return ORDERS.filter(function(o){return o.status===s;}).length;})));
    $('#pipe').innerHTML=STAGES.map(function(s){var c=ORDERS.filter(function(o){return o.status===s;}).length;return '<div class="pr"><span class="pl">'+s+'</span><span class="bar"><span class="ab-meter-fill" data-ab-pct="'+Math.max(0,Math.min(100,Math.round(c/max*100)))+'"></span></span><span class="pn">'+c+'</span></div>';}).join('');
    $('#meta').textContent=(MODE==='demo'?'Demo data':'Live')+' · updated '+new Date().toLocaleTimeString();
  }
  function open(){$('#lock').classList.add('hidden');$('#app').classList.remove('hidden');}
  function loadDemo(){MODE='demo';ORDERS=DEMO_O.slice();LEADS=DEMO_L.slice();$('#banner').classList.remove('hidden');$('#banner').textContent='Showing demo data — connect the order system for live numbers.';open();render();}
  async function loadLive(pass){
    try{
      await window.AllBeeAdminAuth.signIn(pass,$('#pass'));if(window.AllBeeAdminAuth.isMfa())pass='';
      var ho={'x-admin-pass':pass,'Content-Type':'application/json'};
      var ro=await fetch('/api/invitation-orders',{headers:ho}); var dro=await ro.json();
      if(ro.status===401||ro.status===403){alert('Wrong passcode.');return;}
      if(!ro.ok||dro.ok!==true||dro.configured===false){alert('Orders are unavailable. Use the demo preview.');return;}
      var rl=await fetch('/api/invitation-leads',{headers:ho}); var drl=await rl.json();
      if(!rl.ok||drl.ok!==true||drl.configured===false){alert('Leads are unavailable. Use the demo preview.');return;}
      PASS=pass;MODE='live';ORDERS=dro.orders||[];LEADS=(drl&&drl.leads)||[];open();render();
    }catch(e){alert('Could not load. Try again.');}
  }
  $('#go').onclick=function(){var p=$('#pass').value;if(!p&&!window.AllBeeAdminAuth.isMfa())return;loadLive(p);};
  $('#pass').addEventListener('keydown',function(e){if(e.key==='Enter')$('#go').click();});
  $('#demoLink').onclick=loadDemo;
  $('#refresh').onclick=function(){if(MODE==='demo')render();else if(PASS||window.AllBeeAdminAuth.isMfa())loadLive(PASS);};
  $('#abAdminSignOut').onclick=function(){window.AllBeeAdminAuth.signOut();};
  if(new URLSearchParams(location.search).get('demo'))loadDemo();
  else window.AllBeeAdminAuth.prepare($('#pass')).then(function(s){if(s.mode==='totp'&&s.authenticated)loadLive('');}).catch(function(){});
})();
