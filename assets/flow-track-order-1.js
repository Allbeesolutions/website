(function(){
  var STAGES=['Order Placed','Payment Confirmed','Details Submitted','Designing','First Preview Ready','Revision Requested','Revision In Progress','Final Approval','Delivered'];
  var DESC={'Order Placed':'Your order has been received.','Payment Confirmed':'Payment has been confirmed.','Details Submitted':'Your design brief is with our team.','Designing':'Our design team is crafting your invitation.','First Preview Ready':'Your first personalised preview is ready.','Revision Requested':'Your requested changes have been recorded.','Revision In Progress':'We are applying the requested changes.','Final Approval':'Your final approval is pending.','Delivered':'Your invitation is ready to share.'};
  var form=document.getElementById('trackForm'),err=document.getElementById('err'),result=document.getElementById('result'),btn=document.getElementById('goBtn');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  function showErr(m){err.textContent=m;err.classList.add('show');}
  function deliveryHtml(d){if(!d)return'';var parts=String(d).split(/[\s,]+/).filter(Boolean);if(!parts.length)return'';
    var safe=parts.filter(function(u){try{var parsed=new URL(u,location.origin);return parsed.protocol==='https:' || (parsed.origin===location.origin && parsed.protocol==='http:');}catch(e){return false;}});
    if(!safe.length)return'';
    return '<div class="deliver"><h3>Your downloads</h3>'+safe.map(function(u,i){return '<a href="'+esc(new URL(u,location.origin).href)+'" target="_blank" rel="noopener noreferrer">Open '+(safe.length>1?('file '+(i+1)):'invitation')+' →</a>';}).join('')+'</div>';}
  function render(o){
    var idx=STAGES.indexOf(o.status); if(idx<0) idx=0;
    var tl=STAGES.map(function(s,i){var cls=i<idx?'done':(i===idx?'cur':'todo');var sub=i===idx?DESC[s]:(i<idx?'':'');return '<li class="'+cls+'"><span class="dot"></span><span class="st">'+s+'</span>'+(sub?'<span class="sd">'+esc(sub)+'</span>':'')+'</li>';}).join('');
    result.innerHTML=
      '<div class="ohead"><div><div class="oid">'+esc(o.id)+'</div><div class="when">Ordered '+esc(o.date||'—')+'</div></div><span class="badge">'+esc(o.status||'New')+'</span></div>'+
      '<div class="kv">'+
        '<div><div class="k">Event</div><div class="v">'+esc(o.event_type||'—')+'</div></div>'+
        '<div><div class="k">Package</div><div class="v">'+esc(o.package||'—')+' '+esc(o.invitation_type||'')+'</div></div>'+
        '<div><div class="k">Template</div><div class="v">'+esc(o.template_name||'—')+'</div></div>'+
        '<div><div class="k">Last update</div><div class="v">'+esc((o.updated||'').slice(0,10)||o.date||'—')+'</div></div>'+
      '</div>'+
      '<ul class="timeline">'+tl+'</ul>'+
      (idx>=3?deliveryHtml(o.delivery):'')+
      '<div class="help" style="margin-top:18px">Questions about this order? <a href="https://wa.me/918903607506?text='+encodeURIComponent('Hi AllBee, about order '+o.id)+'" target="_blank" rel="noopener">WhatsApp us →</a></div>';
    result.classList.add('show');
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();err.classList.remove('show');
    var oid=document.getElementById('oid').value.trim(),mob=document.getElementById('mob').value.trim();
    if(!oid||!mob){showErr('Please enter both your Order ID and mobile number.');return;}
    btn.disabled=true;btn.textContent='Tracking…';
    fetch('/api/track-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:oid,mobile:mob})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.ok&&d.order){render(d.order);}
        else if(d.ok&&d.configured===false){ showErr('Live order tracking is temporarily unavailable. Please contact us with your payment reference.'); }
        else { showErr('We couldn’t find an order with that ID and mobile number. Please check and try again, or WhatsApp us.'); }
      })
      .catch(function(){showErr('Something went wrong. Please try again in a moment.');})
      .finally(function(){btn.disabled=false;btn.textContent='Track Order';});
  });
})();
