(function(){
  var RT=Date.now(),rating=0;
  var q=new URLSearchParams(location.search);
  var stars=document.getElementById('stars').children;
  function paint(n){for(var i=0;i<stars.length;i++){stars[i].classList.toggle('on',i<n);stars[i].setAttribute('aria-checked',i===n-1?'true':'false');}}
  for(var i=0;i<stars.length;i++){(function(i){function choose(){rating=i+1;paint(rating);}stars[i].addEventListener('click',choose);stars[i].addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});stars[i].addEventListener('mouseover',function(){for(var j=0;j<stars.length;j++)stars[j].classList.toggle('hov',j<=i);});stars[i].addEventListener('mouseout',function(){for(var j=0;j<stars.length;j++)stars[j].classList.remove('hov');});})(i);}
  var form=document.getElementById('rvForm'),err=document.getElementById('err'),go=document.getElementById('go');
  form.addEventListener('submit',function(e){
    e.preventDefault();err.classList.remove('show');
    if(form._gotcha.value)return;
    if(!rating){err.textContent='Please tap a star rating.';err.classList.add('show');return;}
    if(!form.checkValidity()){form.reportValidity();return;}
    var f=new FormData(form);
    var data={action:'submit',name:f.get('name'),city:f.get('city'),event_type:f.get('event_type'),rating:rating,review:f.get('review'),order_id:q.get('order')||'',template_id:q.get('t')||'',render_ts:RT,_gotcha:''};
    go.disabled=true;go.textContent='Submitting…';
    fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().catch(function(){return{ok:r.ok};});})
      .then(function(res){if(res&&res.ok&&res.configured===true){document.getElementById('card').style.display='none';document.getElementById('ok').classList.add('show');window.scrollTo({top:0});}else{err.textContent='Please check your details and try again.';err.classList.add('show');go.disabled=false;go.textContent='Submit Review';}})
      .catch(function(){err.textContent='Network error. Please try again.';err.classList.add('show');go.disabled=false;go.textContent='Submit Review';});
  });
})();
