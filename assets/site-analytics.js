(function(){
  'use strict';
  var GA='G-TEX4FWGJFQ';
  window.dataLayer=window.dataLayer||[];
  if(typeof window.gtag!=='function') window.gtag=function(){window.dataLayer.push(arguments);};
  if(!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')){
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);
    window.gtag('js',new Date());window.gtag('config',GA,{anonymize_ip:true});
  }
  function track(name,params){try{window.gtag('event',name,params||{});}catch(_){}}
  function label(el){return ((el.getAttribute('aria-label')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80));}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a,button');if(!a)return;
    var href=(a.getAttribute('href')||'').trim();
    if(href.indexOf('wa.me')!==-1) track('whatsapp_click',{page_path:location.pathname,link_text:label(a)});
    if(a.matches('[data-open-lead],.btn-primary,.nav-cta,.hero-cta')||/quote|enquir|counsel|start a project|get started/i.test(label(a)))
      track('cta_click',{page_path:location.pathname,link_text:label(a),link_url:href.slice(0,120)});
    if(href.indexOf('/order')===0) track('order_start_click',{page_path:location.pathname,link_url:href.slice(0,120)});
  },{passive:true});
  var started=new WeakSet();
  document.addEventListener('focusin',function(e){
    var f=e.target.closest&&e.target.closest('form');if(!f||started.has(f))return;
    if(e.target.matches('input,select,textarea')){started.add(f);track('form_start',{page_path:location.pathname,form_id:f.id||f.getAttribute('name')||'form'});}
  });
  document.addEventListener('submit',function(e){
    var f=e.target;if(!(f instanceof HTMLFormElement))return;
    track('form_submit',{page_path:location.pathname,form_id:f.id||f.getAttribute('name')||'form'});
  });
  window.AllBeeAnalytics={track:track};
})();
