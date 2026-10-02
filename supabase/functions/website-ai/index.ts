const TOKEN_HASH = "7893d411cc0f16c51cebc8c6d265da8b7ebeadfc524f69fd57444567817ff8ca";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async (req: Request) => {
 if(req.method!=="POST") return json({error:"Use POST"},405);
 const token=req.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,"0")).join("");
 if(digest!==TOKEN_HASH) return json({error:"Unauthorized"},401);
 try {
  const raw=await req.text();
  if(raw.length>48000) return json({error:"Too large"},413);
  const body=JSON.parse(raw);
  if(!Array.isArray(body.messages)||body.messages.length>13||typeof body.system!=="string"||body.system.length>16000) return json({error:"Invalid request"},400);
  const messages=[{role:"system",content:body.system},...body.messages.map((m:{role:string,content:string})=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content||"").slice(0,2000)}))];
  const key=Deno.env.get("GROQ_API_KEY");
  if(!key) return json({error:"AI unavailable"},503);
  for(const model of ["openai/gpt-oss-120b","openai/gpt-oss-20b","llama-3.1-8b-instant"]){
   try {
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({model,messages,max_tokens:900,temperature:.35}),signal:AbortSignal.timeout(12000)});
    const data=await r.json();const text=data?.choices?.[0]?.message?.content?.trim();
    if(r.ok&&text) return json({text});
   }catch{}
  }
  return json({error:"AI temporarily busy"},503);
 } catch {return json({error:"Invalid request"},400);}
});
