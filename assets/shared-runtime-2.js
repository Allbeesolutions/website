/* Exact shared runtime extracted from repeated inline page code. */
/*nav-dd-js*/
(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  ready(function(){
    var dds = document.querySelectorAll('#navbar .nav-dd');
    function closeAll(except){
      dds.forEach(function(o){ if(o!==except){ o.removeAttribute('data-open'); var b=o.querySelector('.nav-dd-arrow'); if(b) b.setAttribute('aria-expanded','false'); } });
    }
    dds.forEach(function(dd){
      var arrow = dd.querySelector('.nav-dd-arrow');
      if(!arrow) return;
      arrow.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var open = dd.getAttribute('data-open')==='true';
        closeAll(dd);
        if(open){ dd.removeAttribute('data-open'); arrow.setAttribute('aria-expanded','false'); }
        else { dd.setAttribute('data-open','true'); arrow.setAttribute('aria-expanded','true'); }
      });
      // keyboard: CSS :focus-within opens the menu — keep aria in sync for screen readers
      dd.addEventListener('focusin', function(){ arrow.setAttribute('aria-expanded','true'); });
      dd.addEventListener('focusout', function(e){ if(!dd.contains(e.relatedTarget)){ dd.removeAttribute('data-open'); arrow.setAttribute('aria-expanded','false'); } });
    });
    document.addEventListener('click', function(e){ if(!e.target.closest('#navbar .nav-dd')) closeAll(null); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeAll(null); });
    // Mobile accordion — arrow toggles, link navigates
    document.querySelectorAll('#mobileMenu .m-acc-arrow').forEach(function(t){
      t.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var open = t.getAttribute('aria-expanded')==='true';
        t.setAttribute('aria-expanded', String(!open));
      });
    });
  });
})();

/* Premium global footer: theme state is footer-local and persistent. */
(function(){
  function initFooterTheme(){
    var footer=document.querySelector('.ab-footer'); if(!footer) return;
    var key='allbee-footer-theme-v1', saved='light';
    try{saved=localStorage.getItem(key)||'light';}catch(e){}
    if(saved!=='dark') saved='light';
    function apply(theme){
      footer.setAttribute('data-footer-theme',theme);
      var btn=footer.querySelector('.footer-theme-button');
      if(btn){btn.setAttribute('aria-pressed',String(theme==='dark'));btn.setAttribute('aria-label',theme==='dark'?'Use light footer theme':'Use dark footer theme');}
      var label=footer.querySelector('.footer-theme-label'); if(label) label.textContent=theme==='dark'?'Dark':'Light';
    }
    apply(saved);
    var btn=footer.querySelector('.footer-theme-button'); if(btn) btn.addEventListener('click',function(){var next=footer.getAttribute('data-footer-theme')==='dark'?'light':'dark';try{localStorage.setItem(key,next);}catch(e){}apply(next);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initFooterTheme);else initFooterTheme();
})();
