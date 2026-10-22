(function(){
  var F=[
    {id:'AB-WED-001',n:'Royal Mandap',c:'Wedding',el:1,demo:'hindu-wedding',img:'/demo-shots/AB-WED-001.jpg',d:'Cinematic curtain-open grandeur with a love-story timeline.'},
    {id:'AB-NIK-006',n:'Makkah Night',c:'Nikah',el:1,demo:'nikah-makkah-night',img:'/demo-shots/AB-NIK-006.jpg',d:'Serene, spiritual, celestial — the Kaaba under a starlit sky.'},
    {id:'AB-WED-009',n:'Passport Journey',c:'Wedding',el:1,demo:'passport-journey',img:'/demo-shots/AB-WED-009.jpg',d:'A travel-document experience with boarding pass and visa stamps.'},
    {id:'AB-BIR-005',n:'VIP Access',c:'Birthday',el:0,demo:'birthday-vip',img:'/demo-shots/AB-BIR-005.jpg',d:'A perforated VIP pass with barcode and departures-board countdown.'},
    {id:'AB-BIZ-004',n:'Luxury Watch',c:'Business Launch',el:1,demo:'luxury-watch',img:'/demo-shots/AB-BIZ-004.jpg',d:'A Maison-grade reveal with a live ticking dial.'},
    {id:'AB-HOU-002',n:'Time Capsule',c:'Housewarming',el:0,demo:'time-capsule',img:'/demo-shots/AB-HOU-002.jpg',d:'A sealed vault that unlocks family memories as you scroll.'}
  ];
  var track=document.getElementById('fcarTrack'),dots=document.getElementById('fcarDots');if(!track)return;
  function order(t){return '/order?event='+encodeURIComponent(t.c==='Business Launch'?'Business Event':t.c)+'&template_id='+encodeURIComponent(t.id)+'&template_name='+encodeURIComponent(t.n)+'&demo='+encodeURIComponent(t.demo)+'&source='+encodeURIComponent('featured:'+t.id);}
  track.innerHTML=F.map(function(t){return '<div class="fcar-slide"><a class="fcar-lap" href="/demo/'+t.demo+'" target="_blank" rel="noopener"><div class="scr"><img loading="lazy" src="'+t.img+'" alt="'+t.n+' invitation preview" width="680" height="510"></div><div class="bs"></div></a><div class="fcar-info">'+(t.el?'<span class="el">&#10022; Elite</span><br>':'')+'<span class="ec">'+t.c+'</span><h3>'+t.n+'</h3><p>'+t.d+'</p><div class="row"><a class="btn-primary" href="/demo/'+t.demo+'" target="_blank" rel="noopener">View Demo</a><a class="btn-secondary" href="'+order(t)+'">Order Now</a></div></div></div>';}).join('');
  dots.innerHTML=F.map(function(_,i){return '<button class="'+(i===0?'on':'')+'" data-i="'+i+'" aria-label="Slide '+(i+1)+'"></button>';}).join('');
  var dotEls=[].slice.call(dots.children),cur=0,timer;
  function go(i){cur=(i+F.length)%F.length;track.scrollTo({left:track.clientWidth*cur,behavior:'smooth'});dotEls.forEach(function(d,j){d.classList.toggle('on',j===cur);});}
  document.getElementById('fcarNext').onclick=function(){go(cur+1);rest();};
  document.getElementById('fcarPrev').onclick=function(){go(cur-1);rest();};
  dots.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b){go(+b.dataset.i);rest();}});
  var st;track.addEventListener('scroll',function(){clearTimeout(st);st=setTimeout(function(){var i=Math.round(track.scrollLeft/track.clientWidth);if(i!==cur){cur=i;dotEls.forEach(function(d,j){d.classList.toggle('on',j===cur);});}},120);});
  function start(){timer=setInterval(function(){go(cur+1);},5000);}function rest(){clearInterval(timer);start();}
  start();
  track.addEventListener('mouseenter',function(){clearInterval(timer);});track.addEventListener('mouseleave',start);
})();
