/* AllBee public-site analytics. Consent-first; no private journey/form telemetry. */
(function () {
  'use strict';
  var GA = 'G-TEX4FWGJFQ';
  var KEY = 'allbee-analytics-consent-v2';
  // Fixed public routes only: never send arbitrary slugs or private page IDs.
  var PUBLIC = new Set(["", "about", "birthday-invitations", "business-launch-invitations", "contact", "courses", "digitalmarketing", "housewarming-invitations", "invitation-samples", "nikah-invitations", "portfolio", "privacy", "refund", "services", "terms", "top-templates", "webdevelopment", "wedding-invitations"]);
  var DEMOS = new Set(["album-launch", "birthday", "birthday-vip", "blessed-abode", "botanical-letterpress", "business-launch", "business-opening", "celebration-gallery", "christian-wedding", "cinema-trailer", "emerald-crescent", "fun-fiesta", "hindu-wedding", "housewarming-blueprint", "housewarming-joy", "luxury-watch", "midnight-celebration", "modern-vows", "museum-exhibit", "muslim-wedding", "netflix-premiere", "newspaper-special", "nikah-calligraphy", "nikah-geometry", "nikah-makkah-night", "nikah-noor", "nikah-ottoman", "noor-garden", "opening-gala", "passport-journey", "royal-birthday", "royal-scroll", "sakeenah-luxe", "space-journey", "sweet-home", "time-capsule", "wedding-magazine", "wedding-timeline", "weddingly-story"]);
  var consent = null;
  var initialized = false;
  var dnt = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  var route = (location.pathname || '/').toLowerCase();
  var demo = /^\/demo\/([a-z0-9-]{1,60})(?:\.html)?$/.exec(route);
  var leaf = route.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
  // Static public routes only. Dynamic identifiers and URL query strings are excluded.
  if (demo ? !DEMOS.has(demo[1]) : !PUBLIC.has(leaf)) return;
  var path = demo ? '/demo/' + demo[1] : (leaf ? '/' + leaf : '/');
  try { consent = dnt ? 'no' : localStorage.getItem(KEY); } catch (_) { consent = 'no'; }
  if (consent !== 'yes' && consent !== 'no') consent = null;

  function enable() {
    if (initialized || consent !== 'yes' || dnt) return;
    initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA, { anonymize_ip: true, page_path: path });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(script);
  }
  function track(name) {
    if (!initialized || consent !== 'yes' || dnt) return;
    if (!/^(?:whatsapp_click|cta_click|order_start_click)$/.test(name)) return;
    try { window.gtag('event', name, { page_path: path }); } catch (_) { /* optional telemetry */ }
  }
  // Existing marketing scripts can call this safely, including before consent.
  window.AllBeeAnalytics = { track: track };
  function update(choice) {
    var wasEnabled = initialized;
    consent = choice;
    try { localStorage.setItem(KEY, choice); } catch (_) { /* storage disabled */ }
    var box = document.getElementById('allbee-analytics-choice');
    if (box) box.remove();
    ensureControl();
    if (choice === 'yes') enable();
    else if (wasEnabled) {
      // Unload Google's script/cookies context on withdrawal; never send more events.
      try { window.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (_) {}
      location.reload();
    }
  }
  function ensureStyles() {
    if (document.querySelector('link[data-allbee-analytics-css]')) return;
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/assets/site-analytics.css';
    sheet.setAttribute('data-allbee-analytics-css', '1');
    document.head.appendChild(sheet);
  }
  function prompt() {
    if (dnt || document.getElementById('allbee-analytics-choice')) return;
    var box = document.createElement('aside');
    box.id = 'allbee-analytics-choice';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Optional site analytics');
    var heading = document.createElement('strong');
    heading.textContent = 'Optional AllBee website analytics';
    box.appendChild(heading);
    var copy = document.createElement('p');
    copy.textContent = 'Allow anonymous page visits and broad navigation actions through Google Analytics? We do not send form inputs, searches, customer details or payment activity. Change your choice anytime from Privacy settings.';
    box.appendChild(copy);
    function button(label, value) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = label;
      btn.setAttribute('data-analytics-choice',value);
      btn.addEventListener('click', function () { update(value); });
      return btn;
    }
    box.appendChild(button('Allow analytics', 'yes'));
    box.appendChild(button('No thanks', 'no'));
    document.body.appendChild(box);
  }
  function ensureControl() {
    if (dnt || document.getElementById('allbee-analytics-manage')) return;
    var control = document.createElement('button');
    control.id = 'allbee-analytics-manage'; control.type = 'button';
    control.textContent = 'Privacy settings';
    control.setAttribute('aria-label', 'Change optional website analytics permission');
    control.addEventListener('click', prompt);
    document.body.appendChild(control);
  }
  function init() {
    if (dnt) return;
    ensureStyles();
    ensureControl();
    if (consent === 'yes') enable();
    else if (consent === null) prompt();
    document.addEventListener('click', function (event) {
      if (consent !== 'yes') return;
      var el = event.target.closest && event.target.closest('a,button');
      if (!el || el.closest('form,#allbee-analytics-choice,#allbee-analytics-manage')) return;
      var href = (el.getAttribute('href') || '').trim();
      if (/^https:\/\/(?:api\.)?wa\.me\//.test(href)) track('whatsapp_click');
      else if (el.matches('[data-open-lead],.btn-primary,.nav-cta,.hero-cta')) track('cta_click');
      else if (/^\/order(?:\.html)?(?:$|[?#])/.test(href)) track('order_start_click');
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
