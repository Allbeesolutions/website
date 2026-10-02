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

/* Global AllBee theme: footer toggle controls the whole site and persists. */
(function(){
  function initSiteThemeControl(){
    var footer=document.querySelector('.ab-footer');
    if(!footer) return;
    function current(){
      return (window.AllBeeTheme&&window.AllBeeTheme.get)?window.AllBeeTheme.get():(document.documentElement.getAttribute('data-site-theme')||'light');
    }
    function applyUI(theme){
      footer.setAttribute('data-footer-theme',theme);
      var btn=footer.querySelector('.footer-theme-button');
      if(btn){
        btn.setAttribute('aria-pressed',String(theme==='dark'));
        btn.setAttribute('aria-label',theme==='dark'?'Use light site theme':'Use dark site theme');
      }
    }
    applyUI(current());
    var btn=footer.querySelector('.footer-theme-button');
    if(btn) btn.addEventListener('click',function(){
      var next=window.AllBeeTheme&&window.AllBeeTheme.toggle?window.AllBeeTheme.toggle():(current()==='dark'?'light':'dark');
      if(!window.AllBeeTheme){
        document.documentElement.setAttribute('data-site-theme',next);
        document.documentElement.style.colorScheme=next;
      }
      applyUI(next);
    });
    document.addEventListener('allbee:themechange',function(e){applyUI(e.detail&&e.detail.theme==='dark'?'dark':'light');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSiteThemeControl);else initSiteThemeControl();
})();
