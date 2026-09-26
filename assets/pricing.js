/* Update published price markers from AllBee's catalogue. Static HTML remains a
   readable fallback if the API is temporarily unavailable. */
(function(){
  var targets = document.querySelectorAll('[data-price-key]');
  if (!targets.length) return;
  fetch('/api/public-pricing', { headers:{Accept:'application/json'} })
    .then(function(response){ if (!response.ok) throw new Error('catalogue unavailable'); return response.json(); })
    .then(function(payload){
      if (!payload || !payload.ok || !Array.isArray(payload.rows)) return;
      var lookup = new Map(payload.rows.map(function(row){
        return [row.service_slug + ':' + row.package_slug, row];
      }));
      targets.forEach(function(target){
        var row = lookup.get(target.dataset.priceKey);
        if (!row || !Number.isFinite(Number(row.price))) return;
        var amount = target.matches('.crsx-card') ? target.querySelector('.crsx-price-num') :
          target.matches('.pricing-title') ? target.closest('.pricing-card').querySelector('.pricing-amount') :
          target;
        if (!amount) return;
        amount.textContent = (target.dataset.pricePrefix || '') + '₹' + Number(row.price).toLocaleString('en-IN');
      });
    })
    .catch(function(){ /* Preserve the published HTML price. */ });
})();
