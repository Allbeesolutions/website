(function(){
 const hero=document.querySelector('.inv-marquee-hero');
 const toggle=hero.querySelector('.inv-marquee-toggle');
 toggle.addEventListener('click',function(){
  const paused=toggle.getAttribute('aria-pressed')!=='true';
  toggle.setAttribute('aria-pressed',String(paused));
  hero.classList.toggle('is-paused',paused);
  toggle.textContent=paused?'Resume previews':'Pause previews';
 });
})();
