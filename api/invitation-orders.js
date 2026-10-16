/**
 * AllBee Invitations — Orders admin data API (Vercel Serverless Function).
 * Reads/writes the "Orders" sheet via Apps Script (order_list / order_update).
 * Passcode-gated (ADMIN_PASSCODE). Future-ready: swap to Supabase later.
 *
 * Env: ADMIN_PASSCODE, LEAD_APPS_SCRIPT_URL, LEAD_SHARED_SECRET
 */
const { guard, noStore, adminAuth } = require('./_security');
const { cellFields } = require('../lib/sheet-safety');
const ORDER_STATUSES=['Order Placed','Payment Confirmed','Details Submitted','Designing','First Preview Ready','Revision Requested','Revision In Progress','Final Approval','Delivered','Payment Failed','Refunded','Cancelled'];
async function callScript(payload){
  const url=process.env.LEAD_APPS_SCRIPT_URL; if(!url || !process.env.LEAD_SHARED_SECRET) throw new Error('orders data layer not configured');
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,secret:process.env.LEAD_SHARED_SECRET||''})});
  if(!r.ok) throw new Error('apps-script HTTP '+r.status); return r.json();
}
module.exports=async(req,res)=>{
  noStore(res);
  const blocked = guard(req, res, 'invitation-orders', 20); if (blocked) return;
  const a=adminAuth(req); if(!a.ok){res.statusCode=a.code;return res.end(JSON.stringify({ok:false,error:a.error}));}
  try{
    if(req.method==='GET'){
      const d=await callScript({action:'order_list'});
      if(!d){res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:false,orders:[]}));}
      if(d.ok!==true||!Array.isArray(d.orders)){res.statusCode=502;return res.end(JSON.stringify({ok:false,error:'upstream_error'}));}
      res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:true,orders:d.orders||[]}));
    }
    if(req.method==='POST'){
      let b=req.body; try{if(typeof b==='string')b=JSON.parse(b||'{}');}catch{b={}}
      if(!b||b.action!=='update'||!b.id){res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'bad_request'}));}
      const patch=b.patch;
      if(typeof b.id!=='string'||!/^[A-Za-z0-9_-]{1,48}$/.test(b.id)||!patch||typeof patch!=='object'||Array.isArray(patch)||!Object.keys(patch).length||Object.keys(patch).some(k=>!['status','notes','assignee','delivery'].includes(k))||['notes','assignee','delivery'].some(k=>patch[k]!==undefined&&(typeof patch[k]!=='string'||patch[k].length>5000))){res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'invalid_patch'}));}
      if(patch.status!==undefined && !ORDER_STATUSES.includes(String(patch.status))) {res.statusCode=422;return res.end(JSON.stringify({ok:false,error:'invalid_status'}));} const d=await callScript({action:'order_update',id:b.id,patch:cellFields(patch,['notes','assignee','delivery'])});
      if(!d||d.ok!==true){res.statusCode=502;return res.end(JSON.stringify({ok:false,error:'upstream_error'}));}
      res.statusCode=200;return res.end(JSON.stringify({ok:true,configured:true}));
    }
    res.statusCode=405;return res.end(JSON.stringify({ok:false,error:'method_not_allowed'}));
  }catch(e){console.error('[orders] error:',String(e.message||e));res.statusCode=502;return res.end(JSON.stringify({ok:false,error:'upstream_error'}));}
};
