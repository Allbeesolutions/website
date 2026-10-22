/* Gold particles: nav-link hover (falling) + footer social (upward burst) */
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- nav links: continuous gold sparks falling on hover/focus ----
  (function(){
    function spawn(host){
      var s=document.createElement('span'); s.className='nav-spark';
      s.style.setProperty('--x',(15+Math.random()*70)+'%');
      s.style.setProperty('--dx',((Math.random()-0.5)*30).toFixed(0)+'px');
      s.style.setProperty('--dy',(50+Math.random()*30).toFixed(0)+'px');
      var dur=(1.0+Math.random()*0.7).toFixed(2);
      s.style.setProperty('--d',dur+'s');
      host.appendChild(s);
      setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); }, dur*1000+60);
    }
    document.querySelectorAll('#navbar .nav-links a, #navbar .nav-cta-btn').forEach(function(link){
      var iv=null;
      function start(){ if(iv) return; spawn(link); iv=setInterval(function(){ spawn(link); },90); }
      function stop(){ if(iv){ clearInterval(iv); iv=null; } }
      link.addEventListener('mouseenter',start);
      link.addEventListener('mouseleave',stop);
      link.addEventListener('focus',start);
      link.addEventListener('blur',stop);
    });
  })();

  // ---- footer social icons: 7-spark upward burst on hover/focus ----
  (function(){
    document.querySelectorAll('.footer-social a').forEach(function(icon){
      var active=false;
      function burst(){
        if(active) return; active=true;
        for(var i=0;i<7;i++){ (function(j){ setTimeout(function(){
          var s=document.createElement('span'); s.className='foot-spark';
          s.style.setProperty('--dx',((Math.random()-0.5)*36).toFixed(0)+'px');
          s.style.setProperty('--dy',(-(40+Math.random()*40)).toFixed(0)+'px');
          icon.appendChild(s);
          setTimeout(function(){ if(s.parentNode) s.parentNode.removeChild(s); },1000);
        }, j*50); })(i); }
        setTimeout(function(){ active=false; },350);
      }
      icon.addEventListener('mouseenter',burst);
      icon.addEventListener('focus',burst);
    });
  })();
})();
