/* ── AllBee Invitations — enquiry form → /api/invitation-enquiry ── */
(function(){
  var form=document.getElementById('invEnquiryForm');
  var toast=document.getElementById('invToast');
  var RENDER_TS=Date.now();              // time-trap baseline for spam protection
  function showToast(msg){ if(!toast)return; var s=toast.querySelector('.inv-toast-msg'); if(s)s.textContent=msg; toast.classList.add('show'); setTimeout(function(){toast.classList.remove('show');},4500); }
  if(form){
    var btn=form.querySelector('button[type="submit"]');
    var btnHTML=btn?btn.innerHTML:'';
    var submitting=false;
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(e.isTrusted===false || submitting){ return; }
      if(form.querySelector('[name="_gotcha"]') && form.querySelector('[name="_gotcha"]').value){ return; }
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var fd=new FormData(form);
      var aq=new URLSearchParams(location.search);
      var aDemo=aq.get('demo')||'';
      var data={ name:fd.get('name'), mobile:fd.get('mobile'), email:fd.get('email'),
        event_type:fd.get('event_type'), event_date:fd.get('event_date'),
        interested_in:fd.getAll('interested_in'), notes:fd.get('notes'),
        template_id:aq.get('t')||'', template_name:aq.get('tn')||'', demo:aDemo,
        source: aDemo?('demo:'+aDemo):'/invitation', render_ts:RENDER_TS, _gotcha:fd.get('_gotcha')||'' };
      submitting=true;
      if(btn){ btn.disabled=true; btn.textContent='Sending…'; }
      fetch('/api/invitation-enquiry',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
        .then(function(r){ return r.json().catch(function(){ return {ok:r.ok}; }); })
        .then(function(res){
          if(res && res.ok && res.captured === true && res.lead_id){ showToast('Request saved. Reference: '+res.lead_id+'. We will contact you soon.'); form.reset(); }
          else { showToast('Sorry, something went wrong. Please try again or WhatsApp us.'); }
        })
        .catch(function(){ showToast('Network error. Please try again or WhatsApp us.'); })
        .finally(function(){ submitting=false; if(btn){ btn.disabled=false; btn.innerHTML=btnHTML; } });
    });
  }
  document.querySelectorAll('[data-scroll="enquiry"]').forEach(function(b){
    b.addEventListener('click',function(e){ e.preventDefault(); var t=document.getElementById('enquiry'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); });
  });
})();
