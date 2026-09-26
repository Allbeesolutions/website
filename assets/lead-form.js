/* Shared lead capture for AllBee site pages. */
window.AllBeeForms = {
  init: function({CFG, trackEvent}) {
  /* ─────────────────────────────────────────────────────────────────
     FORMS - capture first, then offer WhatsApp follow-up
  ───────────────────────────────────────────────────────────────── */
  function labelForField(field){
    if (!field || !field.name) return '';
    const label = field.id ? document.querySelector('label[for="' + field.id + '"]') : null;
    if (label) return label.textContent.replace('*', '').trim();
    return field.name.replace(/^_/, '').replace(/_/g, ' ').replace(/\b\w/g, function(ch){ return ch.toUpperCase(); });
  }

  function buildWhatsAppLeadMessage(form){
    const lines = [];
    const subject = form.querySelector('[name="_subject"]');
    lines.push(subject && subject.value ? subject.value : 'New website enquiry - AllBee Solutions');
    lines.push('');
    Array.from(form.elements).forEach(function(field){
      if (!field.name || field.name === '_gotcha' || field.name === '_subject') return;
      if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;
      const value = String(field.value || '').trim();
      if (!value) return;
      lines.push(labelForField(field) + ': ' + value);
    });
    lines.push('Page: ' + window.location.href.split('#')[0]);
    return lines.join('\n');
  }

  function leadPayload(form){
    const data = new FormData(form);
    const values = {};
    data.forEach(function(value, key){
      if (key === '_gotcha' || key === '_subject') return;
      if (values[key]) values[key] = Array.isArray(values[key]) ? values[key].concat(String(value)) : [values[key], String(value)];
      else values[key] = String(value).trim();
    });
    const asText = function(value){ return Array.isArray(value) ? value.join(', ') : String(value || '').trim(); };
    const eventType = asText(values.event_type || values.event || 'Other');
    const allowedEvents = ['Wedding','Nikah','Birthday','Housewarming','Dargah Event','School Event','Business Event','Political Event','Other'];
    const notes = [];
    Object.keys(values).forEach(function(key){
      if (['name','full_name','phone','mobile','email','event_type','event','event_date','interested_in'].includes(key)) return;
      const value = asText(values[key]);
      if (value) notes.push(labelForField(form.querySelector('[name="' + key + '"]')) + ': ' + value);
    });
    return {
      name: asText(values.name || values.full_name),
      mobile: asText(values.mobile || values.phone),
      email: asText(values.email),
      event_type: allowedEvents.includes(eventType) ? eventType : 'Other',
      event_date: asText(values.event_date),
      interested_in: Array.isArray(values.interested_in) ? values.interested_in : (values.interested_in ? [values.interested_in] : []),
      notes: notes.join('\n'),
      source: window.location.pathname + (form.id ? '#' + form.id : ''),
      render_ts: form.dataset.renderTs || String(Date.now() - 4000),
      _gotcha: data.get('_gotcha') || ''
    };
  }

  function showWhatsAppFollowUp(form, statusEl, message){
    if (!statusEl) return;
    const phone = String(CFG.phoneWhatsApp || '').replace(/\D/g, '') || '918903607506';
    const link = document.createElement('a');
    link.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message.text + '\nReference: ' + message.lead_id);
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Continue in WhatsApp';
    statusEl.className = 'form-status success';
    statusEl.textContent = 'Request saved. Reference: ' + message.lead_id + '. ';
    statusEl.appendChild(link);
  }

  async function submitLead(form, statusEl){
    const response = await fetch('/api/invitation-enquiry', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(leadPayload(form))
    });
    const payload = await response.json().catch(function(){ return {}; });
    if (!response.ok || !payload.ok || payload.captured !== true || !payload.lead_id) throw new Error(payload.error || 'Unable to save enquiry');
    return payload;
  }

  function wireForm(form){
    if (!form) return;
    form.action = '/api/invitation-enquiry';
    form.method = 'POST';
    form.dataset.renderTs = String(Date.now());
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      const honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        if (statusEl) { statusEl.className = 'form-status success'; statusEl.textContent = 'Submitted.'; }
        return;
      }
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending securely...'; }
      submitLead(form, statusEl).then(function(result){
        showWhatsAppFollowUp(form, statusEl, {text:buildWhatsAppLeadMessage(form),lead_id:result.lead_id});
        trackEvent('form_submit_captured', { form_id: form.id || 'unknown' });
        form.reset();
      }).catch(function(){
        if (statusEl) {
          statusEl.className = 'form-status error';
          statusEl.textContent = 'We could not save the request. ';
          const phone = String(CFG.phoneWhatsApp || '').replace(/\D/g, '') || '918903607506';
          const link = document.createElement('a');
          link.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(buildWhatsAppLeadMessage(form));
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = 'Continue in WhatsApp';
          statusEl.appendChild(link);
        }
        trackEvent('form_submit_capture_failed', { form_id: form.id || 'unknown' });
      }).finally(function(){
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtnText; }
      });
    });
  }
  document.querySelectorAll('form[data-form="allbee"]').forEach(wireForm);

  }
};
