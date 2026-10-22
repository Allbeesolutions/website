(function(){
  function fire(name,params){try{if(typeof window.gtag==='function')window.gtag('event',name,params||{});}catch(e){}}
  document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var h=a.getAttribute('href')||'';var label=(a.textContent||'').trim().slice(0,80);if(h.indexOf('/invitation-samples')===0)fire('invitation_catalog_view',{label:label});else if(h.indexOf('/order')===0)fire('invitation_order_start',{label:label,href:h});else if(h.indexOf('/demo/')===0)fire('invitation_demo_open',{label:label,href:h});else if(h.indexOf('#price-h')===0)fire('invitation_pricing_view',{label:label});});
  var form=document.getElementById('invEnquiryForm');if(form)form.addEventListener('submit',function(){fire('invitation_help_submit',{event_type:(form.querySelector('[name=event_type]')||{}).value||''});});
})();
