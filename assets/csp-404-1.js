(function(){
  var cv=document.getElementById('abFireCanvas'); if(!cv||!cv.getContext) return;
  var ctx=cv.getContext('2d'); var DPR=Math.min(window.devicePixelRatio||1,2);
  var W=0,H=0,running=false,raf=0;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  var palette=[[255,236,170],[255,201,92],[250,162,36],[238,118,20],[198,68,10],[120,32,5]];
  function sprite(c,soft){var s=64,off=document.createElement('canvas');off.width=off.height=s;
    var o=off.getContext('2d');var g=o.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',1)');
    g.addColorStop(soft?.35:.4,'rgba('+c[0]+','+c[1]+','+c[2]+',.4)');
    g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');o.fillStyle=g;o.fillRect(0,0,s,s);return off;}
  var sprites=palette.map(function(c){return sprite(c,false);});
  var coreSprite=sprite([255,247,224],true);

  var body=[],licks=[],embers=[];
  function rnd(a,b){return a+Math.random()*(b-a);}
  function resize(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;
    cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);}
  window.addEventListener('resize',resize);resize();

  function spawnBody(){body.push({x:rnd(-30,W+30),y:H+rnd(0,18),vx:rnd(-.2,.2),vy:-rnd(1.2,2.4),
    life:0,max:rnd(60,108),size:rnd(34,68),wob:rnd(0,6.28),wsp:rnd(.015,.045)});}
  function spawnLick(){licks.push({x:rnd(0,W),y:H+rnd(-4,8),vx:rnd(-.35,.35),vy:-rnd(3.2,5.2),
    life:0,max:rnd(46,82),size:rnd(14,30),wob:rnd(0,6.28),wsp:rnd(.05,.11),curl:rnd(-.05,.05)});}
  function spawnEmber(){embers.push({x:rnd(0,W),y:H-rnd(0,40),vx:rnd(-.5,.5),vy:-rnd(1.8,4.2),
    life:0,max:rnd(90,200),r:rnd(.7,2.2),tw:rnd(0,6.28)});}

  function drawSet(arr,bm){for(var i=arr.length-1;i>=0;i--){var p=arr[i];p.life++;
    if(p.life>=p.max){arr.splice(i,1);continue;}var t=p.life/p.max;
    p.vy*=0.987;p.vy-=bm?0.012:0.02;p.wob+=p.wsp;
    p.x+=p.vx+Math.sin(p.wob)*(bm?0.5:0.9)+(p.curl?p.curl*p.life*0.04:0);p.y+=p.vy;
    var idx=Math.min(palette.length-1,Math.floor(t*palette.length));
    var sz=p.size*(1-(bm?0.5:0.7)*t);var fade=(t<0.1?t/0.1:1-(t-0.1)/0.9);
    var a=fade*(bm?0.20:0.17);if(a<=0)continue;ctx.globalAlpha=a;
    ctx.drawImage(sprites[idx],p.x-sz/2,p.y-sz/2,sz,sz);}}

  function frame(){
    ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    var pulse=0.5+0.5*Math.sin(Date.now()/430);
    var bg=ctx.createLinearGradient(0,H,0,H-H*0.55);
    bg.addColorStop(0,'rgba(255,120,24,'+(0.11+0.05*pulse)+')');
    bg.addColorStop(.5,'rgba(240,90,14,'+(0.04+0.02*pulse)+')');
    bg.addColorStop(1,'rgba(240,90,14,0)');ctx.fillStyle=bg;ctx.fillRect(0,H*0.45,W,H*0.55);
    if(!reduce){var nb=Math.max(4,Math.round(W/30)),nl=Math.max(3,Math.round(W/40));
      for(var i=0;i<nb;i++)spawnBody();for(var j=0;j<nl;j++)spawnLick();
      if(Math.random()<0.85)spawnEmber();}
    drawSet(body,true);drawSet(licks,false);
    for(var e=embers.length-1;e>=0;e--){var m=embers[e];m.life++;
      if(m.life>=m.max){embers.splice(e,1);continue;}var et=m.life/m.max;
      m.vy*=0.992;m.x+=m.vx+Math.sin((m.tw+=0.06))*0.6;m.y+=m.vy;
      var ea=(1-et)*(0.55+0.45*Math.sin(m.life*0.45));if(ea<=0)continue;
      var sz=m.r*2.6;ctx.globalAlpha=Math.max(0,ea);ctx.drawImage(coreSprite,m.x-sz/2,m.y-sz/2,sz,sz);}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    var grd=ctx.createLinearGradient(0,H,0,H-50);
    grd.addColorStop(0,'rgba(240,184,0,0.95)');grd.addColorStop(1,'rgba(240,184,0,0)');
    ctx.fillStyle=grd;ctx.fillRect(0,H-50,W,50);
    if(running)raf=requestAnimationFrame(frame);
  }
  function start(){if(running||reduce)return;running=true;raf=requestAnimationFrame(frame);}
  function stop(){running=false;if(raf)cancelAnimationFrame(raf);}

  if(reduce){ctx.globalCompositeOperation='lighter';
    var g=ctx.createLinearGradient(0,H,0,0);
    g.addColorStop(0,'rgba(255,140,36,.55)');g.addColorStop(.5,'rgba(235,110,18,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);return;}

  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){e.isIntersecting?start():stop();});},{threshold:0.02});
    io.observe(cv);
  } else { start(); }
})();
