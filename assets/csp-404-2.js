(function(){
  // Navbar scroll state
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var _s = null;
    window.addEventListener('scroll', function(){
      var s = window.scrollY > 20;
      if (s !== _s) { _s = s; navbar.classList.toggle('scrolled', s); }
    }, { passive: true });
  }
  // Mobile menu toggle
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }
})();
