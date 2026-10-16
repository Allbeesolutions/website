#!/usr/bin/env node
// No live API calls or real secrets. Tests the opt-in MFA mode and legacy mode.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {adminAuth}=require('../api/_security.js');
const identity=require('../lib/admin-identity.js');
const endpoint=require('../api/admin-session.js');
const old={};for(const name of ['ADMIN_AUTH_MODE','ADMIN_USERS_JSON','ADMIN_SESSION_SECRET','ADMIN_PASSCODE'])old[name]=process.env[name];
let count=0;
const ok=(v)=>{assert.ok(v);count++;};
const eq=(a,b)=>{assert.equal(a,b);count++;};
const password='Synthetic-demo-password-39344';
const salt='023456789abcdef0123456789abcdef0';
const secret='JBSWY3DPEHPK3PXP';
const hash=crypto.pbkdf2Sync(password,Buffer.from(salt,'hex'),310000,32,'sha256').toString('hex');
const admin={id:'testowner',salt,hash,totp:secret,scopes:['leads','orders','reviews','overview'],version:1};
const staff={...admin,id:'teststaff',scopes:['reviews'],version:2};
process.env.ADMIN_PASSCODE='legacy-regression-pass';
process.env.ADMIN_AUTH_MODE='legacy';
eq(adminAuth({headers:{'x-admin-pass':'legacy-regression-pass'}},'reviews').ok,true);
eq(adminAuth({headers:{}},'reviews').code,401);
process.env.ADMIN_AUTH_MODE='totp';
process.env.ADMIN_SESSION_SECRET='this-is-a-long-synthetic-signing-key-which-is-not-live';
process.env.ADMIN_USERS_JSON=JSON.stringify([admin,staff]);
ok(identity.roster());
ok(identity.passwordValid(password,admin));
eq(identity.passwordValid('invalid-wrong-pass',admin),false);
function otp(time=Date.now()) {
 const key=Buffer.from('48656c6c6f21deadbeef','hex');
 // Test with production helper's Base32 secret bytes, independently decoded.
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let value=0,bits=0;const bytes=[];
 for(const ch of secret){value=(value<<5)|alphabet.indexOf(ch);bits+=5;if(bits>=8){bits-=8;bytes.push((value>>>bits)&255);}}
 const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(time/30000)));
 const hmac=crypto.createHmac('sha1',Buffer.from(bytes)).update(counter).digest();const offset=hmac[19]&15;
 return String((hmac.readUInt32BE(offset)&0x7fffffff)%1e6).padStart(6,'0');
}
ok(identity.totpValid(otp(),secret));
eq(identity.totpValid('0000000',secret),false);
const origin={'content-type':'application/json',origin:'https://www.allbeesolutions.com',host:'www.allbeesolutions.com','sec-fetch-site':'same-origin'};
function reply(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},end(v){this.payload=JSON.parse(v);}};}
async function send(method,body,headers=origin){const res=reply();await endpoint({method,body,headers},res);return res;}
let r=await send('GET',null,{});eq(r.payload.mode,'totp');eq(r.payload.authenticated,false);
r=await send('POST',{action:'login',username:admin.id,password,code:otp()}, {...origin,origin:'https://attacker.invalid'});
eq(r.statusCode,403);
r=await send('POST',{action:'login',username:admin.id,password,code:otp()}, {host:'www.allbeesolutions.com'});eq(r.statusCode,403);
r=await send('POST',{action:'login',username:'nonexisting',password,code:otp()});eq(r.statusCode,401);
r=await send('POST',{action:'login',username:admin.id,password:'totally-wrong',code:otp()});eq(r.statusCode,401);
r=await send('POST',{action:'login',username:admin.id,password,code:otp()});eq(r.statusCode,200);
const cookie=r.headers['Set-Cookie'];ok(cookie.includes('HttpOnly; Secure; SameSite=Strict'));ok(cookie.startsWith('__Host-allbee_admin='));
const sessionCookie=cookie.split(';')[0];
r=await send('GET',null,{cookie:sessionCookie});eq(r.payload.authenticated,true);
const request={method:'POST',headers:{...origin,cookie:sessionCookie}};
eq(adminAuth(request,'orders').ok,true);
eq(adminAuth(request,'reviews').ok,true);
eq(adminAuth({method:'POST',headers:{...request.headers,origin:'https://other.invalid'}},'orders').code,403);
eq(adminAuth({method:'GET',headers:{cookie:sessionCookie.slice(0,-1)+'a'}},'orders').code,401);
const expired=identity.sessionFromRequest({headers:{cookie:sessionCookie}},identity.roster(),Date.now()+5*60*60*1000);eq(expired,null);
r=await send('POST',{action:'logout'}, {...origin,cookie:sessionCookie});eq(r.statusCode,200);ok(r.headers['Set-Cookie'].includes('Max-Age=0'));
r=await send('POST',{action:'login',username:staff.id,password,code:otp()});eq(r.statusCode,200);
const staffCookie=r.headers['Set-Cookie'].split(';')[0];
eq(adminAuth({method:'GET',headers:{cookie:staffCookie}},'orders').code,403);
eq(adminAuth({method:'GET',headers:{cookie:staffCookie}},'reviews').ok,true);
process.env.ADMIN_USERS_JSON=JSON.stringify([admin,{...staff,active:false}]);
eq(adminAuth({method:'GET',headers:{cookie:staffCookie}},'reviews').code,401);
process.env.ADMIN_USERS_JSON=JSON.stringify([{...admin,version:3},staff]);
eq(adminAuth({method:'GET',headers:{cookie:sessionCookie}},'orders').code,401);
process.env.ADMIN_USERS_JSON=JSON.stringify([{...admin,scopes:[]},staff]);
eq(identity.roster(),null);
process.env.ADMIN_AUTH_MODE='unsupported';
eq(adminAuth({headers:{'x-admin-pass':'legacy-regression-pass'}},'reviews').code,503);
process.env.ADMIN_AUTH_MODE='totp';
process.env.ADMIN_USERS_JSON=JSON.stringify([admin,staff]);
process.env.ADMIN_SESSION_SECRET='short';
eq(identity.roster(),null);
for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
console.log(`Admin MFA: ${count} synthetic checks passed (legacy, login, TOTP, scoped cookies, CSRF, revocation)`);
