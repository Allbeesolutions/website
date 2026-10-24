const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/site-analytics.js'), 'utf8');

function simulate({ pathname = '/', search = '', hash = '', consent = null, dnt = false } = {}) {
  const storage = new Map(consent ? [['allbee-analytics-consent-v2', consent]] : []);
  const scripts = [];
  const styles = [];
  let reloads = 0;
  class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {}; this.style = {}; }
    appendChild(el) { el.parent = this; this.children.push(el); return el; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
    setAttribute(k, v) { this[k] = v; }
    addEventListener(k, callback) { (this.listeners[k] ??= []).push(callback); }
    click() { for (const cb of this.listeners.click ?? []) cb({ target: this }); }
  }
  const body = new Element('body');
  const head = new Element('head');
  head.appendChild = el => {
    el.parent=head; head.children.push(el);
    if(el.tagName==='SCRIPT')scripts.push(el.src);
    if(el.tagName==='LINK')styles.push(el.href);
    return el;
  };
  const document = {
    body, head, readyState: 'complete',
    createElement: kind => new Element(kind),
    querySelector(selector) {
      if(selector==='link[data-allbee-analytics-css]')
        return head.children.find(x => x.tagName==='LINK' && x['data-allbee-analytics-css']==='1') ?? null;
      return null;
    },
    getElementById(id) { const find = el => el.id === id ? el : el.children.map(find).find(Boolean); return find(body) ?? null; },
    addEventListener() {},
  };
  const window = {};
  const location = { pathname, search, hash, origin: 'https://allbee.example', reload: () => { reloads++; } };
  vm.runInNewContext(source, { window, document, location,
    navigator: { doNotTrack: dnt ? '1' : '0', globalPrivacyControl: false },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, val) => storage.set(key, val) },
    Date,
  }, { timeout: 1000 });
  const click = (dialog, caption) => {
    const btn = dialog.children.find(el => el.tagName === 'BUTTON' && el.textContent === caption);
    assert.ok(btn, `Missing consent action: ${caption}`);
    btn.click();
  };
  return { window, document, storage, scripts, styles, click, reloads: () => reloads };
}

test('never loads Google Analytics or sends events before opt-in', () => {
  const s = simulate();
  assert.equal(s.scripts.length, 0);
  assert.equal(s.window.gtag, undefined);
  assert.deepEqual(s.styles, ['/assets/site-analytics.css'], 'Consent UI styling loads locally without loading Google Analytics');
  s.window.AllBeeAnalytics.track('whatsapp_click');
  assert.equal(s.scripts.length, 0);
  s.click(s.document.getElementById('allbee-analytics-choice'), 'Allow analytics');
  assert.equal(s.scripts.length, 1);
  assert.match(s.scripts[0], /googletagmanager\.com\/gtag\/js/);
  assert.equal(s.storage.get('allbee-analytics-consent-v2'), 'yes');
  s.window.AllBeeAnalytics.track('whatsapp_click');
  s.window.AllBeeAnalytics.track('form_submit');
  const events = s.window.dataLayer.filter(args => args[0] === 'event');
  assert.equal(events.length, 1, 'unsafe arbitrary events are not forwarded');
  assert.equal(events[0][1], 'whatsapp_click');
  assert.equal(Object.keys(events[0][2]).join(','), 'page_path', 'no user content or link text');
});

test('consent withdrawal disables events and reloads to unload third-party script', () => {
  const s = simulate({ consent: 'yes' });
  assert.equal(s.scripts.length, 1);
  s.document.getElementById('allbee-analytics-manage').click();
  s.click(s.document.getElementById('allbee-analytics-choice'), 'No thanks');
  assert.equal(s.storage.get('allbee-analytics-consent-v2'), 'no');
  assert.equal(s.reloads(), 1);
  const before = s.window.dataLayer.length;
  s.window.AllBeeAnalytics.track('cta_click');
  assert.equal(s.window.dataLayer.length, before, 'future actions blocked after withdrawal');
});

test('do-not-track and sensitive checkout routes cannot initialize third-party analytics', () => {
  for (const opts of [{ dnt: true }, { pathname: '/order.html' }, { pathname: '/track-order.html' }, { pathname: '/admin/ceo.html' }]) {
    const s = simulate(opts);
    assert.equal(s.scripts.length, 0);
    assert.equal(s.document.getElementById('allbee-analytics-choice'), null);
  }
});

test('public demo pages are counted only after consent, without query strings', () => {
  const s = simulate({ pathname: '/demo/nikah-noor.html' });
  assert.equal(s.scripts.length, 0);
  s.click(s.document.getElementById('allbee-analytics-choice'), 'Allow analytics');
  assert.equal(s.scripts.length, 1);
  const config = s.window.dataLayer.find(args => args[0] === 'config');
  assert.equal(config[2].page_path, '/demo/nikah-noor');
});

test('published HTML contains no unconditional Google Analytics loaders', () => {
  const files = [...fs.readdirSync(root).filter(f => f.endsWith('.html')).map(f => path.join(root, f)),
    ...fs.readdirSync(path.join(root, 'demo')).filter(f => f.endsWith('.html')).map(f => path.join(root, 'demo', f))];
  for (const f of files) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /googletagmanager\.com\/gtag\/js/, f);
});

test('unknown one-segment paths and unpublished demo slugs are never sent to GA4',()=>{
 for(const pathname of ['/private-guest-slug','/customer-account-id','/demo/private-guest-slug.html',
   '/track-order','/invitation','/review','/google21f2da8f0249edda.html']){
  const s=simulate({pathname,consent:'yes'});
  assert.equal(s.scripts.length,0,pathname);
 }
 const publicPage=simulate({pathname:'/about.html',consent:'yes'});
 assert.equal(publicPage.scripts.length,1);
});

test('query and hash-bearing links never initialize GA4 even after stored opt-in',()=>{
 for(const address of [
  {pathname:'/',search:'?invite=private'},
  {pathname:'/about.html',search:'?email=test%40example.com'},
  {pathname:'/demo/nikah-noor.html',search:'?token=private-invite'},
  {pathname:'/demo/nikah-noor.html',hash:'#guest-name'},
  {pathname:'/',hash:'#private-details'},
 ]){
  const s=simulate({...address,consent:'yes'});
  assert.equal(s.scripts.length,0,JSON.stringify(address));
  assert.equal(s.window.gtag,undefined);
  assert.equal(s.document.getElementById('allbee-analytics-choice'),null);
 }
});
test('GA4 config sends canonical location only and suppresses full third-party referrer',()=>{
 const s=simulate({pathname:'/demo/nikah-noor.html',consent:'yes'});
 const config=s.window.dataLayer.find(args=>args[0]==='config');
 assert.equal(config[2].page_location,'https://allbee.example/demo/nikah-noor');
 assert.equal(config[2].page_referrer,'');
 assert.equal(config[2].page_path,'/demo/nikah-noor');
});
