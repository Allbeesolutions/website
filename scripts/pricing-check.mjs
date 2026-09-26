#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import catalog from '../lib/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prices = new Map(catalog.publicPricingRows.map(row => [
  row.service_slug + ':' + row.package_slug, row.price,
]));
const pages = ['index.html','courses.html','webdevelopment.html','digitalmarketing.html','invitation.html'];
const failures = [];
let checked = 0;

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  for (const marker of html.matchAll(/<[^>]+data-price-key="([^"]+)"[^>]*>/g)) {
    const key = marker[1];
    const expected = prices.get(key);
    const after = html.slice(marker.index + marker[0].length, marker.index + marker[0].length + 1500);
    const text = marker[0].startsWith('<article') ?
      (after.match(/class="crsx-price-num">([^<]+)/) || [])[1] :
      marker[0].startsWith('<h3') ?
      (after.match(/class="pricing-amount">([^<]+)/) || [])[1] :
      after.split('<')[0];
    const published = Number(String(text || '').replace(/[^0-9]/g, ''));
    if (expected === undefined || published !== expected) {
      failures.push(page + ' ' + key + ': published ' + (text || 'missing') + ', catalogue ' + expected);
    }
    checked++;
  }
}
console.log('Published price check: ' + checked + ' markers, ' + failures.length + ' mismatch(es)');
if (failures.length) {
  failures.forEach(failure => console.error(' - ' + failure));
  process.exitCode = 1;
}
