#!/usr/bin/env node
// Conservative dependency-free secret heuristics. Outputs only category/path, never values.
// Run with --history locally to examine tracked Git diffs as well as current code.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const git=(args,maxBuffer=40*1024*1024)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer});
const patterns=[
  ['private_key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['github_token',/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ['aws_access_key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['stripe_live_secret',/\bsk_live_[A-Za-z0-9]{16,}\b/],
  ['slack_bot_token',/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ['password_in_uri',/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/:@]+:[^\s@]{4,}@/],
  ['generic_secret_assignment',/\b(?:RAZORPAY_KEY_SECRET|CLERK_SECRET_KEY|LEAD_SHARED_SECRET|ADMIN_PASSCODE|STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*['"][^'"\s]{12,}['"]/]
];
const ignored=(name)=>/(?:^|\/)(?:node_modules|\.git|\.vercel|vendor|\.ai)\//.test(name);
const eligible=(name)=>/\.(?:js|cjs|mjs|ts|tsx|html?|json|ya?ml|md|txt|sh|env)$/i.test(name)||/\.env(?:\.|$)/.test(name);
const synthetic=(line)=>/regression|synthetic|example\.invalid|example\.com|\.example|placeholder|fake[_-]?key|test[_-]?secret/i.test(line);
const found=new Map();
function scan(content,path){
  if(ignored(path)||!eligible(path))return;
  for(const [kind,regex] of patterns){
    const lines=content.split('\n');
    for(let i=0;i<lines.length;i++){
      if(regex.test(lines[i])&&!synthetic(lines[i])){
        const key=kind+'|'+path;
        if(!found.has(key))found.set(key,{kind,path});
      }
    }
  }
}
for(const path of git(['ls-files','--cached','--full-name','-z']).split('\0').filter(Boolean)){
  try{const raw=readFileSync(resolve(root,path));if(raw.length<512*1024&&!raw.includes(0))scan(raw.toString('utf8'),path);}catch{}
}
let historical=false;
if(process.argv.includes('--history')){
 historical=true;
 const diff=git(['log','--all','--format=','--unified=0','-p','--','*.js','*.cjs','*.mjs','*.ts','*.tsx','*.html','*.json','*.yml','*.yaml','*.env*','*.sh','*.md'],100*1024*1024);
 let path='';
 for(const line of diff.split('\n')){
   if(line.startsWith('+++ b/'))path=line.slice(6);
   else if(line.startsWith('+')&&!line.startsWith('+++'))scan(line.slice(1),path);
 }
}
const issues=[...found.values()].sort((a,b)=>a.path.localeCompare(b.path));
if(issues.length){
 console.error('Potential private credential patterns detected (values REDACTED):');
 for(const x of issues.slice(0,35))console.error(` - ${x.kind}: ${x.path}`);
 if(issues.length>35)console.error(` - ${issues.length-35} additional locations`);
 process.exitCode=1;
}else console.log(`Secret pattern scan: no high-confidence matches (${historical?'tracked source + Git diff history':'tracked source'}; heuristic, not a full proof)`);
