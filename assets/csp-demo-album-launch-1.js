(function(){
  var viz=document.getElementById('viz');
  for(var i=0;i<28;i++){var b=document.createElement('i');b.style.animationDuration=(0.6+(i%5)*0.18).toFixed(2)+'s';b.style.animationDelay=(-(i%7)*0.12).toFixed(2)+'s';viz.appendChild(b);}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.1});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
  var pp=document.getElementById('pp');pp.addEventListener('click',function(){pp.textContent=pp.textContent==='▶'?'❚❚':'▶';});
  var target=new Date("2026-08-29T20:00:00+05:30").getTime(),cd=document.getElementById('cd');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());cd.querySelector('[data-d]').textContent=Math.floor(d/864e5);cd.querySelector('[data-h]').textContent=p(Math.floor(d%864e5/36e5));cd.querySelector('[data-m]').textContent=p(Math.floor(d%36e5/6e4));cd.querySelector('[data-s]').textContent=p(Math.floor(d%6e4/1e3));}
  tick();setInterval(tick,1000);
  document.getElementById('rsvp').addEventListener('submit',function(e){e.preventDefault();if(!this.name.value.trim()){this.name.focus();return;}document.getElementById('ok').classList.add('show');this.querySelector('button').textContent='Added ✓';});
})();
