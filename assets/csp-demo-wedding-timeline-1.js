(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.2});
  document.querySelectorAll('.fade').forEach(function(el){io.observe(el);});
  var chapters=document.querySelectorAll('[data-ch]'),rail=document.getElementById('rail');
  chapters.forEach(function(){var d=document.createElement('div');d.className='dot';rail.appendChild(d);});
  var dots=rail.querySelectorAll('.dot');
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=[].indexOf.call(chapters,e.target);dots.forEach(function(d,j){d.classList.toggle('on',j===i);});}});},{threshold:.6});
  chapters.forEach(function(c){io2.observe(c);});
  var target=new Date("2026-10-18T18:00:00+05:30").getTime(),cd=document.getElementById('cd');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());cd.querySelector('[data-d]').textContent=Math.floor(d/864e5);cd.querySelector('[data-h]').textContent=p(Math.floor(d%864e5/36e5));cd.querySelector('[data-m]').textContent=p(Math.floor(d%36e5/6e4));cd.querySelector('[data-s]').textContent=p(Math.floor(d%6e4/1e3));}
  tick();setInterval(tick,1000);
  document.getElementById('rsvp').addEventListener('submit',function(e){e.preventDefault();if(!this.name.value.trim()){this.name.focus();return;}document.getElementById('ok').classList.add('show');this.querySelector('button').textContent='Sent ✓';});
})();
