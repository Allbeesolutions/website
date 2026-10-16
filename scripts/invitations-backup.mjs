#!/usr/bin/env node
// READ-ONLY data collection; writes one AES-256-GCM encrypted file locally.
// No production mutation, no plaintext snapshots or file contents on stdout.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {keyFromEnv,encrypt}=require('../lib/private-backup.js');
const key=keyFromEnv();
const endpoint=process.env.LEAD_APPS_SCRIPT_URL, secret=process.env.LEAD_SHARED_SECRET;
if(!endpoint || !secret || !/^https:\/\//.test(endpoint)) throw new Error('Set the real LEAD_APPS_SCRIPT_URL and LEAD_SHARED_SECRET in a trusted local environment');
const datasets={leads:'list',orders:'order_list',reviews:'review_list'};
const snapshot={schema:'allbee-invitations-v1',createdAt:new Date().toISOString()};
for(const [name,action] of Object.entries(datasets)){
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,secret}),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Backup read failed for ${name}`);
 const result=await response.json();
 if(result?.ok!==true || !Array.isArray(result[name])) throw new Error(`Invalid private ${name} export`);
 snapshot[name]=result[name];
}
const output=path.resolve('.private-backups');
fs.mkdirSync(output,{recursive:true,mode:0o700});
fs.chmodSync(output,0o700);
const filename='allbee-invitations-'+new Date().toISOString().replace(/[:.]/g,'-')+'.enc.json';
const full=path.join(output,filename);
fs.writeFileSync(full,encrypt(snapshot,key),{flag:'wx',mode:0o600});
console.log('Encrypted backup created at '+full+'; records: '+Object.entries(datasets).map(([k])=>`${k}=${snapshot[k].length}`).join(', '));
console.log('No live records were changed. Test the encrypted backup with scripts/invitations-restore-check.mjs.');
