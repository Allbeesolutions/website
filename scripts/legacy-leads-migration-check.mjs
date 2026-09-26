#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const legacyHeaders = ['Timestamp','Name','Mobile','Email','Event Type','Event Date',
  'Interested In','Notes','Source Page','Visitor IP'];
const original = [
  legacyHeaders,
  ['2026-06-24T12:00:00Z','Asha','9876543210','a@example.com','Wedding','2027-01-03','Invite','Note','/invitation','127.0.0.1'],
  ['2026-06-25T12:00:00Z','Bina','9123456780','','Birthday','','Template','','/contact','127.0.0.2'],
];
const sheets = new Map();
function createSheet(name, input, columns=10) {
  const rows = input.map(row => [...row]);
  const sheet = {
    name, rows, columns,
    getLastRow: () => rows.length,
    getMaxColumns: () => sheet.columns,
    getDataRange: () => ({ getValues: () => rows.map(row => [...row]) }),
    getRange: (r,c,n=1,m=1) => ({
      getValue: () => rows[r-1]?.[c-1],
      getValues: () => Array.from({length:n},(_,i) =>
        Array.from({length:m},(_,j) => rows[r+i-1]?.[c+j-1] ?? '')),
      setValues: values => { for(let i=0;i<n;i++) {
        rows[r+i-1] ||= []; for(let j=0;j<m;j++) rows[r+i-1][c+j-1]=values[i][j];
      } },
      setFontWeight: () => {},
    }),
    insertColumnBefore: c => { for(const row of rows) row.splice(c-1,0,''); sheet.columns++; },
    insertColumnsAfter: (_c,n) => { sheet.columns+=n; },
    appendRow: row => rows.push([...row]),
    copyTo: () => {
      const copy=createSheet('temporary',rows,sheet.columns);
      return { setName: newName => { sheets.delete('temporary'); copy.name=newName; sheets.set(newName,copy); return copy; } };
    },
  };
  sheets.set(name,sheet);
  return sheet;
}
const leads = createSheet('Leads',original);
let locks=0;
const context = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({
    getSheetByName: name => sheets.get(name),
    insertSheet: name => createSheet(name,[],18),
  }) },
  LockService: { getScriptLock: () => ({
    tryLock: () => { locks++; return true; },
    releaseLock: () => { locks--; },
  }) },
  Utilities: { formatString: (_fmt,n) => String(n).padStart(4,'0') },
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../docs/lead-apps-script.gs',import.meta.url),'utf8'),context);
assert.equal(context.migrateLegacyLeads_(),true);
assert.equal(locks,0);
assert.deepEqual(leads.rows[0].slice(0,18),Array.from(context.HEADERS));
assert.equal(leads.rows[1][0],'AB-0001');
assert.equal(leads.rows[2][0],'AB-0002');
assert.deepEqual(leads.rows[1].slice(1,11),original[1]);
assert.equal(leads.rows[1][11],'New Lead');
assert.deepEqual(sheets.get('Leads backup 2026-09-26').rows,original);
assert.equal(context.migrateLegacyLeads_(),false);
assert.equal(sheets.size,2);
assert.equal(context.rowsToLeads_(context.sheet_())[0].name,'Asha');
assert.equal(context.rowsToLeads_(context.sheet_())[1].mobile,'9123456780');
const weird=createSheet('Leads',[['unexpected',...legacyHeaders.slice(1)]]);
assert.throws(() => context.migrateLegacyLeads_(),/unknown_leads_schema/);
assert.equal(locks,0);
assert.equal(weird.rows[0][0],'unexpected');
console.log('Legacy leads: backed-up migration, mapping, idempotence and unknown-schema guard passed');
