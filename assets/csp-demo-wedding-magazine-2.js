window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-TEX4FWGJFQ');
(function(){var CFG={"slug":"wedding-magazine","def":{"id":"AB-WED-006","name":"The Editorial","event":"Wedding"},"variants":{}};
var v=new URLSearchParams(location.search).get('v')||'';
var t=CFG.variants[v]||CFG.def;var enc=encodeURIComponent;
var u='/order?event='+enc(t.event||'')+'&template_id='+enc(t.id||'')+'&template_name='+enc(t.name||'')+'&demo='+enc(CFG.slug)+(v?('&v='+enc(v)):'')+'&source='+enc('demo:'+CFG.slug);
var enq='/invitation?t='+enc(t.id||'')+'&tn='+enc(t.name||'')+'&demo='+enc(CFG.slug)+'#enquiry';
var wa='https://wa.me/918903607506?text='+enc('Hi AllBee! I am interested in template '+(t.id||'')+' '+(t.name||CFG.slug)+'. Please contact me.');
function ga(n){try{if(window.gtag)gtag('event',n,{template_id:t.id,template_name:t.name,demo:CFG.slug,variant:v||'default'});}catch(e){}}
[].forEach.call(document.querySelectorAll('[data-abx-order]'),function(a){a.href=u;a.addEventListener('click',function(){ga('order_start');});});
[].forEach.call(document.querySelectorAll('[data-abx-enq]'),function(a){a.href=enq;a.addEventListener('click',function(){ga('enquiry_click');});});
[].forEach.call(document.querySelectorAll('[data-abx-wa]'),function(a){a.href=wa;a.addEventListener('click',function(){ga('whatsapp_click');});});
var idl=document.querySelector('[data-abx-id]');if(idl)idl.textContent=(t.id?('Template '+t.id):'')+(t.name?('  ·  '+t.name):'');
ga('demo_open');
})();
