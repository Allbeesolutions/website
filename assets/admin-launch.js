(function(){
  var ITEMS=[
    {k:'razorpay',h:'Razorpay Live Ready',fix:'Set <code>RAZORPAY_KEY_ID</code> + <code>RAZORPAY_KEY_SECRET</code> (live keys) to take online payments. Until then orders are captured for a manual WhatsApp payment link.'},
    {k:'webhook',h:'Webhook Ready',fix:'Set <code>RAZORPAY_WEBHOOK_SECRET</code> and add the webhook in Razorpay → Webhooks for payment.captured / payment.failed / refund.* pointing to <code>/api/order-webhook</code>.'},
    {k:'appsScript',h:'Apps Script Ready',fix:'Deploy <code>docs/lead-apps-script.gs</code> as a Web App and set <code>LEAD_APPS_SCRIPT_URL</code> + <code>LEAD_SHARED_SECRET</code>. Re-deploy after any edit.'},
    {k:'crm',h:'CRM Ready',fix:'Set <code>ADMIN_PASSCODE</code> to unlock the live Leads/Orders dashboards.'},
    {k:'tracking',h:'Tracking Ready',fix:'Customer order tracking needs the Apps Script data layer (same as above).'}
  ];
  function render(checks,ready){
    var done=ITEMS.filter(function(i){return checks[i.k];}).length;
    document.getElementById('bar').style.width=Math.round(done/ITEMS.length*100)+'%';
    var st=document.getElementById('status');
    st.className='status '+(ready?'go':'nogo');
    st.textContent=ready?'✓ GO — all systems ready':('● '+done+' of '+ITEMS.length+' ready');
    document.getElementById('list').innerHTML=ITEMS.map(function(i){
      var ok=!!checks[i.k];
      return '<div class="item '+(ok?'ready':'pending')+'"><div class="ic">'+(ok?'✓':'!')+'</div><div class="b"><h3>'+i.h+'</h3><div class="st">'+(ok?'Ready':'Not configured')+'</div>'+(ok?'':'<div class="fix">'+i.fix+'</div>')+'</div></div>';
    }).join('');
  }
  fetch('/api/health',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){render(d.checks||{},d.ready);})
    .catch(function(){render({},false);document.getElementById('status').textContent='Could not reach /api/health';});
})();
