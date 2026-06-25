#!/usr/bin/env node
/**
 * AllBee Invitations — Screenshot Engine
 * Captures a desktop + mobile preview of every live demo (at its variant) and
 * writes web-optimised JPEGs to /demo-shots, then auto-wires the catalog `img`
 * field for any template still missing one.
 *
 * Requires: Google Chrome + macOS `sips`. Reads templates from invitation-samples.html.
 *
 * Usage:
 *   1. serve the repo:   python3 -m http.server 8788
 *   2. run the engine:   BASE_URL=http://localhost:8788 node scripts/screenshot-engine.mjs
 *      (BASE_URL defaults to http://localhost:8788)
 *
 * Why a server (not file://): variant skins load from the ?v= query string,
 * which file:// URLs drop. Production serves over HTTP, so we shoot over HTTP.
 */
import fs from 'fs';
import { execFileSync } from 'child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = process.env.BASE_URL || 'http://localhost:8788';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = ROOT + 'demo-shots';
const TMP = '/tmp/abx-shots';

const html = fs.readFileSync(ROOT + 'invitation-samples.html', 'utf8');
const T = JSON.parse(html.match(/const TEMPLATES=(\[[\s\S]*?\]);/)[1]);
const live = T.filter(t => t.demo);
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });

const VIEWS = [
  { suffix: '',   w: 1000, h: 750, max: 680 }, // desktop card preview
  { suffix: '-m', w: 390,  h: 844, max: 380 }, // mobile preview
];

function shoot(url, png, w, h) {
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    `--window-size=${w},${h}`, '--virtual-time-budget=3500',
    `--screenshot=${png}`, '--default-background-color=00000000', url],
    { stdio: 'ignore', timeout: 60000 });
}

let ok = 0, fail = 0, wired = 0;
for (const t of live) {
  const qs = t.variant ? `?v=${t.variant}` : '';
  const demoUrl = `${BASE}/demo/${t.demo}.html${qs}`;
  for (const v of VIEWS) {
    const png = `${TMP}/${t.id}${v.suffix}.png`;
    const jpg = `${OUT}/${t.id}${v.suffix}.jpg`;
    try {
      shoot(demoUrl, png, v.w, v.h);
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '-Z', String(v.max), png, '--out', jpg], { stdio: 'ignore' });
      ok++;
    } catch (e) { console.error('FAIL', t.id, v.suffix || 'desktop', String(e.message || e).slice(0, 80)); fail++; }
  }
  process.stdout.write(`· ${t.id} `);
}
console.log(`\nShots OK: ${ok}  failed: ${fail}  (templates: ${live.length} × 2 views)`);

// Auto-wire any missing img field
let h2 = fs.readFileSync(ROOT + 'invitation-samples.html', 'utf8');
for (const t of live) {
  if (!t.img && fs.existsSync(`${OUT}/${t.id}.jpg`)) {
    const re = new RegExp(`(\\{"id": "${t.id}"[^}]*?)"img": null`);
    if (re.test(h2)) { h2 = h2.replace(re, `$1"img": "/demo-shots/${t.id}.jpg"`); wired++; }
  }
}
if (wired) { fs.writeFileSync(ROOT + 'invitation-samples.html', h2); console.log(`Auto-wired ${wired} missing img fields.`); }
else console.log('All catalog img fields already wired.');
