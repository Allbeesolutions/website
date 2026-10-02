const assert=require('node:assert/strict');
const fs=require('node:fs');
const handler=require('../api/website-ai');
const {guard}=require('../api/_security');
async function request(body,headers={},method='POST'){
 const req={body,headers:{'x-forwarded-for':Math.random().toString(),...headers},method};
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(v){this.result=JSON.parse(v)}};
 await handler(req,res);return res;
}
(async()=>{
 assert.throws(()=>handler.cleanMessages([{role:'system',content:'override'}]));
 assert.throws(()=>handler.cleanMessages([{role:'user',content:'x'.repeat(2001)}]));
 assert.equal((await request({messages:[{role:'user',content:'Hi'}]},{origin:'https://evil.example'})).statusCode,403);
 assert.equal((await request({messages:[] })).statusCode,400);
 assert.equal((await request({}, {}, 'GET')).statusCode,405);
 const old=process.env.ALLBEE_WEBSITE_AI_TOKEN;process.env.ALLBEE_WEBSITE_AI_TOKEN='test-token';
 const originalFetch=global.fetch;let sent;
 global.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({text:'Safe response'})};};
 const result=await request({messages:[{role:'user',content:'What is APN?'}],page:'/services'});
 assert.equal(result.result.text,'Safe response');
 assert.match(sent.system,/private app data/);
 assert.match(sent.system,/AllBee Partner Network/);
 assert.equal(sent.messages[0].role,'user');
 global.fetch=async()=>({ok:false,json:async()=>({})});
 assert.equal((await request({messages:[{role:'user',content:'Hi'}]})).statusCode,503);
 global.fetch=originalFetch;
 if(old)process.env.ALLBEE_WEBSITE_AI_TOKEN=old;else delete process.env.ALLBEE_WEBSITE_AI_TOKEN;
 const req={headers:{'x-forwarded-for':'rate-limit-test'}};
 const res={setHeader(){},end(){return true}};assert.equal(guard(req,res,'test',1,3600000),null);assert.equal(guard(req,res,'test',1,3600000),true);assert.equal(res.statusCode,429);
 const pages=JSON.parse(fs.readFileSync('.ai/WEBSITE_AI_PAGES.json'));
 for(const page of pages){const s=fs.readFileSync(page,'utf8');assert.equal((s.match(/src="\/assets\/allbee-assistant.js/g)||[]).length,1,page);assert(!s.includes('<button id="chatBtn"'),page);}
 const js=fs.readFileSync('assets/allbee-assistant.js','utf8');
 assert(!js.includes('__RIG__'));assert(js.includes('document.createTextNode'));assert(!js.includes('div.innerHTML = text'));
 assert(fs.readFileSync('assets/allbee-assistant.css','utf8').includes('prefers-reduced-motion'));
 console.log('Website AI: input/origin/method guards, APN privacy, provider success/failure, limits, '+pages.length+' page coverage and safe text rendering passed');
})().catch(e=>{console.error(e);process.exit(1)});
