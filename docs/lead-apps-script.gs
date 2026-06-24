/**
 * AllBee Invitations — Google Apps Script web app.
 * Appends each lead to the "Leads" sheet AND emails a notification.
 *
 * SETUP (in your own Google account):
 *  1. Create a Google Sheet (e.g. "AllBee Invitations Leads").
 *  2. Extensions → Apps Script. Paste this file. Save.
 *  3. Project Settings → Script properties, add:
 *        SHARED_SECRET  = <a long random string>   (must match Vercel LEAD_SHARED_SECRET)
 *        NOTIFY_EMAIL   = allbeesolutions@gmail.com (where to email leads)
 *  4. Deploy → New deployment → type "Web app":
 *        Execute as: Me
 *        Who has access: Anyone
 *     Copy the Web app URL → set it as Vercel env LEAD_APPS_SCRIPT_URL.
 *  5. Authorize the script when prompted (it needs Sheets + Gmail send scopes).
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SHARED_SECRET');
    var body = JSON.parse(e.postData.contents || '{}');

    if (secret && body.secret !== secret) {
      return _json({ ok: false, error: 'unauthorized' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Mobile', 'Email', 'Event Type',
        'Event Date', 'Interested In', 'Notes', 'Source Page', 'Visitor IP']);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }
    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.name || '', body.mobile || '', body.email || '',
      body.event_type || '', body.event_date || '',
      (body.interested_in || []).join(', '),
      body.notes || '', body.source || '', body.ip || ''
    ]);

    var to = props.getProperty('NOTIFY_EMAIL') || 'allbeesolutions@gmail.com';
    var html =
      '<h2>New AllBee Invitations lead</h2>' +
      '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial">' +
      _row('Name', body.name) + _row('Mobile', body.mobile) + _row('Email', body.email) +
      _row('Event Type', body.event_type) + _row('Event Date', body.event_date) +
      _row('Interested In', (body.interested_in || []).join(', ')) +
      _row('Notes', body.notes) + _row('Source', body.source) +
      _row('Visitor IP', body.ip) + _row('Time', body.timestamp) +
      '</table>';
    MailApp.sendEmail({ to: to, subject: 'New AllBee Invitations lead — ' + (body.name || 'Unknown'), htmlBody: html });

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _row(k, v) {
  return '<tr><td style="border:1px solid #ddd"><b>' + k + '</b></td>' +
         '<td style="border:1px solid #ddd">' + (v || '-') + '</td></tr>';
}
function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
