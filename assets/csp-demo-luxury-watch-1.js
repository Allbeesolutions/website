(function(){
  // build dial ticks
  var g=document.getElementById('ticks'),svgns="http://www.w3.org/2000/svg";
  for(var i=0;i<60;i++){var a=i*6*Math.PI/180,r1=i%5===0?80:86,r2=92;
    var l=document.createElementNS(svgns,'line');
    l.setAttribute('x1',100+r1*Math.cos(a));l.setAttribute('y1',100+r1*Math.sin(a));
    l.setAttribute('x2',100+r2*Math.cos(a));l.setAttribute('y2',100+r2*Math.sin(a));
    l.setAttribute('class','tickmk'+(i%5===0?' h':''));g.appendChild(l);}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
  var target=new Date("2026-11-07T19:00:00+05:30").getTime(),cd=document.getElementById('cd');
  function p(n){return String(n).padStart(2,'0');}
  function tick(){var d=Math.max(0,target-Date.now());cd.querySelector('[data-d]').textContent=Math.floor(d/864e5);cd.querySelector('[data-h]').textContent=p(Math.floor(d%864e5/36e5));cd.querySelector('[data-m]').textContent=p(Math.floor(d%36e5/6e4));cd.querySelector('[data-s]').textContent=p(Math.floor(d%6e4/1e3));}
  tick();setInterval(tick,1000);
  document.getElementById('rsvp').addEventListener('submit',function(e){e.preventDefault();if(!this.name.value.trim()){this.name.focus();return;}document.getElementById('ok').classList.add('show');this.querySelector('button').textContent='Confirmed ✓';});
})();
