(function(){
  var grid = document.getElementById('software-solutions-grid');
  var projects = window.ALLBEE_SOFTWARE_SOLUTIONS || [];
  if(!grid || !projects.length) return;

  function esc(s){
    return String(s || '').replace(/[&<>\"]/g,function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'})[c];
    });
  }

  function displayUrl(url){
    return String(url || '').replace(/^https?:\/\//,'').replace(/\/$/,'');
  }

  grid.innerHTML = projects.map(function(p){
    var tags = (p.tech || []).map(function(tag){ return '<span>'+esc(tag)+'</span>'; }).join('');
    var url = esc(p.url);
    var label = esc(p.urlLabel || 'View Product');
    return '<article class="abp-card">'
      +'<a class="abp-card-link" href="'+url+'" target="_blank" rel="noopener" aria-label="'+label+' — '+esc(p.name)+' (opens in a new tab)">'
      +'<div class="abp-preview">'
      +'<div class="abp-bar"><i></i><i></i><i></i><span class="abp-url">'+esc(displayUrl(p.url))+'</span></div>'
      +'<div class="abp-shot abp-shot--cover"><img src="'+esc(p.img)+'" alt="'+esc(p.name)+' preview" width="'+esc(p.imgWidth || 900)+'" height="'+esc(p.imgHeight || 506)+'" loading="lazy" decoding="async"></div>'
      +'</div>'
      +'<div class="abp-body">'
      +'<div class="abp-tags">'+tags+'</div>'
      +'<h3 class="abp-name">'+esc(p.name)+'</h3>'
      +'<p class="abp-desc">'+esc(p.summary)+'</p>'
      +'<span class="abp-visit">'+label+' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></span>'
      +'</div></a></article>';
  }).join('');
})();
