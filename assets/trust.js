/* AllBee — shared trust components renderer.
 * Fill the CONFIG below to populate; every block AUTO-HIDES while its data is
 * empty, so NOTHING fake ever ships. Mount points in HTML:
 *   <div class="tz" data-trust="logos|rating|cases|badges|authority|reviews" data-trust-title="..."></div>
 *
 * To populate later: add client logos to /assets/clients/, case images to
 * /assets/cases/, then fill the arrays/objects below. See docs/trust-assets-plan.md.
 */
window.AllBeeTrust = window.AllBeeTrust || {
  /* Google / third-party rating — set when you have a real public profile. */
  rating: null, // e.g. { score: 4.9, count: 120, source: 'Google', url: 'https://g.page/...' }

  /* Client logos — drop files in /assets/clients/ and list them here. */
  clients: [], // e.g. [{ name:'Acme', logo:'/assets/clients/acme.png' }]

  /* Case studies / recent work — real projects with an outcome. */
  caseStudies: [], // e.g. [{ title:'E-commerce site', client:'X Traders', result:'+38% enquiries', img:'/assets/cases/x.jpg', url:'#' }]

  /* Authority numbers — students/businesses already true; fill the rest when available. */
  authority: { students: '500+', businesses: '50+', projects: '', years: '', gst: '', udyam: '' },

  /* Factual trust badges (NOT proof claims) — safe to show now. */
  badges: ['On-time delivery', 'WhatsApp support', 'Secure & mobile-first', 'Based in Nagore, Tamil Nadu'],

  reviewsApi: '/api/reviews', /* approved customer reviews feed (already live) */
};

(function () {
  var T = window.AllBeeTrust;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }
  function hide(el){ if(el && el.parentNode) el.parentNode.removeChild(el); }
  function head(el, dflt){ var t=el.getAttribute('data-trust-title')||dflt; var eb=el.getAttribute('data-trust-eyebrow')||''; return (eb?'<div class="tz-eyebrow">'+esc(eb)+'</div>':'')+(t?'<div class="tz-title">'+esc(t)+'</div>':''); }
  function stars(n){ n=Math.max(1,Math.min(5,Math.round(n||5))); return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n); }

  function render(el){
    var type=el.getAttribute('data-trust');
    if(type==='logos'){
      if(!T.clients||!T.clients.length) return hide(el);
      el.innerHTML='<div class="tz-wrap">'+head(el,'Trusted by businesses across Tamil Nadu')+'<div class="tz-logos">'+
        T.clients.map(function(c){return '<img src="'+esc(c.logo)+'" alt="'+esc(c.name)+'" loading="lazy">';}).join('')+'</div></div>';
    }
    else if(type==='rating'){
      if(!T.rating) return hide(el);
      var r=T.rating, inner='<span class="stars">'+stars(r.score)+'</span><span class="score">'+esc(r.score)+'/5</span><span class="meta">from '+esc(r.count)+'+ reviews'+(r.source?' on '+esc(r.source):'')+'</span>';
      el.innerHTML='<div class="tz-wrap">'+(r.url?'<a class="tz-rating" href="'+esc(r.url)+'" target="_blank" rel="noopener">'+inner+'</a>':'<div class="tz-rating">'+inner+'</div>')+'</div>';
    }
    else if(type==='cases'){
      if(!T.caseStudies||!T.caseStudies.length) return hide(el);
      el.innerHTML='<div class="tz-wrap">'+head(el,'Recent Work')+'<div class="tz-cases">'+
        T.caseStudies.map(function(c){var tag=c.url?'a':'div';var href=c.url?(' href="'+esc(c.url)+'"'):'';return '<'+tag+' class="tz-case"'+href+'><span class="img" style="background-image:url('+esc(c.img||'')+')"></span><span class="b"><span class="ct">'+esc(c.client||'')+'</span><h3>'+esc(c.title||'')+'</h3>'+(c.result?'<span class="result">'+esc(c.result)+'</span>':'')+'</span></'+tag+'>';}).join('')+'</div></div>';
    }
    else if(type==='badges'){
      if(!T.badges||!T.badges.length) return hide(el);
      el.innerHTML='<div class="tz-wrap"><div class="tz-badges">'+
        T.badges.map(function(b){return '<span><span class="ck">✓</span> '+esc(b)+'</span>';}).join('')+'</div></div>';
    }
    else if(type==='authority'){
      var a=T.authority||{}, items=[];
      if(a.businesses) items.push([a.businesses,'Businesses Served']);
      if(a.students) items.push([a.students,'Students Trained']);
      if(a.projects) items.push([a.projects,'Projects Delivered']);
      if(a.years) items.push([a.years,'Years Experience']);
      if(a.gst) items.push(['GST','Registered · '+a.gst]);
      if(a.udyam) items.push(['MSME','Udyam · '+a.udyam]);
      if(!items.length) return hide(el);
      el.innerHTML='<div class="tz-wrap">'+head(el,'')+'<div class="tz-auth">'+
        items.map(function(i){return '<div class="item"><div class="v">'+esc(i[0])+'</div><div class="l">'+esc(i[1])+'</div></div>';}).join('')+'</div></div>';
    }
    else if(type==='reviews'){
      fetch(T.reviewsApi).then(function(r){return r.json();}).then(function(d){
        var rv=(d&&d.reviews)||[]; if(!rv.length) return hide(el);
        el.innerHTML='<div class="tz-wrap">'+head(el,'What our clients say')+'<div class="tz-reviews">'+
          rv.slice(0,6).map(function(r){return '<div class="tz-rev"><div class="stars">'+stars(r.rating)+'</div><p>&ldquo;'+esc(r.review)+'&rdquo;</p><div class="who"><b>'+esc(r.name)+'</b>'+(r.city?' · '+esc(r.city):'')+(r.event_type?' · '+esc(r.event_type):'')+'</div></div>';}).join('')+'</div></div>';
      }).catch(function(){ hide(el); });
      return;
    }
    else return hide(el);
  }
  function init(){ [].forEach.call(document.querySelectorAll('[data-trust]'), render); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
