import assert from 'node:assert/strict';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.ALLBEE_TEST_ORIGIN||'http://127.0.0.1:49387';
let verified=0;
for(const [name,engine,mobile] of [['Chromium',chromium,false],['WebKit mobile',webkit,true]]){
 let browser;
 try{
  browser=await engine.launch({headless:true});
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1365,height:768},isMobile:mobile,hasTouch:mobile});
  for(const route of ['/', '/demo/royal-scroll.html']){
   const page=await context.newPage();
   const thirdParty=[];
   page.on('request',req=>{if(req.url().includes('googletagmanager.com/gtag/js'))thirdParty.push(req.url())});
   await page.route('**/*',req=>req.request().url().startsWith(base)?req.continue():req.abort());
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:20000});
   await page.locator('#allbee-analytics-choice').waitFor({timeout:13000});
   assert.equal(thirdParty.length,0,`${name} ${route}: Google loaded before consent`);
   assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0);
   await page.getByRole('button',{name:'Allow analytics'}).click();
   await page.waitForFunction(()=>!!document.querySelector('script[src*="googletagmanager.com/gtag/js"]'),{timeout:13000});
   assert.equal(await page.locator('#allbee-analytics-manage').count(),1);
   await page.locator('#allbee-analytics-manage').click();
   await page.getByRole('button',{name:'No thanks'}).click();
   await page.waitForFunction(()=>localStorage.getItem('allbee-analytics-consent-v2')==='no',{timeout:13000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('allbee-analytics-consent-v2')),'no');
   assert.equal(await page.locator('#allbee-analytics-choice').count(),0);
   await page.reload({waitUntil:'domcontentloaded',timeout:20000});
   assert.equal(await page.locator('#allbee-analytics-choice').count(),0);
   assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0,
      `${name} ${route}: Google reloaded after opt-out`);
   verified++;
   await page.evaluate(()=>localStorage.removeItem('allbee-analytics-consent-v2'));
   console.log(`PASS ${name} ${route}: consent -> opted-in analytics -> opt-out -> reload silent`);
   await page.close();
  }
  const privacy=await context.newPage();
  await privacy.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{configurable:true,get:()=> '1'}));
  await privacy.route('**/*',req=>req.request().url().startsWith(base)?req.continue():req.abort());
  await privacy.goto(base+'/?dnt-browser-test=1',{waitUntil:'domcontentloaded',timeout:20000});
  assert.equal(await privacy.locator('#allbee-analytics-choice').count(),0);
  assert.equal(await privacy.locator('script[src*="googletagmanager.com/gtag/js"]').count(),0);
  console.log(`PASS ${name}: Do Not Track disables optional analytics`);
  verified++;
  await context.close();
 }finally{if(browser)await browser.close()}
}
console.log('TOTAL VERIFIED BROWSER CASES:',verified);
