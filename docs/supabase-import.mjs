#!/usr/bin/env node
/**
 * AllBee Invitations — CSV → Supabase importer (migration prep, not run yet).
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node docs/supabase-import.mjs <csv> <leads|orders>
 *
 * Upserts on the primary key (id), so re-running is safe. Maps the Google-Sheets
 * header names to the Postgres column names defined in supabase-schema.sql.
 */
import fs from 'fs';

const [csvPath, table] = process.argv.slice(2);
const URL = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
if (!csvPath || !table) { console.error('usage: node supabase-import.mjs <csv> <leads|orders>'); process.exit(1); }
if (!URL || !KEY) { console.error('set SUPABASE_URL and SUPABASE_SERVICE_KEY'); process.exit(1); }
if (!['leads', 'orders'].includes(table)) { console.error('table must be leads or orders'); process.exit(1); }

// minimal CSV parser (handles quoted fields, commas, newlines, "" escapes)
function parseCSV(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i+1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') {} else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length && r.some(x => x !== ''));
}

// Sheet header → column maps
const MAP = {
  leads: { 'Lead ID':'id','Timestamp':'created_at','Name':'name','Mobile':'mobile','Email':'email','Event Type':'event_type','Event Date':'event_date','Interested In':'interested_in','Notes':'notes','Source Page':'source','Visitor IP':'ip','Status':'status','Value':'value','CRM Notes':'crm_notes','Updated':'updated_at','Template ID':'template_id','Template Name':'template_name','Demo':'demo' },
  orders: { 'Order ID':'id','Date':'order_date','Name':'name','Mobile':'mobile','Email':'email','Event Type':'event_type','Invitation Type':'invitation_type','Package':'package','Amount':'amount','Payment ID':'payment_id','Status':'status','Source':'source','Lead ID':'lead_id','Template ID':'template_id','Template Name':'template_name','Demo':'demo','Notes':'notes','Updated':'updated_at','Assignee':'assignee','Delivery':'delivery' },
};

const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const header = rows.shift();
const map = MAP[table];
const records = rows.map(r => {
  const o = {};
  header.forEach((h, i) => { const col = map[h.trim()]; if (col) { let v = r[i]; if (v === '') v = null; o[col] = v; } });
  return o;
}).filter(o => o.id);

console.log(`Parsed ${records.length} ${table} rows. Upserting…`);
const res = await fetch(`${URL}/rest/v1/${table}?on_conflict=id`, {
  method: 'POST',
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(records),
});
if (res.ok) console.log(`✓ Imported ${records.length} rows into ${table}.`);
else console.error(`✗ Import failed (${res.status}):`, await res.text());
