(function(){
  // place rivets in a circle
  var rv=document.getElementById('rivets');
  for(var i=0;i<12;i++){var a=i*30*Math.PI/180;var d=document.createElement('i');d.style.transform='translate(-50%,-50%) translate('+(Math.cos(a)*46)+'%,'+(Math.sin(a)*46)+'%)';rv.appendChild(d);}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.14});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
  document.getElementById('openbtn').addEventListener('click',function(){document.body.classList.add('opened');this.textContent='✓ Opened — scroll inside';var c=document.getElementById('cd');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});});
  var target=new Date("2026-09-12T11:00:00+05:30").getTime(),cd=document.getElementById('cd');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());cd.querySelector('[data-d]').textContent=Math.floor(d/864e5);cd.querySelector('[data-h]').textContent=p(Math.floor(d%864e5/36e5));cd.querySelector('[data-m]').textContent=p(Math.floor(d%36e5/6e4));cd.querySelector('[data-s]').textContent=p(Math.floor(d%6e4/1e3));}
  tick();setInterval(tick,1000);
  document.getElementById('rsvp').addEventListener('submit',function(e){e.preventDefault();if(!this.name.value.trim()){this.name.focus();return;}document.getElementById('ok').classList.add('show');this.querySelector('button').textContent='Added ✓';});
})();
