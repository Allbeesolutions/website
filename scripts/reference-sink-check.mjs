#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const leadRows = [['Lead ID'], ['AB-0001']];
const refs = [['Lead ID','Uploaded','File ID','Filename','MIME','Bytes']];
let created = 0, trashed = 0;
function sheet(rows) {
  return {
    getLastRow: () => rows.length,
    getDataRange: () => ({ getValues: () => rows }),
    appendRow: (row) => rows.push(row),
    getRange: () => ({ setFontWeight: () => {} }),
  };
}
const ss = { getSheetByName: (name) => name === 'Leads' ? sheet(leadRows) : name === 'References' ? sheet(refs) : null };
const context = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ss },
  DriveApp: { getFolderById: (id) => {
    assert.equal(id, 'private-folder');
    return { createFile: () => { created++; return { getId: () => 'file-' + created, setTrashed: () => trashed++ }; } };
  } },
  Utilities: {
    base64Decode: (s) => Array.from(Buffer.from(s, 'base64')),
    newBlob: (_bytes, mime, name) => { assert.equal(mime, 'image/png'); assert.ok(name.startsWith('AB-0001-')); return {}; },
    getUuid: () => '12345678-0000',
  },
  Date, String, Number, Object, Array,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../docs/lead-apps-script.gs', import.meta.url), 'utf8'), context);
const bytes = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(24)]);
const input = { lead_id:'AB-0001', filename:'photo.png', mime:'image/png', data:bytes.toString('base64') };
const props = { getProperty: () => 'private-folder' };
assert.equal(context.referenceUpload_({ ...input, lead_id:'AB-9999' }, props).error, 'invalid_lead');
assert.equal(context.referenceUpload_({ ...input, data:Buffer.alloc(32).toString('base64') }, props).error, 'invalid_image');
for (let i = 0; i < 3; i++) assert.equal(context.referenceUpload_(input, props).ok, true);
assert.equal(context.referenceUpload_(input, props).error, 'limit_reached');
assert.equal(refs.length, 4);
assert.equal(created, 3);
assert.equal(trashed, 0);
console.log('Reference sink: lead, image, private file and three-image limit passed');
