#!/usr/bin/env node
// Run LOCALLY in an interactive, trusted terminal. Never paste its output into chat.
// No network calls, no automatic deployment or production account creation.
import crypto from 'node:crypto';
import fs from 'node:fs';
import readline from 'node:readline/promises';
import process from 'node:process';
const output = '.admin-mfa.private.json';
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('Interactive local terminal required. No credentials created.');process.exit(2);
}
if(fs.existsSync(output)) { console.error('Private setup file already exists; refusing to overwrite it.');process.exit(2); }
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
function base32(bytes){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits=0,v=0,out='';for(const byte of bytes){v=(v<<8)|byte;bits+=8;while(bits>=5){bits-=5;out+=chars[(v>>>bits)&31];}}if(bits)out+=chars[(v<<(5-bits))&31];return out;}
function secureInput(prompt){return new Promise((resolve,reject)=>{
 process.stdout.write(prompt);
 const stdin=process.stdin;stdin.setRawMode(true);stdin.resume();
 let secret='';
 const onData=(chunk)=>{const bytes=Buffer.from(chunk);for(const c of bytes){if(c===3){finish();reject(new Error('Cancelled'));return;}if(c===13||c===10){finish();resolve(secret);return;}if(c===127||c===8){secret=secret.slice(0,-1);continue;}if(c>=32&&c<=126)secret+=String.fromCharCode(c);}};
 function finish(){stdin.off('data',onData);stdin.setRawMode(false);stdin.pause();process.stdout.write('\n');}
 stdin.on('data',onData);
});}
try {
 const input=(await rl.question('Owner admin username (letters, digits, _ or -; default Hajihaz): ')).trim()||'Hajihaz';
 if(!/^[a-zA-Z0-9_-]{3,50}$/.test(input)) throw new Error('Invalid username');
 // Close the line editor completely before reading secret keystrokes.
 // Leaving it attached could echo passwords while raw input is collected.
 rl.close();
 const password=await secureInput('Choose a unique password (16+ chars, hidden): ');
 const confirm=await secureInput('Repeat password (hidden): ');
 if(password.length<16||password.length>256||password!==confirm)throw new Error('Password too short, too long, or does not match');
 const salt=crypto.randomBytes(16).toString('hex');
 const hash=crypto.pbkdf2Sync(password,Buffer.from(salt,'hex'),310000,32,'sha256').toString('hex');
 const totp=base32(crypto.randomBytes(20));
 const list=[{id:input,active:true,version:1,scopes:['leads','orders','reviews','overview'],salt,hash,totp}];
 const uri=`otpauth://totp/${encodeURIComponent('AllBee:'+input)}?secret=${totp}&issuer=AllBee&algorithm=SHA1&digits=6&period=30`;
 const deployment={ADMIN_AUTH_MODE:'totp',ADMIN_SESSION_SECRET:crypto.randomBytes(48).toString('base64url'),ADMIN_USERS_JSON:JSON.stringify(list)};
 // Sensitive data is written ONLY to this chmod-0600 file, ignored by Git.
 fs.writeFileSync(output,JSON.stringify({deployment,authenticatorEnrollmentURI:uri,account:input},null,2)+'\n',{flag:'wx',mode:0o600});
 console.log('Prepared private owner identity at '+output+'. Do not commit, upload or send this file.');
 console.log('Scan the authenticatorEnrollmentURI privately and validate login on Preview before changing Production.');
} catch(err) { console.error(err.message);process.exitCode=1; }
finally {rl.close();}
