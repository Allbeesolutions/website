#!/usr/bin/env node
// Offline, read-only isolated recovery verification. Never writes to a live API.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {keyFromEnv,encrypt,decrypt}=require('../lib/private-backup.js');
if(process.argv.length<3) {
 // Synthetic test verifies the recovery format without any private data.
 const key=crypto.randomBytes(32);
 const data={schema:'allbee-invitations-v1',createdAt:new Date().toISOString(),leads:[{id:'AB-TEST'}],orders:[{id:'ORD-TEST',status:'Payment Confirmed'}],reviews:[{id:'REV-TEST'}]};
 const blob=encrypt(data,key), recovered=decrypt(blob,key);
 if(JSON.stringify(data)!==JSON.stringify(recovered))throw new Error('Synthetic restore mismatch');
 const altered=JSON.parse(blob);altered.tag='AAAAAAAAAAAAAAAAAAAAAA';
 try{decrypt(JSON.stringify(altered),key);throw new Error('Tamper detection missing');}
 catch(e){if(e.message==='Tamper detection missing')throw e;}
 console.log('Encrypted backup restore: synthetic read/compare and tamper-rejection PASS (not a live restore)');
}else{
 const key=keyFromEnv();
 const content=fs.readFileSync(process.argv[2],{encoding:'utf8'});
 const restored=decrypt(content,key);
 console.log('Isolated encrypted backup verification PASS; records: '+['leads','orders','reviews'].map(k=>`${k}=${restored[k].length}`).join(', '));
 console.log('No plaintext files exported and no live Sheets or Drive data modified.');
}
