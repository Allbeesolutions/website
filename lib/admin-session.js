'use strict';
const { guard, noStore } = require('../api/_security');
const identity = require('./admin-identity');
module.exports = async (req, res) => {
  noStore(res);
  const m = identity.mode();
  if (m === 'invalid') {res.statusCode=503;return res.end(JSON.stringify({ok:false,error:'admin_not_configured'}));}
  const list = m === 'totp' ? identity.roster() : null;
  if (req.method === 'GET') {
    if (m !== 'totp') return res.end(JSON.stringify({ok:true,mode:'legacy'}));
    if (!list) {res.statusCode=503;return res.end(JSON.stringify({ok:false,mode:'totp',error:'admin_not_configured'}));}
    const user=identity.sessionFromRequest(req,list);
    return res.end(JSON.stringify({ok:true,mode:'totp',authenticated:!!user,scopes:user?user.scopes:[]}));
  }
  if (req.method !== 'POST') {res.statusCode=405;return res.end(JSON.stringify({ok:false,error:'method_not_allowed'}));}
  if (!identity.sameOrigin(req)) {res.statusCode=403;return res.end(JSON.stringify({ok:false,error:'origin_denied'}));}
  if (guard(req,res,'admin-session',8)) return;
  if(m !== 'totp') {res.statusCode=404;return res.end(JSON.stringify({ok:false,error:'not_enabled'}));}
  if(!list) {res.statusCode=503;return res.end(JSON.stringify({ok:false,error:'admin_not_configured'}));}
  let b=typeof req.body==='string' ? (()=>{try{return JSON.parse(req.body);}catch{return {};}})():req.body || {};
  if (!b || typeof b !== 'object' || Array.isArray(b)) b={};
  if(b.action==='logout') {res.setHeader('Set-Cookie',identity.cookie('',0));return res.end(JSON.stringify({ok:true}));}
  if(b.action!=='login' || typeof b.username!=='string' || typeof b.password!=='string' || typeof b.code!=='string'){
    res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'invalid_login'}));
  }
  const user=list.find(u=>u.id===b.username && u.active!==false);
  // Do the same expensive hash for unknown users to limit account enumeration.
  const fallback={salt:'00000000000000000000000000000000',hash:'0000000000000000000000000000000000000000000000000000000000000000'};
  const goodPass=identity.passwordValid(b.password,user||fallback);
  if (!user || !goodPass || !identity.totpValid(b.code,user.totp)) {
    console.warn('[admin-session] rejected login');
    res.statusCode=401;return res.end(JSON.stringify({ok:false,error:'invalid_credentials'}));
  }
  res.setHeader('Set-Cookie',identity.cookie(identity.issue(user),4*60*60));
  console.info('[admin-session] signed in',user.id);
  return res.end(JSON.stringify({ok:true,scopes:user.scopes}));
};
