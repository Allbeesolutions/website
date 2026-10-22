/* Project data — factual only. No invented metrics. */
var PF_PROJECTS = [
  {
    id: 'rkn-associates',
    name: 'RKN Associates',
    category: 'Business Website',
    categoryKey: 'business-website',
    badge: 'Client Project',
    client: 'RKN Associates',
    industry: 'Stainless Steel & Interiors',
    featured: true,
    img: '/assets/portfolio/rkn-associates.jpg',
    summary: 'A clean, professional business website built for RKN Associates — mobile-friendly, fast-loading, and designed to turn visitors into clients.',
    challenge: 'RKN Associates needed a credible online presence that presents their services clearly and brings in client enquiries.',
    solution: 'Designed and developed a fast, mobile-first business website with clear service pages, strong calls-to-action, and contact integration.',
    results: 'A live, professional web presence that loads fast on mobile and gives clients a clear path from browsing to enquiry.',
    tech: ['WordPress', 'Responsive Design', 'SEO'],
    url: 'https://rknassociates.com',
    urlLabel: 'Visit Website'
  },
  {
    id: 'biotin-clinic',
    name: 'Biotin Multispecialty Clinic & Pharmacy',
    category: 'Business Website',
    categoryKey: 'business-website',
    badge: 'Client Project',
    client: 'Biotin Multispecialty Clinic & Pharmacy',
    industry: 'Healthcare & Pharmacy',
    featured: false,
    img: '/assets/portfolio/biotin-clinic.webp',
    imgWidth: 1536,
    imgHeight: 864,
    summary: 'Professional multispecialty clinic and pharmacy website for Pallavaram, Chennai, presenting medical care, diagnostics, pharmacy services, specialist doctors and appointment access.',
    challenge: 'Biotin Multispecialty Clinic & Pharmacy needed a clear digital presence that brings its clinic, pharmacy, specialists and patient actions together in one place.',
    solution: 'Designed and developed a responsive healthcare website with clear service navigation, specialist information, appointment booking, WhatsApp contact and direct call actions.',
    results: 'A polished online presence for the Pallavaram clinic that helps patients understand the services and reach the clinic quickly.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    url: 'https://www.biotinclinic.com',
    urlLabel: 'Visit Website'
  },
  {
    id: 'hajihaz-ai',
    name: 'HajiHaz AI',
    category: 'AI Product',
    categoryKey: 'ai-product',
    badge: 'Live Product',
    client: 'HajiHaz',
    industry: 'Artificial Intelligence',
    featured: true,
    img: '/assets/images/inline/hajihaz-ai-preview.webp',
    summary: 'Personal AI assistant with admin-managed knowledge retrieval, business assistance, research support, and custom knowledge-base capabilities.',
    challenge: 'Generic AI chat tools can\'t answer from private, curated knowledge or reflect a person\'s own working context.',
    solution: 'Built a personal AI assistant platform with an admin-managed knowledge base, retrieval-augmented answers, and support for business, research and everyday productivity workflows.',
    results: 'A live AI assistant that answers from curated knowledge — business assistance, research support, and custom knowledge-base management in one product.',
    tech: ['AI / LLM', 'Knowledge Retrieval', 'Web App'],
    url: 'https://hajihazai.allbeesolutions.com',
    urlLabel: 'Visit HajiHaz AI'
  },
  {
    id: 'suplaykart',
    name: 'Suplaykart',
    category: 'Ecommerce Platform',
    categoryKey: 'ecommerce',
    badge: 'Live Product',
    client: 'Suplaykart',
    industry: 'Quick Commerce & Delivery',
    featured: true,
    img: '/assets/portfolio/suplaykart-ecommerce-concept-20261002.webp',
    imageAlt: 'Suplaykart e-commerce storefront concept preview',
    imgWidth: 1536,
    imgHeight: 1024,
    summary: 'Hyperlocal e-commerce and delivery platform for Nagore — groceries, restaurant orders and pick-&-drop, with search, categories, cart and order tracking.',
    challenge: 'Nagore had no dedicated local platform for fast grocery and restaurant delivery with a modern app experience.',
    solution: 'Built a mobile-first quick-commerce platform: multi-category catalog (grocery, restaurants, pick & drop), product search, cart, wishlist, profiles, delivery zones and live order tracking.',
    results: 'A complete hyperlocal commerce platform serving Nagore, Nagapattinam — from browsing to doorstep delivery.',
    tech: ['HTML', 'CSS', 'JavaScript', 'PWA', 'Mobile-First'],
    url: 'https://suplaykart.com',
    urlLabel: 'Visit Suplaykart'
  },
  {
    id: 'qadiri-palace',
    name: 'Qadiri Palace',
    category: 'Business Website',
    categoryKey: 'business-website',
    badge: 'Client Project',
    client: 'Qadiri Palace',
    industry: 'Hotel & Hospitality',
    featured: false,
    img: '/assets/images/inline/qadiri-palace-preview.jpg',
    summary: 'An elegant hotel booking website built for Qadiri Palace — mobile-friendly, fast-loading, with live room availability and instant WhatsApp booking.',
    challenge: 'Qadiri Palace needed guests to see rooms and book instantly without phone-call friction.',
    solution: 'Built an elegant hotel website with room showcases, live availability, and one-tap WhatsApp booking, optimised for mobile guests.',
    results: 'Guests browse rooms and book directly over WhatsApp — a faster path from interest to reservation.',
    tech: ['HTML', 'CSS', 'JavaScript', 'WhatsApp Integration'],
    url: 'https://www.qadiripalace.com',
    urlLabel: 'Visit Website'
  },
  {
    id: 'alim-sahib',
    name: 'Alim Sahib Z',
    category: 'Portfolio Website',
    categoryKey: 'portfolio-website',
    badge: 'Client Project',
    client: 'Mohamed Backer Alim Sahib',
    industry: 'Personal Branding',
    featured: false,
    img: '/assets/images/inline/alim-sahib-z-preview.webp',
    summary: 'Professional personal portfolio website built for Mohamed Backer Alim Sahib, showcasing profile, projects, experience, achievements, and personal branding.',
    challenge: 'A strong personal brand needed one polished place to present profile, work, experience and achievements to opportunities and collaborators.',
    solution: 'Designed and built a responsive personal portfolio website presenting profile, projects, experience and achievements with clean personal branding.',
    results: 'A live, professional personal portfolio at alimsahib.in that presents skills and experience clearly on every device.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    url: 'https://alimsahib.in',
    urlLabel: 'Visit Website'
  },
  {
    id: 'allbee-ai',
    name: 'AllBee AI',
    category: 'AI Product',
    categoryKey: 'ai-product',
    badge: 'Live Product',
    client: 'AllBee Solutions',
    industry: 'AI Education',
    featured: false,
    img: '/assets/portfolio/allbee-ai.jpg',
    summary: 'Online AI-powered learning platform for Microsoft Excel, Tally, Python, and other career-focused digital skills.',
    challenge: 'Students needed affordable, always-available help — explanations, exam prep and practice — beyond classroom hours.',
    solution: 'Built an AI learning platform with focused tools: code explainer, viva & exam prep, doubt solver, spoken English practice, resume & project help, and MS Office guidance — free for all students.',
    results: 'A live AI learning companion covering Excel, Tally, Python and career-focused digital skills, with bilingual (Tamil + English) guidance.',
    tech: ['AI / LLM', 'Web App', 'EdTech'],
    url: 'https://ai.allbeesolutions.com/',
    urlLabel: 'Visit AllBee AI'
  },
  {
    id: 'allbee-invitations',
    name: 'AllBee Invitations',
    category: 'Digital Product',
    categoryKey: 'digital-product',
    badge: 'Live Product',
    client: 'AllBee Solutions',
    industry: 'Digital Invitations & Events',
    featured: false,
    img: '/assets/portfolio/invitations.jpg',
    summary: 'A complete digital invitation platform with 34+ unique design templates, website delivery, PDF delivery, order management, and integrated customer review collection.',
    challenge: 'Families and businesses in Tamil Nadu needed a professional, affordable alternative to printed invitations — with fast delivery and multiple format options.',
    solution: 'Built a full-stack invitation platform: a public catalog with 34+ live demo designs, a Razorpay-integrated order system, PDF and website delivery options, and WhatsApp-based customer support.',
    results: '34+ live design templates across Wedding, Nikah, Birthday, Housewarming, and Business categories, with a complete order-to-delivery workflow.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Vercel', 'Razorpay'],
    url: '/invitation',
    urlLabel: 'View Platform'
  },
  {
    id: 'allbee-jobs',
    name: 'AllBee Jobs',
    category: 'Internal Product',
    categoryKey: 'internal-product',
    badge: 'Internal Product',
    client: 'AllBee Solutions',
    industry: 'Employment & Hiring',
    featured: false,
    img: '/assets/portfolio/allbee-jobs.jpg',
    summary: 'Hyperlocal job marketplace connecting local businesses with local talent across India — job search, employer postings, resume and skills tools, in five languages.',
    challenge: 'Local businesses and skilled workers struggle to find each other on national job boards built for metro cities.',
    solution: 'Built a hyperlocal job platform: search by title and district, free employer postings, resume builder, skills profiles and referrals — with English, Tamil, Hindi, Malayalam and Telugu support.',
    results: 'A working hyperlocal hiring marketplace — find jobs near you, hire talent near you.',
    tech: ['Web App', 'Multi-language', 'Marketplace'],
    url: null,
    urlLabel: null
  },
  {
    id: 'moibee',
    name: 'Moibee',
    category: 'Internal Product',
    categoryKey: 'internal-product',
    badge: 'Internal Product',
    client: 'AllBee Solutions',
    industry: 'Events & Community',
    featured: false,
    img: '/assets/portfolio/moibee.jpg',
    summary: 'Digital moi (gift contribution) tracking app for family events — record, manage and look up every blessing, with Tamil language support.',
    challenge: 'Moi records for weddings and functions are still kept in paper notebooks — hard to search, easy to lose, and awkward to settle later.',
    solution: 'Built a moi-tracking app: event management, contributor records, quick lookup and totals, with sign-in accounts and full Tamil support.',
    results: 'Families can track every blessing digitally — organised, searchable and safe.',
    tech: ['Web App', 'Tamil Support', 'Event Management'],
    url: null,
    urlLabel: null
  },
  {
    id: 'allbee-app',
    name: 'AllBee App',
    category: 'Internal Product',
    categoryKey: 'internal-product',
    badge: 'Internal Product',
    client: 'AllBee Solutions',
    industry: 'Business Operations',
    featured: false,
    img: '/assets/portfolio/allbee-app.jpg',
    summary: 'All-in-one internal operations app for the AllBee team — tasks, attendance, leads, clients, quotations, invoices, projects and team chat in one place.',
    challenge: 'Running the company across separate tools for tasks, attendance, leads, quotes and invoices created scattered data and duplicated work.',
    solution: 'Built a unified internal app with modules for tasks, attendance, leave, daily updates, leads, clients, quotations, invoices, projects, courses, marketing and team chat — with role-based access.',
    results: 'The AllBee team runs day-to-day operations from a single internal platform.',
    tech: ['Web App', 'Role-based Access', 'Business Modules'],
    url: null,
    urlLabel: null
  },
  {
    id: 'edusphere',
    name: 'Edusphere',
    category: 'Internal Product',
    categoryKey: 'internal-product',
    badge: 'Internal Product',
    client: 'AllBee Solutions',
    industry: 'Education Management',
    featured: false,
    img: '/assets/portfolio/edusphere.jpg',
    summary: 'Student portal for training institutes — new-student registration with admin approval, institution selection and student records.',
    challenge: 'Student onboarding at institutes ran on paper forms — slow to process and hard to keep organised across institutions.',
    solution: 'Built a student portal where students register online (institution, personal and guardian details) and admins review and approve each request before access is granted.',
    results: 'Institutes get clean, structured student records with an approval workflow from day one.',
    tech: ['Web App', 'Registration Workflow', 'Multi-institution'],
    url: null,
    urlLabel: null
  }
];
PF_PROJECTS = PF_PROJECTS.slice(0,1).concat(window.ALLBEE_SOFTWARE_SOLUTIONS || [], PF_PROJECTS.slice(1));

/* ---- Helpers ---- */
function esc(s){ return String(s||'').replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}) }

function techTags(arr){
  return arr.map(function(t){ return '<span class="pf-tag">'+esc(t)+'</span>'; }).join('');
}

function catBadge(cat){
  return '<span class="pf-cat">'+esc(cat)+'</span>';
}

function placeholderThumb(icon){
  return '<div class="pf-thumb-placeholder"><svg aria-hidden="true"><use href="#'+icon+'"/></svg><span>Preview</span></div>';
}

var ICONS = {
  'internal-product': 'i-code',
  'business-website': 'i-briefcase',
  'portfolio-website': 'i-monitor',
  'ecommerce':        'i-shopping',
  'ai-product':       'i-spark',
  'digital-product':  'i-briefcase',
  'software-solution':'i-code',
};

/* ---- Card HTML ---- */
function cardHTML(p, role){
  var thumb = p.img
    ? '<img src="'+esc(p.img)+'" alt="'+esc(p.imageAlt || (p.name+' screenshot'))+'" loading="lazy" width="400" height="200">'
    : placeholderThumb(ICONS[p.categoryKey] || 'i-briefcase');
  return '<article class="pf-card'+(p.featured ? ' featured' : '')+'" '
    +(role ? 'role="listitem"' : '')
    +' data-category="'+esc(p.categoryKey)+'"'
    +' data-id="'+esc(p.id)+'"'
    +' tabindex="0" aria-label="'+esc(p.name)+' — '+esc(p.category)+'">'
    +(p.badge ? '<span class="pf-badge">'+esc(p.badge)+'</span>' : '')
    +'<div class="pf-thumb">'+thumb+'</div>'
    +'<div class="pf-body">'
    +catBadge(p.category)
    +'<h3 class="pf-name">'+esc(p.name)+'</h3>'
    +'<p class="pf-desc">'+esc(p.summary)+'</p>'
    +'<div class="pf-tags">'+techTags(p.categoryKey === 'software-solution' ? p.tech : p.tech.slice(0,4))+'</div>'
    +'<span class="pf-cta">View Details <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow-right"/></svg></span>'
    +'</div></article>';
}

/* ---- Render Featured Grid ---- */
function renderFeatured(){
  var featured = PF_PROJECTS.filter(function(p){ return p.featured; });
  document.getElementById('pf-featured-grid').innerHTML = featured.map(function(p){ return cardHTML(p, false); }).join('');
}

/* ---- Render All Grid ---- */
function renderGrid(filter){
  var list = filter === 'all'
    ? PF_PROJECTS
    : PF_PROJECTS.filter(function(p){ return p.categoryKey === filter; });
  document.getElementById('pf-grid').innerHTML = list.map(function(p){ return cardHTML(p, true); }).join('');
}

/* ---- Filter Tabs ---- */
function initFilters(){
  document.querySelectorAll('.pf-tab').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.pf-tab').forEach(function(b){ b.classList.remove('active'); b.removeAttribute('aria-pressed'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      renderGrid(btn.getAttribute('data-filter'));
    });
  });
}

/* ---- Modal ---- */
var modalReturnFocus = null;
function openModal(id, trigger){
  var p = PF_PROJECTS.find(function(x){ return x.id === id; });
  if(!p) return;
  var overlay = document.getElementById('pfModal');
  modalReturnFocus = trigger || document.activeElement;

  // Image
  var imgEl = document.getElementById('pfModalImg');
  imgEl.innerHTML = p.img
    ? '<img src="'+esc(p.img)+'" alt="'+esc(p.imageAlt || (p.name+' screenshot'))+'" loading="lazy" width="800" height="450">'
    : placeholderThumb(ICONS[p.categoryKey] || 'i-briefcase');

  // Cat + title
  document.getElementById('pfModalCat').innerHTML = catBadge(p.category) + (p.badge ? ' <span class="pf-cat" style="background:rgba(220,165,12,0.12);border-color:rgba(220,165,12,0.35);color:var(--yellow-d)">'+esc(p.badge)+'</span>' : '');
  document.getElementById('pf-modal-title').textContent = p.name;

  // Meta
  var meta = '';
  if(p.client) meta += '<span><strong>Client:</strong> '+esc(p.client)+'</span>';
  if(p.industry) meta += '<span><strong>Industry:</strong> '+esc(p.industry)+'</span>';
  document.getElementById('pfModalMeta').innerHTML = meta;

  // Detail blocks
  var blocks = '';
  if(p.challenge) blocks += '<div class="pf-detail-block"><div class="pf-detail-label">Challenge</div><div class="pf-detail-text">'+esc(p.challenge)+'</div></div>';
  if(p.solution)  blocks += '<div class="pf-detail-block"><div class="pf-detail-label">Solution</div><div class="pf-detail-text">'+esc(p.solution)+'</div></div>';
  if(p.results)   blocks += '<div class="pf-detail-block full"><div class="pf-detail-label">Outcome</div><div class="pf-detail-text">'+esc(p.results)+'</div></div>';
  if(p.highlight) blocks += '<div class="pf-detail-block full"><div class="pf-detail-label">Highlight</div><div class="pf-detail-text">'+esc(p.highlight)+'</div></div>';
  document.getElementById('pfDetailGrid').innerHTML = blocks;

  // Tech tags
  document.getElementById('pfModalTags').innerHTML = techTags(p.tech);

  // Footer CTA
  var footer = '';
  if(p.url) footer += '<a href="'+esc(p.url)+'" class="btn-primary" target="_blank" rel="noopener">'+esc(p.urlLabel||'View Project')+' <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>';
  footer += '<a href="/contact" class="btn-secondary">Start a Similar Project</a>';
  document.getElementById('pfModalFooter').innerHTML = footer;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('pfModalClose').focus();
}

function closeModal(){
  document.getElementById('pfModal').classList.remove('open');
  document.body.style.overflow = '';
  if(modalReturnFocus && typeof modalReturnFocus.focus === 'function') modalReturnFocus.focus();
  modalReturnFocus = null;
}

function initModal(){
  document.querySelectorAll('.pf-hero-card').forEach(function(card){
    card.addEventListener('click',function(){ openModal(card.getAttribute('data-id'),card); });
  });
  document.getElementById('pfModalClose').addEventListener('click', closeModal);
  document.getElementById('pfModal').addEventListener('click', function(e){
    if(e.target === this) closeModal();
  });
  document.addEventListener('keydown', function(e){
    if(!document.getElementById('pfModal').classList.contains('open')) return;
    if(e.key === 'Escape'){ closeModal(); return; }
    if(e.key === 'Tab'){
      var focusables = Array.from(document.querySelectorAll('#pfModal button, #pfModal a[href], #pfModal [tabindex]:not([tabindex="-1"])')).filter(function(el){ return el.getClientRects().length; });
      if(!focusables.length){ e.preventDefault(); return; }
      var first = focusables[0], last = focusables[focusables.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      else if(!document.getElementById('pfModal').contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    }
  });
  // Card click delegation — featured + grid
  ['pf-featured-grid','pf-grid'].forEach(function(containerId){
    var el = document.getElementById(containerId);
    if(!el) return;
    el.addEventListener('click', function(e){
      var card = e.target.closest('.pf-card');
      if(card) openModal(card.getAttribute('data-id'), card);
    });
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        var card = e.target.closest('.pf-card');
        if(card){ e.preventDefault(); openModal(card.getAttribute('data-id'), card); }
      }
    });
  });
}

/* ---- Navbar scroll ---- */
function initNav(){
  var navbar = document.getElementById('navbar');
  if(navbar) window.addEventListener('scroll', function(){ navbar.classList.toggle('scrolled', window.scrollY > 20); }, {passive:true});
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if(hamburger && mobileMenu){
    hamburger.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && mobileMenu.classList.contains('open')){
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
        hamburger.focus();
      }
    });
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function(){
  renderFeatured();
  renderGrid('all');
  initFilters();
  initModal();
  initNav();
});
