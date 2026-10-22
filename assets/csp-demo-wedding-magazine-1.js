(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
  var target=new Date("2026-11-08T19:00:00+05:30").getTime(),cd=document.getElementById('cd');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());cd.querySelector('[data-d]').textContent=Math.floor(d/864e5);cd.querySelector('[data-h]').textContent=p(Math.floor(d%864e5/36e5));cd.querySelector('[data-m]').textContent=p(Math.floor(d%36e5/6e4));}
  tick();setInterval(tick,1000);
  document.getElementById('rsvpForm').addEventListener('submit',function(e){e.preventDefault();if(!this.name.value.trim()){this.name.focus();return;}document.getElementById('ok').classList.add('show');this.querySelector('button').textContent='Submitted ✓';});
})();
