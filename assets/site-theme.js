(function(){
  'use strict';
  var KEY='allbee-site-theme-v1';
  var theme='light';
  try{theme=localStorage.getItem(KEY)||'light';}catch(e){}
  if(theme!=='dark') theme='light';
  document.documentElement.setAttribute('data-site-theme',theme);
  document.documentElement.style.colorScheme=theme;
  window.AllBeeTheme={
    key:KEY,
    get:function(){return document.documentElement.getAttribute('data-site-theme')||'light';},
    set:function(next){
      next=next==='dark'?'dark':'light';
      document.documentElement.setAttribute('data-site-theme',next);
      document.documentElement.style.colorScheme=next;
      try{localStorage.setItem(KEY,next);}catch(e){}
      document.dispatchEvent(new CustomEvent('allbee:themechange',{detail:{theme:next}}));
      return next;
    },
    toggle:function(){return this.set(this.get()==='dark'?'light':'dark');}
  };
})();
