(function(){var V={
confetti:{vars:{'--bg':'#141019','--pink':'#ff5e8a','--cyan':'#ff9a3d','--yellow':'#ffe34d'}},
gold:{vars:{'--bg':'#0c0b10','--pink':'#e8c45a','--cyan':'#caa24b','--yellow':'#f0d98a','--ink':'#f4eede'}},
kids:{vars:{'--bg':'#16202c','--pink':'#ff8fb3','--cyan':'#7fd8e8','--yellow':'#ffe39a'}}};
var v=new URLSearchParams(location.search).get('v');if(v&&V[v]){var d=V[v],r=document.documentElement;for(var k in d.vars)r.style.setProperty(k,d.vars[k]);document.addEventListener('DOMContentLoaded',function(){document.body.setAttribute('data-v',v);});}})();
