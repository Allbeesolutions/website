/* Shared public AllBee assistant. Artwork and rig reused from AllBee App. */
(function(){
 'use strict';
 if(document.getElementById('allbee-assistant'))return;
 const rig="<svg class=\"allbee-mascot-rig\" viewBox=\"-120 -30 1234 1090\" focusable=\"false\" aria-hidden=\"true\">\n    <defs>\n      <image id=\"ab-art\" href=\"/assets/allbee-ai-mascot.webp\" width=\"1054\" height=\"990\" />\n      <clipPath id=\"ab-body\"><path d=\"M597 0C793-10 930 103 954 296C986 511 817 710 593 714C375 721 236 583 222 380C209 189 279 75 459 20C503 7 555 2 597 0Z\" /></clipPath>\n      <clipPath id=\"ab-left-arm\"><path d=\"M-8 0H327L311 154 250 245 245 292 298 330 307 421 268 447 167 434 68 369-8 286Z\" /></clipPath>\n      <clipPath id=\"ab-left-hand\"><path d=\"M-8 0H327L311 155 255 236 222 278 163 294 80 280-8 254Z\" /></clipPath>\n      <clipPath id=\"ab-right-arm\"><path d=\"M920 440L1064 460V745H803L807 580 849 547 895 531Z\" /></clipPath>\n      <clipPath id=\"ab-right-hand\"><path d=\"M925 523L1059 559V748H803L808 591 849 552Z\" /></clipPath>\n      <clipPath id=\"ab-left-leg\"><path d=\"M418 626L507 650 499 734 523 815 515 999H155V750L312 703 382 669Z\" /></clipPath>\n      <clipPath id=\"ab-right-leg\"><path d=\"M621 670L707 674 756 763 894 864 914 999H559V800Z\" /></clipPath>\n      <clipPath id=\"ab-mouth\"><path d=\"M537 302C575 321 625 351 683 341C730 339 680 429 607 423C550 421 510 363 524 319C528 307 532 301 537 302Z\" /></clipPath>\n      <mask id=\"ab-forearm-left\" maskUnits=\"userSpaceOnUse\" x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\"><rect x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\" fill=\"white\" /><path d=\"M-8 0H327L311 155 255 236 222 278 163 294 80 280-8 254Z\" fill=\"black\" /></mask>\n      <mask id=\"ab-forearm-right\" maskUnits=\"userSpaceOnUse\" x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\"><rect x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\" fill=\"white\" /><path d=\"M925 523L1059 559V748H803L808 591 849 552Z\" fill=\"black\" /></mask>\n      <mask id=\"ab-face\" maskUnits=\"userSpaceOnUse\" x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\"><rect x=\"-60\" y=\"-30\" width=\"1174\" height=\"1090\" fill=\"white\" /><path d=\"M537 302C575 321 625 351 683 341C730 339 680 429 607 423C550 421 510 363 524 319C528 307 532 301 537 302Z\" fill=\"black\" /></mask>\n      <linearGradient id=\"ab-skin\" x1=\"0\" y1=\"0\" x2=\".4\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff\" /><stop offset=\"1\" stop-color=\"#f8f8fc\" /></linearGradient>\n    </defs>\n    <g class=\"allbee-mascot-body\">\n      <g class=\"allbee-mascot-leg allbee-mascot-leg--left\"><use href=\"#ab-art\" clip-path=\"url(#ab-left-leg)\" /></g>\n      <g class=\"allbee-mascot-leg allbee-mascot-leg--right\"><use href=\"#ab-art\" clip-path=\"url(#ab-right-leg)\" /></g>\n      <g class=\"allbee-mascot-arm allbee-mascot-arm--left\">\n        <use href=\"#ab-art\" clip-path=\"url(#ab-left-arm)\" mask=\"url(#ab-forearm-left)\" />\n        <g class=\"allbee-mascot-hand allbee-mascot-hand--left\"><use href=\"#ab-art\" clip-path=\"url(#ab-left-hand)\" /></g>\n      </g>\n      <g class=\"allbee-mascot-arm allbee-mascot-arm--right\">\n        <use href=\"#ab-art\" clip-path=\"url(#ab-right-arm)\" mask=\"url(#ab-forearm-right)\" />\n        <g class=\"allbee-mascot-hand allbee-mascot-hand--right\"><use href=\"#ab-art\" clip-path=\"url(#ab-right-hand)\" /></g>\n      </g>\n      <g class=\"allbee-mascot-face\">\n        <path d=\"M537 302C575 321 625 351 683 341C730 339 680 429 607 423C550 421 510 363 524 319C528 307 532 301 537 302Z\" fill=\"url(#ab-skin)\" />\n        <use href=\"#ab-art\" clip-path=\"url(#ab-body)\" mask=\"url(#ab-face)\" />\n        <g class=\"allbee-mascot-mouth\"><use href=\"#ab-art\" clip-path=\"url(#ab-mouth)\" /></g>\n        <g class=\"allbee-mascot-eyelid allbee-mascot-eyelid--left\">\n          <ellipse cx=\"515\" cy=\"216\" rx=\"73\" ry=\"85\" transform=\"rotate(19 515 216)\" fill=\"url(#ab-skin)\" />\n          <path d=\"M468 221Q510 257 565 233\" fill=\"none\" stroke=\"#162338\" stroke-width=\"7\" stroke-linecap=\"round\" />\n        </g>\n        <g class=\"allbee-mascot-eyelid allbee-mascot-eyelid--right\">\n          <ellipse cx=\"750\" cy=\"277\" rx=\"69\" ry=\"77\" transform=\"rotate(19 750 277)\" fill=\"url(#ab-skin)\" />\n          <path d=\"M708 279Q749 309 793 286\" fill=\"none\" stroke=\"#162338\" stroke-width=\"7\" stroke-linecap=\"round\" />\n        </g>\n      </g>\n    </g>\n  </svg>";
 const root=document.createElement('div');root.id='allbee-assistant';
 root.innerHTML='<div class="ab-launcher"><div class="ab-greeting" hidden role="status"></div><button id="chatBtn" type="button" aria-label="Open AllBee AI assistant" aria-expanded="false" aria-controls="chatWindow"><span class="allbee-mascot allbee-mascot--idle" aria-hidden="true"><img class="allbee-mascot-static" src="/assets/allbee-ai-mascot.webp" alt="" width="1054" height="990">'+rig+'</span></button></div><aside id="chatWindow" class="ab-chat" role="dialog" aria-label="AllBee AI assistant" aria-hidden="true" hidden><header><img src="/assets/allbee-ai-mascot.webp" alt="" width="42" height="42"><div><strong>ALLBEE AI</strong><span>Website help · APN guidance · Ask anything</span></div><button type="button" class="ab-reset" aria-label="Start a new chat">↻</button><button type="button" class="ab-close" aria-label="Close chat">×</button></header><div id="chatMsgs" role="log" aria-label="Conversation" aria-live="polite"></div><div class="ab-quick"><button type="button" data-question="What services does AllBee offer?">Services</button><button type="button" data-question="Tell me about AllBee courses">Courses</button><button type="button" data-question="How do I order an invitation?">Invitations</button><button type="button" data-question="What is APN and how do I join?">APN</button></div><div class="ab-chat-status" role="status"></div><form class="ab-composer"><label class="sr-only" for="chatInput">Ask ALLBEE AI</label><textarea id="chatInput" rows="1" maxlength="2000" placeholder="Ask ALLBEE AI…" autocomplete="off"></textarea><button class="ab-stop" type="button" hidden>Stop</button><button id="chatSend" type="submit" aria-label="Send message">↑</button></form><p class="ab-note">AI can make mistakes. Confirm prices and account details with AllBee.</p></aside>';
 document.body.appendChild(root);
 const launcher=root.querySelector('.ab-launcher'),mascot=root.querySelector('.allbee-mascot'),greeting=root.querySelector('.ab-greeting'),btn=root.querySelector('#chatBtn'),panel=root.querySelector('#chatWindow'),input=root.querySelector('#chatInput'),log=root.querySelector('#chatMsgs'),status=root.querySelector('.ab-chat-status'),send=root.querySelector('#chatSend'),stop=root.querySelector('.ab-stop');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let open=false,busy=false,controller=null,greetTimer,animationTimer,roamTimer,history=[],requestId=0,returnFocus=null;
 function state(name){mascot.className='allbee-mascot allbee-mascot--'+name;}
 function greet(text){greeting.textContent=text;greeting.hidden=false;state('hello');clearTimeout(greetTimer);greetTimer=setTimeout(()=>{greeting.hidden=true;if(!busy)state('idle');},4500);}
 function renderText(el,text){
  text=String(text).replace(/^#{1,6}\s+/gm,'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/^---+$/gm,'');
  text=text.split('\n').filter(line=>!/^\s*\|?\s*[-:]+\s*\|[\s|:-]*$/.test(line)).map(line=>/^\s*\|.*\|\s*$/.test(line)?line.split('|').map(x=>x.trim()).filter(Boolean).join(' — '):line).join('\n');
  text=text.replace(/<(https?:\/\/[^\s>]+)>/g,'[$1]($1)');
  // AI output is text; only safe Markdown links can create elements.
  const re=/\[([^\]]{1,140})\]\(([^\s)]+)\)/g;let last=0,m;
  while((m=re.exec(text))){
   el.append(document.createTextNode(text.slice(last,m.index)));
   let url;try{url=new URL(m[2],location.origin);}catch{}
   if(url&&['https:','http:'].includes(url.protocol)){const a=document.createElement('a');a.textContent=m[1];a.href=url.href;if(url.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}el.append(a);}else el.append(document.createTextNode(m[0]));
   last=re.lastIndex;
  }el.append(document.createTextNode(text.slice(last)));
 }
 function bubble(text,role){const el=document.createElement('div');el.className='ab-bubble '+role;renderText(el,text);log.append(el);log.scrollTop=log.scrollHeight;}
 function save(){try{sessionStorage.setItem('allbee-website-chat-v1',JSON.stringify(history.slice(-12)));}catch{}}
 function welcome(){bubble("Hi! 👋 I'm ALLBEE AI. Ask me about our services, courses, invitations, projects or APN. I can help with general questions too.",'assistant');}
 try{const saved=JSON.parse(sessionStorage.getItem('allbee-website-chat-v1')||'[]');history=Array.isArray(saved)?saved.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=10000).slice(-12):[];}catch{}
 if(history.length)history.forEach(m=>bubble(m.content,m.role));else welcome();
 function toggle(force){
  open=typeof force==='boolean'?force:!open;
  panel.hidden=!open;panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));btn.setAttribute('aria-expanded',String(open));launcher.style.transform='';launcher.classList.remove('is-walking');greeting.hidden=true;
  if(open){returnFocus=document.activeElement;state('listening');input.focus();}else{state('idle');(returnFocus&&document.contains(returnFocus)?returnFocus:btn).focus();}
 }
 window.toggleChat=toggle;
 btn.addEventListener('click',()=>{if(!open)greet('Hi! How can I help? 👋');toggle();});
 btn.addEventListener('pointerenter',()=>{if(!open)state('wave');});
 btn.addEventListener('pointerleave',()=>{if(!open&&!busy)state('idle');});
 root.querySelector('.ab-close').addEventListener('click',()=>toggle(false));
 function finish(id){if(id!==requestId)return;busy=false;controller=null;send.disabled=false;stop.hidden=true;input.disabled=false;status.textContent='';state(open?'listening':'idle');}
 async function ask(message){
  const text=String(message||input.value).trim();if(!text||busy)return;
  if(text.length>2000){status.textContent='Please keep your message under 2,000 characters.';return;}
  input.value='';bubble(text,'user');history.push({role:'user',content:text});history=history.slice(-12);save();
  busy=true;send.disabled=true;stop.hidden=false;state('thinking');status.textContent='ALLBEE AI is thinking…';
  const id=++requestId;controller=new AbortController();const timeout=setTimeout(()=>controller?.abort(),42000);
  try{
   const r=await fetch('/api/website-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,page:location.pathname}),signal:controller.signal});
   const data=await r.json();if(id!==requestId)return;
   if(!r.ok||!data.text)throw new Error(data.error||'Please try again.');
   bubble(data.text,'assistant');history.push({role:'assistant',content:data.text.slice(0,2000)});save();state('success');
  }catch(e){if(id===requestId){bubble(e.name==='AbortError'?'Response stopped. You can send another message.':e.message,'assistant');}}
  finally{clearTimeout(timeout);finish(id);}
 }
 stop.addEventListener('click',()=>controller?.abort());
 root.querySelector('.ab-reset').addEventListener('click',()=>{controller?.abort();requestId++;busy=false;history=[];save();log.textContent='';welcome();send.disabled=false;stop.hidden=true;status.textContent='';state('listening');input.focus();});
 root.querySelector('.ab-composer').addEventListener('submit',e=>{e.preventDefault();ask();});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();ask();}});
 root.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){toggle(false);return;}if(e.key==='Tab'&&open){const items=[...panel.querySelectorAll('button:not([hidden]):not(:disabled),textarea,a[href]')].filter(e=>e.getClientRects().length);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 // Sparse greetings, remembered across page navigation.
 try{if(!sessionStorage.getItem('allbee-website-intro')){sessionStorage.setItem('allbee-website-intro','1');setTimeout(()=>{if(!open&&!document.hidden)greet('Hi! Need any help? 👋');},3500);}}catch{}
 const prompts=['Any doubts? I’m here.','Need help choosing a course?','Want to build a website?','Ask me about APN.'];
 let promptIndex=0;
 setInterval(()=>{if(open||document.hidden||document.activeElement?.matches('input,textarea,select'))return;try{const last=Number(sessionStorage.getItem('allbee-website-hint')||0);if(Date.now()-last<90000)return;sessionStorage.setItem('allbee-website-hint',String(Date.now()));greet(prompts[promptIndex++%prompts.length]);}catch{}},45000);
 // Walk a short distance only when the bottom corridor contains no controls.
 setInterval(()=>{
  if(open||busy||document.hidden||reduced.matches||launcher.matches(':hover')||root.contains(document.activeElement)||document.activeElement?.matches('input,textarea,select')||innerWidth<600)return;
  const r=launcher.getBoundingClientRect();let blocked=false;
  for(let x=r.left-72;x<r.right;x+=20)for(let y=r.top;y<r.bottom;y+=20){if(document.elementsFromPoint(x,y).some(e=>!root.contains(e)&&e.closest('a,button,input,textarea,select')))blocked=true;}
  if(blocked)return;
  state('walking');launcher.classList.add('is-walking');launcher.style.transform='translateX(-60px)';
  clearTimeout(roamTimer);roamTimer=setTimeout(()=>{launcher.style.transform='';animationTimer=setTimeout(()=>{launcher.classList.remove('is-walking');if(!open&&!busy)state('idle');},4500);},4500);
 },30000);
 document.addEventListener('visibilitychange',()=>{root.classList.toggle('ab-suspended',document.hidden);if(document.hidden){clearTimeout(roamTimer);clearTimeout(animationTimer);launcher.style.transform='';launcher.classList.remove('is-walking');}});
})();