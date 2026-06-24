/**
 * AllBee Invitations — Google Apps Script web app (lead capture + CRM).
 *
 * Handles three actions on the "Leads" sheet:
 *   (no action)      append a new lead   (called by /api/invitation-enquiry)
 *   action:'list'    return all leads    (called by /api/invitation-leads — CRM read)
 *   action:'update'  patch a lead by ID  (called by /api/invitation-leads — CRM write)
 *
 * SETUP (in your Google account):
 *  1. Create a Google Sheet.
 *  2. Extensions → Apps Script → paste this file → Save.
 *  3. Project Settings → Script properties:
 *        SHARED_SECRET = <long random string>   (match Vercel LEAD_SHARED_SECRET)
 *        NOTIFY_EMAIL  = allbeesolutions@gmail.com
 *  4. Deploy → New deployment → Web app → Execute as: Me · Who has access: Anyone.
 *  5. Copy the Web app URL → Vercel env LEAD_APPS_SCRIPT_URL.  Authorize when prompted.
 *
 * Columns (auto-created):
 *  Lead ID | Timestamp | Name | Mobile | Email | Event Type | Event Date |
 *  Interested In | Notes | Source Page | Visitor IP | Status | Value | CRM Notes | Updated
 */

var HEADERS = ['Lead ID','Timestamp','Name','Mobile','Email','Event Type','Event Date',
  'Interested In','Notes','Source Page','Visitor IP','Status','Value','CRM Notes','Updated'];

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
      ip:r[10], status:r[11]||'New Lead', value:Number(r[12])||0, crm_notes:r[13]||'' };
  });
}

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SHARED_SECRET');
    var b = JSON.parse(e.postData.contents || '{}');
    if (secret && b.secret !== secret) return _json({ ok:false, error:'unauthorized' });

    var sh = sheet_();

    if (b.action === 'list') {
      return _json({ ok:true, leads: rowsToLeads_(sh) });
    }

    // ----- Orders (Phase 6) -----
    if (b.action === 'order_create') { return _json(orderCreate_(b)); }
    if (b.action === 'order_list')   { return _json({ ok:true, orders: ordersList_() }); }
    if (b.action === 'order_update') { return _json(orderUpdate_(b.id, b.patch || {})); }

    if (b.action === 'update') {
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

    // default: append a new lead
    var id = 'AB-' + Utilities.formatString('%04d', sh.getLastRow());
    sh.appendRow([ id, b.timestamp || new Date().toISOString(), b.name||'', b.mobile||'', b.email||'',
      b.event_type||'', b.event_date||'', (b.interested_in||[]).join(', '), b.notes||'',
      b.source||'', b.ip||'', 'New Lead', '', '', '' ]);

    var to = props.getProperty('NOTIFY_EMAIL') || 'allbeesolutions@gmail.com';
    MailApp.sendEmail({ to: to, subject: 'New AllBee Invitations lead — ' + (b.name||'Unknown'),
      htmlBody: 'New lead ' + id + '<br>' + (b.name||'') + ' · ' + (b.mobile||'') + ' · ' + (b.event_type||'') });
    return _json({ ok:true, id:id });
  } catch (err) {
    return _json({ ok:false, error:String(err) });
  }
}

/* ===== Orders (Phase 6) — separate "Orders" sheet ===== */
var ORDER_HEADERS = ['Order ID','Date','Name','Mobile','Email','Event Type','Invitation Type',
  'Package','Amount','Payment ID','Status','Source','Lead ID','Template ID','Template Name','Demo','Notes','Updated'];
function orderSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
  if (sh.getLastRow() === 0) { sh.appendRow(ORDER_HEADERS); sh.getRange(1,1,1,ORDER_HEADERS.length).setFontWeight('bold'); }
  return sh;
}
function orderCreate_(b) {
  var sh = orderSheet_();
  var id = 'ORD-' + Utilities.formatString('%04d', 1000 + sh.getLastRow());
  sh.appendRow([ id, new Date().toISOString().slice(0,10), b.name||'', b.mobile||'', b.email||'',
    b.event_type||'', b.invitation_type||'', b.package||'', Number(b.amount)||0, b.payment_id||'',
    'New', b.source||'/order', b.lead_id||'', b.template_id||'', b.template_name||'', b.demo||'', '', new Date().toISOString() ]);
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || 'allbeesolutions@gmail.com';
  MailApp.sendEmail({ to: to, subject: 'New PAID order ' + id + ' — ₹' + (Number(b.amount)||0),
    htmlBody: id + '<br>' + (b.name||'') + ' · ' + (b.mobile||'') + '<br>' + (b.package||'') + ' ' + (b.invitation_type||'') + ' · ₹' + (Number(b.amount)||0) });
  return { ok:true, id:id };
}
function ordersList_() {
  var sh = orderSheet_(); var data = sh.getDataRange().getValues(); data.shift();
  return data.filter(function(r){ return r[0]; }).map(function(r){
    return { id:r[0], date:String(r[1]).slice(0,10), name:r[2], mobile:r[3], email:r[4], event_type:r[5],
      invitation_type:r[6], package:r[7], amount:Number(r[8])||0, payment_id:r[9], status:r[10]||'New',
      source:r[11]||'', lead_id:r[12]||'', template_id:r[13]||'', template_name:r[14]||'', demo:r[15]||'', notes:r[16]||'' };
  });
}
function orderUpdate_(id, patch) {
  var sh = orderSheet_(); var vals = sh.getDataRange().getValues();
  for (var i=1;i<vals.length;i++){ if (vals[i][0]===id){
    if (patch.status !== undefined) sh.getRange(i+1,11).setValue(patch.status);
    if (patch.notes  !== undefined) sh.getRange(i+1,17).setValue(patch.notes);
    sh.getRange(i+1,18).setValue(new Date().toISOString());
    return { ok:true };
  }}
  return { ok:false, error:'not_found' };
}

function _json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
