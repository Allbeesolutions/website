/**
 * AllBee Invitations — Orders admin data API (Vercel Serverless Function).
 * Reads/writes the "Orders" sheet via Apps Script (order_list / order_update).
 * Passcode-gated (ADMIN_PASSCODE). Future-ready: swap to Supabase later.
 *
 * Env: ADMIN_PASSCODE, LEAD_APPS_SCRIPT_URL, LEAD_SHARED_SECRET
 */
function authed(req){
  const pass=req.headers['x-admin-pass']||'', exp=process.env.ADMIN_PASSCODE||'';
  if(!exp) return {ok:false,code:503,error:'crm_not_configured'};
  if(pass.length!==exp.length) return {ok:false,code:401,error:'unauthorized'};
  let d=0; for(let i=0;i<exp.length;i++) d|=pass.charCodeAt(i)^exp.charCodeAt(i);
  return d===0?{ok:true}:{ok:false,code:401,error:'unauthorized'};
}
async function callScript(payload){
  const url=process.env.LEAD_APPS_SCRIPT_URL; if(!url) return null;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,secret:process.env.LEAD_SHARED_SECRET||''})});
  if(!r.ok) throw new Error('apps-script HTTP '+r.status); return r.json();
}
module.exports=async(req,res)=>{
  res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-store');
  const a=authed(req); if(!a.ok){res.statusCode=a.code;return res.end(JSON.stringify({ok:false,error:a.error}));}
  try{
    if(req.method==='GET'){
      const d=await callScript({action:'order_list'});
      if(!d){res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:false,orders:[]}));}
      res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:true,orders:d.orders||[]}));
    }
    if(req.method==='POST'){
      let b=req.body; try{if(typeof b==='string')b=JSON.parse(b||'{}');}catch{b={}}
      if(!b||b.action!=='update'||!b.id){res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'bad_request'}));}
      const d=await callScript({action:'order_update',id:b.id,patch:b.patch||{}});
      if(!d){res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:false}));}
      res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:true}));
    }
    res.statusCode=405;return res.end(JSON.stringify({ok:false,error:'method_not_allowed'}));
  }catch(e){console.error('[orders] error:',String(e.message||e));res.statusCode=502;return res.end(JSON.stringify({ok:false,error:'upstream_error'}));}
};
