(function(){var V={
crescent:{eyebrow:'Nikah Ceremony',vars:{'--bg':'#0a1020','--bg2':'#121a30','--gold':'#9fb6d6','--gold-l':'#dbe6f6','--soft':'#8893a8'}},
walima:{eyebrow:'Walima Feast',vars:{'--bg':'#08130e','--bg2':'#0e2018','--gold':'#c9a24b','--gold-l':'#ecd9a4','--soft':'#8fa394'}},
bismillah:{eyebrow:'Nikah &amp; Walima',vars:{'--bg':'#171210','--bg2':'#241a16','--gold':'#d9a679','--gold-l':'#f0cba8','--soft':'#a8978a'}}};
var v=new URLSearchParams(location.search).get('v');if(v&&V[v]){var d=V[v],r=document.documentElement;for(var k in d.vars)r.style.setProperty(k,d.vars[k]);document.addEventListener('DOMContentLoaded',function(){document.body.setAttribute('data-v',v);if(d.eyebrow){var e=document.querySelector('.evt');if(e)e.innerHTML=d.eyebrow;}});}})();
