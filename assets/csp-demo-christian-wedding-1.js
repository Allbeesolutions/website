(function(){var V={
golden:{vars:{'--paper':'#f7f1e4','--ink':'#36301f','--soft':'#9a7b3f','--line':'#e6dcc6'}}};
var v=new URLSearchParams(location.search).get('v');if(v&&V[v]){var d=V[v],r=document.documentElement;for(var k in d.vars)r.style.setProperty(k,d.vars[k]);document.addEventListener('DOMContentLoaded',function(){document.body.setAttribute('data-v',v);});}})();
