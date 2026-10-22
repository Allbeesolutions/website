/* CSP-safe event handlers formerly embedded in public-page attributes.
 * Explicit allowed actions only. No dynamic code, eval, or string handlers. */
(function () {
  'use strict';
  function ready() {
    document.addEventListener('click', function (event) {
      var target = event.target.closest && event.target.closest('[data-csp-click]');
      if (!target) return;
      var name = target.getAttribute('data-csp-click');
      if (name === 'open-modal' && typeof window.openModal === 'function') window.openModal();
      else if (name === 'close-modal' && typeof window.closeModal === 'function') window.closeModal();
    });
    var hoverEvents = { mouseenter:'enter', mouseleave:'leave', focus:'focus', blur:'blur' };
    Object.keys(hoverEvents).forEach(function (eventName) {
      document.querySelectorAll('[data-csp-' + hoverEvents[eventName] + ']').forEach(function (element) {
        element.addEventListener(eventName, function () {
          if (typeof window.tsHover !== 'function') return;
          var value = element.getAttribute('data-csp-' + hoverEvents[eventName]);
          window.tsHover(value === 'clear' ? null : value);
        });
      });
    });
    document.addEventListener('submit', function (event) {
      var form = event.target.closest && event.target.closest('form[data-csp-demo-submit]');
      if (!form) return;
      event.preventDefault();
      var action = form.getAttribute('data-csp-demo-submit');
      if (action === 'show-ok') {
        var ok = document.getElementById('ok'); if (ok) ok.hidden = false;
      } else if (action === 'preview-message') {
        var button = form.querySelector('button');
        if (button) button.textContent = 'Preview only — no response submitted';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
