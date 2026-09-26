/**
 * AllBee Invitations — Google Apps Script web app (lead capture + CRM).
 *
 * Handles three actions on the "Leads" sheet:
 *   action:'lead'    append a new lead   (called by /api/invitation-enquiry)
 *   action:'list'    return all leads    (called by /api/invitation-leads — CRM read)
 *   action:'update'  patch a lead by ID  (called by /api/invitation-leads — CRM write)
 *
 * SETUP (in your Google account):
 *  1. Create a Google Sheet.
 *  2. Extensions → Apps Script → paste this file → Save.
 *  3. Project Settings → Script properties:
 *        SHARED_SECRET = <long random string>   (match Vercel LEAD_SHARED_SECRET)
 *        NOTIFY_EMAIL  = contact@allbeesolutions.com
 *        REFERENCE_FOLDER_ID = <private Google Drive folder ID for brief photos>
 *  4. Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone.
 *  5. Copy the Web app URL → Vercel env LEAD_APPS_SCRIPT_URL.  Authorize when prompted.
 *
 * Columns (auto-created):
 *  Lead ID | Timestamp | Name | Mobile | Email | Event Type | Event Date |
 *  Interested In | Notes | Source Page | Visitor IP | Status | Value | CRM Notes | Updated
 */

var HEADERS = ['Lead ID','Timestamp','Name','Mobile','Email','Event Type','Event Date',
  'Interested In','Notes','Source Page','Visitor IP','Status','Value','CRM Notes','Updated',
  'Template ID','Template Name','Demo'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold'); }
  return sh;
}
function rowsToLeads_(sh) {
  var data = sh.getDataRange().getValues(); data.shift(); // drop header
  return data.filter(function(r){ return r[2]; }).map(function(r){
    return { id:r[0], date:String(r[1]).slice(0,10), name:r[2], mobile:r[3], email:r[4],
      event_type:r[5], event_date:r[6], interested_in:r[7], notes:r[8], source:r[9],
      ip:r[10], status:r[11]||'New Lead', value:Number(r[12])||0, crm_notes:r[13]||'',
      template_id:r[15]||'', template_name:r[16]||'', demo:r[17]||'' };
  });
}

function doPost(e) {
  var lock = null;
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SHARED_SECRET');
    var b = JSON.parse(e.postData.contents || '{}');
    var action = b.action;
    if (['lead','list','update','order_list','order_track','order_create','order_update','order_mark',
      'review_public','review_list','review_create','review_moderate','reference_upload'].indexOf(action) === -1) {
      return _json({ ok:false, error:'invalid_action', status:400 });
    }
    if (!secret) return _json({ ok:false, error:'not_configured' });
    if (b.secret !== secret) return _json({ ok:false, error:'unauthorized' });

    // Validate before sheet_() can create a header row or the lead branch can
    // append a data row. This protects the email and sheet sinks even if the
    // Apps Script URL is called directly instead of through Vercel.
    if (action === 'lead') {
      var leadValidation = validateLeadPayload_(b);
      if (!leadValidation.ok) return _json({ ok:false, error:'validation_error', fields:leadValidation.errors, status:422 });
    }

    // Serialize writes so concurrent order_create / appends never collide on IDs.
    var isWrite = (action === 'order_create' || action === 'order_update' || action === 'order_mark' || action === 'update' || action === 'lead' || action === 'review_create' || action === 'review_moderate' || action === 'reference_upload');
    if (isWrite) { lock = LockService.getScriptLock(); if (!lock.tryLock(25000)) return _json({ ok:false, error:'busy_try_again' }); }

    if (action === 'reference_upload') return _json(referenceUpload_(b, props));

    // ----- reads (cheap, cacheable, paginated) -----
    if (action === 'list') {
      var leads = rowsToLeads_(sheet_());
      return _json({ ok:true, total: leads.length, leads: paginate_(leads, b) });
    }
    if (action === 'order_list') {
      var orders = ordersListCached_();
      return _json({ ok:true, total: orders.length, orders: paginate_(orders, b) });
    }
    if (action === 'order_track')  { return _json(orderTrack_(b.id, b.mobile)); }

    // ----- writes (under lock) -----
    if (action === 'order_create') { var rc = orderCreate_(b); bustCache_('orders_all'); return _json(rc); }
    if (action === 'order_update') { var ru = orderUpdate_(b.id, b.patch || {}); bustCache_('orders_all'); return _json(ru); }
    if (action === 'order_mark')   { var rk = orderMark_(b.payment_id, b.status, b.note); bustCache_('orders_all'); return _json(rk); }

    // ----- Reviews (collection → moderation → approval) -----
    if (action === 'review_public')   { return _json({ ok:true, reviews: reviewsList_(true) }); }
    if (action === 'review_list')     { return _json({ ok:true, reviews: reviewsList_(false) }); }
    if (action === 'review_create')   { return _json(reviewCreate_(b)); }
    if (action === 'review_moderate') { return _json(reviewModerate_(b.id, b.moderated)); }

    var sh = sheet_();
    if (action === 'update') {
      var vals = sh.getDataRange().getValues();
      for (var i = 1; i < vals.length; i++) {
        if (vals[i][0] === b.id) {
          var p = b.patch || {};
          if (p.status     !== undefined) sh.getRange(i+1, 12).setValue(p.status);
          if (p.value      !== undefined) sh.getRange(i+1, 13).setValue(p.value);
          if (p.crm_notes  !== undefined) sh.getRange(i+1, 14).setValue(p.crm_notes);
          sh.getRange(i+1, 15).setValue(new Date().toISOString());
          return _json({ ok:true });
        }
      }
      return _json({ ok:false, error:'not_found' });
    }

    // append a validated lead (ID is race-safe under the lock)
    var id = 'AB-' + Utilities.formatString('%04d', sh.getLastRow());
    sh.appendRow([ id, b.timestamp || new Date().toISOString(), b.name||'', b.mobile||'', b.email||'',
      b.event_type||'', b.event_date||'', (b.interested_in||[]).join(', '), b.notes||'',
      b.source||'', b.ip||'', 'New Lead', '', '', '', b.template_id||'', b.template_name||'', b.demo||'' ]);
    safeEmail_(props.getProperty('NOTIFY_EMAIL') || 'contact@allbeesolutions.com',
      'New AllBee Invitations lead — ' + (b.name||'Unknown'),
      'New lead ' + id + '<br>' + (b.name||'') + ' · ' + (b.mobile||'') + ' · ' + (b.event_type||''), b, action);
    return _json({ ok:true, id:id });
  } catch (err) {
    console.error(String(err));
    return _json({ ok:false, error:'internal_error' });
  } finally {
    if (lock) lock.releaseLock();
  }
}

/* Brief reference images stay in a private Drive folder. The Vercel endpoint
   validates the signed order token; this sink verifies the shared secret, paid
   order status, content and per-order count under the script write lock. */
var REFERENCE_HEADERS = ['Order ID','Uploaded','File ID','Filename','MIME','Bytes'];
function referenceUpload_(b, props) {
  var folderId = props.getProperty('REFERENCE_FOLDER_ID');
  if (!folderId) return { ok:false, error:'upload_unavailable' };
  var id = String(b.order_id || '');
  if (!/^ORD-\d{4,12}$/.test(id)) return { ok:false, error:'invalid_order' };
  var orders = orderSheet_().getDataRange().getValues();
  var allowed = ['Payment Confirmed','Details Submitted','Designing','First Preview Ready','Revision Requested','Revision In Progress','Final Approval','Delivered'];
  if (!orders.some(function(row, i){ return i > 0 && String(row[0]) === id && allowed.indexOf(String(row[10])) !== -1; })) return { ok:false, error:'invalid_order' };
  var mime = String(b.mime || '');
  if (['image/jpeg','image/png','image/webp'].indexOf(mime) === -1) return { ok:false, error:'invalid_image' };
  var encoded = b.data;
  if (typeof encoded !== 'string' || encoded.length > 2097152 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) return { ok:false, error:'invalid_image' };
  var bytes = Utilities.base64Decode(encoded);
  if (bytes.length < 16 || bytes.length > 1572864) return { ok:false, error:'invalid_image' };
  var u = function(n){ return bytes[n] & 255; };
  var valid = mime === 'image/jpeg' ? u(0)===255 && u(1)===216 && u(2)===255 :
    mime === 'image/png' ? [137,80,78,71,13,10,26,10].every(function(v,i){return u(i)===v;}) :
    [82,73,70,70].every(function(v,i){return u(i)===v;}) && [87,69,66,80].every(function(v,i){return u(i+8)===v;});
  if (!valid) return { ok:false, error:'invalid_image' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('References') || ss.insertSheet('References');
  if (sh.getLastRow() === 0) { sh.appendRow(REFERENCE_HEADERS); sh.getRange(1,1,1,REFERENCE_HEADERS.length).setFontWeight('bold'); }
  var rows = sh.getDataRange().getValues();
  if (rows.filter(function(row,i){return i>0 && String(row[0])===id;}).length >= 3) return { ok:false, error:'limit_reached' };
  var original = String(b.filename || '').replace(/^.*[\\/]/,'').replace(/[^a-zA-Z0-9._ -]/g,'_').replace(/^\.+/,'').slice(0,70) || 'reference';
  var extension = { 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp' }[mime];
  var name = id + '-' + Utilities.getUuid().slice(0,8) + '-' + original.replace(/\.[^.]*$/,'') + extension;
  var file = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes, mime, name));
  try { sh.appendRow([id, new Date().toISOString(), file.getId(), name, mime, bytes.length]); }
  catch (err) { file.setTrashed(true); throw err; }
  return { ok:true, id:file.getId() };
}

/* ===== Production-hardening helpers (Phase 1) ===== */
function paginate_(arr, b){ var lim = Number(b && b.limit) || 0; if (!lim) return arr; var off = Number(b && b.offset) || 0; return arr.slice(off, off + lim); }
function ordersListCached_(){
  var cache = CacheService.getScriptCache(), hit = cache.get('orders_all');
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  var data = ordersList_();
  try { var j = JSON.stringify(data); if (j.length < 95000) cache.put('orders_all', j, 12); } catch (e) {}
  return data;
}
function bustCache_(key){ try { CacheService.getScriptCache().remove(key); } catch (e) {} }
function isNonBlank_(v) { return typeof v === 'string' && v.trim() !== ''; }
function validateLeadPayload_(b) {
  var errors = {};
  if (!isNonBlank_(b.name) || b.name.trim().length < 2) errors.name = 'name_required';
  if (!isNonBlank_(b.mobile)) errors.mobile = 'mobile_required';
  if (!isNonBlank_(b.event_type)) errors.event_type = 'occasion_required';
  if (!isNonBlank_(b.mobile) && !isNonBlank_(b.email)) errors.contact = 'contact_required';
  return { ok:Object.keys(errors).length === 0, errors:errors };
}

// MailApp has a hard daily quota (100/day consumer, 1500 Workspace). Never let an
// email failure roll back a paid order — skip silently when out of quota.
function safeEmail_(to, subject, html, payload, action){
  if (action === 'lead') {
    var validation = validateLeadPayload_(payload || {});
    if (!validation.ok) {
      return;
    }
  }
  try { if (MailApp.getRemainingDailyQuota() > 0) MailApp.sendEmail({ to:to, subject:subject, htmlBody:html }); } catch (e) {}
}

/* ===== Orders (Phase 6) — separate "Orders" sheet ===== */
var ORDER_STATUSES = ['Order Placed','Payment Confirmed','Details Submitted','Designing','First Preview Ready','Revision Requested','Revision In Progress','Final Approval','Delivered','Payment Failed','Refunded','Cancelled'];
var ORDER_HEADERS = ['Order ID','Date','Name','Mobile','Email','Event Type','Invitation Type',
  'Package','Amount','Payment ID','Status','Source','Lead ID','Template ID','Template Name','Demo','Notes','Updated','Assignee','Delivery'];
function orderSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
  if (sh.getLastRow() === 0) { sh.appendRow(ORDER_HEADERS); sh.getRange(1,1,1,ORDER_HEADERS.length).setFontWeight('bold'); }
  return sh;
}
function orderCreate_(b) {
  var sh = orderSheet_();
  // Idempotency: a Razorpay webhook can fire more than once for the same payment.
  // If we've already recorded this payment_id, return the existing order instead of duplicating.
  if (b.payment_id) {
    var vals = sh.getDataRange().getValues();
    for (var k = 1; k < vals.length; k++) { if (String(vals[k][9]) === String(b.payment_id)) { return { ok:true, id:vals[k][0], duplicate:true }; } }
  }
  var id = b.receipt ? String(b.receipt).slice(0,40) : ('ORD-' + Utilities.formatString('%04d', 1000 + sh.getLastRow()));
  sh.appendRow([ id, new Date().toISOString().slice(0,10), b.name||'', b.mobile||'', b.email||'',
    b.event_type||'', b.invitation_type||'', b.package||'', Number(b.amount)||0, b.payment_id||'',
    'Payment Confirmed', b.source||'/order', b.lead_id||'', b.template_id||'', b.template_name||'', b.demo||'', '', new Date().toISOString(), '', '' ]);
  safeEmail_(PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || 'contact@allbeesolutions.com',
    'New PAID order ' + id + ' — ₹' + (Number(b.amount)||0),
    id + '<br>' + (b.name||'') + ' · ' + (b.mobile||'') + '<br>' + (b.package||'') + ' ' + (b.invitation_type||'') + ' · ₹' + (Number(b.amount)||0), b, 'order_create');
  return { ok:true, id:id };
}
/* Mark an order by payment_id (refund / failed). Records an orphan row if the
   payment has no order yet (e.g. failed before capture) so nothing is lost. */
function orderMark_(payment_id, status, note) {
  if (!payment_id) return { ok:false, error:'missing_payment_id' };
  var sh = orderSheet_(), vals = sh.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][9]) === String(payment_id)) {
      if (status) sh.getRange(i+1, 11).setValue(status);
      if (note) { var prev = vals[i][16] || ''; sh.getRange(i+1, 17).setValue((prev ? prev + '\n' : '') + '[' + new Date().toISOString().slice(0,10) + '] ' + note); }
      sh.getRange(i+1, 18).setValue(new Date().toISOString());
      return { ok:true, id:vals[i][0] };
    }
  }
  var id = 'ORD-' + Utilities.formatString('%04d', 1000 + sh.getLastRow());
  sh.appendRow([ id, new Date().toISOString().slice(0,10), '', '', '', '', '', '', 0, payment_id,
    status || 'Payment Failed', 'webhook', '', '', '', '', note || '', new Date().toISOString(), '', '' ]);
  return { ok:true, id:id, created:true };
}
function ordersList_() {
  var sh = orderSheet_(); var data = sh.getDataRange().getValues(); data.shift();
  return data.filter(function(r){ return r[0]; }).map(function(r){
    return { id:r[0], date:String(r[1]).slice(0,10), name:r[2], mobile:r[3], email:r[4], event_type:r[5],
      invitation_type:r[6], package:r[7], amount:Number(r[8])||0, payment_id:r[9], status:r[10]||'New',
      source:r[11]||'', lead_id:r[12]||'', template_id:r[13]||'', template_name:r[14]||'', demo:r[15]||'', notes:r[16]||'',
      updated:r[17]||'', assignee:r[18]||'', delivery:r[19]||'' };
  });
}
function orderUpdate_(id, patch) {
  var sh = orderSheet_(); var vals = sh.getDataRange().getValues();
  for (var i=1;i<vals.length;i++){ if (vals[i][0]===id){
    if (patch.status !== undefined && ORDER_STATUSES.indexOf(String(patch.status)) === -1) return { ok:false, error:'invalid_status' };
    if (patch.status !== undefined) sh.getRange(i+1,11).setValue(patch.status);
    if (patch.notes    !== undefined) sh.getRange(i+1,17).setValue(patch.notes);
    if (patch.assignee !== undefined) sh.getRange(i+1,19).setValue(patch.assignee);
    if (patch.delivery !== undefined) sh.getRange(i+1,20).setValue(patch.delivery);
    sh.getRange(i+1,18).setValue(new Date().toISOString());
    return { ok:true };
  }}
  return { ok:false, error:'not_found' };
}

/* Public order tracking — match by Order ID + mobile (digits), return safe fields only */
function orderTrack_(id, mobile) {
  var sh = orderSheet_(); var data = sh.getDataRange().getValues(); data.shift();
  var want = String(mobile||'').replace(/\D/g,'').slice(-10);
  for (var i=0;i<data.length;i++){ var r=data[i];
    if (String(r[0]).toUpperCase() === String(id||'').toUpperCase().trim()) {
      var have = String(r[3]||'').replace(/\D/g,'').slice(-10);
      if (!want || want !== have) return { ok:false, error:'no_match' };
      return { ok:true, order:{ id:r[0], date:String(r[1]).slice(0,10), name:r[2],
        event_type:r[5], invitation_type:r[6], package:r[7], status:r[10]||'New',
        template_name:r[14]||'', updated:r[17]||'', delivery:r[19]||'' } };
    }
  }
  return { ok:false, error:'not_found' };
}

/* ===== Reviews ===== */
var REVIEW_HEADERS = ['Review ID','Date','Name','City','Event Type','Rating','Review','Template ID','Order ID','Moderated'];
function reviewSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Reviews') || ss.insertSheet('Reviews');
  if (sh.getLastRow() === 0) { sh.appendRow(REVIEW_HEADERS); sh.getRange(1,1,1,REVIEW_HEADERS.length).setFontWeight('bold'); }
  return sh;
}
function reviewCreate_(b) {
  var sh = reviewSheet_();
  var id = 'REV-' + Utilities.formatString('%04d', sh.getLastRow());
  var rating = Math.max(1, Math.min(5, Number(b.rating) || 5));
  sh.appendRow([ id, new Date().toISOString().slice(0,10), b.name||'', b.city||'', b.event_type||'',
    rating, String(b.review||'').slice(0,600), b.template_id||'', b.order_id||'', false ]); // moderated=false → hidden until approved
  return { ok:true, id:id };
}
function isTrue_(v){ return v === true || v === 'TRUE' || v === 'true' || v === 1; }
function reviewsList_(approvedOnly) {
  var sh = reviewSheet_(); var data = sh.getDataRange().getValues(); data.shift();
  return data.filter(function(r){ return r[0] && (!approvedOnly || isTrue_(r[9])); }).map(function(r){
    return { id:r[0], date:String(r[1]).slice(0,10), name:r[2], city:r[3], event_type:r[4],
      rating:Number(r[5])||5, review:r[6], template_id:r[7], order_id:r[8], moderated:isTrue_(r[9]) };
  }).reverse(); // newest first
}
function reviewModerate_(id, moderated) {
  var sh = reviewSheet_(); var vals = sh.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) { if (vals[i][0] === id) { sh.getRange(i+1, 10).setValue(!!moderated); return { ok:true }; } }
  return { ok:false, error:'not_found' };
}

function _json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
