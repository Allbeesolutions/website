/* Exact shared runtime extracted from repeated inline page code. */
/* navbar scroll state */
(function(){var n=document.getElementById('navbar');if(n)window.addEventListener('scroll',function(){n.classList.toggle('scrolled',window.scrollY>20)},{passive:true});
var h=document.querySelector('.hamburger'),m=document.getElementById('mobileMenu');
if(h&&m){h.addEventListener('click',function(){var o=m.classList.toggle('open');h.setAttribute('aria-expanded',String(o))});
m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');h.setAttribute('aria-expanded','false')})});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open')){m.classList.remove('open');h.setAttribute('aria-expanded','false')}});}
})();
