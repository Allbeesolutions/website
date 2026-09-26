#!/usr/bin/env node
/**
 * Dependency-free static audit for AllBee's HTML/Vercel site.
 * Run from the repository root: node scripts/audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const issues = [];
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const rel = path.relative(root, path.join(dir, entry.name));
    if (entry.isDirectory()) walk(path.join(dir, entry.name), out);
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const htmlFiles = walk(root);
const config = JSON.parse(read('vercel.json'));

for (const rewrite of [...(config.rewrites || []), ...(config.redirects || [])]) {
  const destination = rewrite.destination || '';
  if (destination.includes(':') || destination.startsWith('http')) continue;
  const clean = destination.split('?')[0].split('#')[0].replace(/^\//, '');
  const targetExists = clean && (exists(clean) || exists(clean + '.html'));
  if (clean && !targetExists) issues.push(`route target missing: ${destination}`);
}

for (const rel of htmlFiles) {
  const html = read(rel);
  const isUtility = rel.startsWith('admin/') || rel.startsWith('demo/') || rel === '404.html' || rel.startsWith('google');
  if (!isUtility && !/<title>[^<]+<\/title>/i.test(html)) issues.push(`missing title: ${rel}`);
  if (!isUtility && !/<link[^>]+rel=["']canonical["']/i.test(html)) issues.push(`missing canonical: ${rel}`);
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (tag.includes("'+") || tag.includes('${')) continue;
    if (!/\bwidth=["'][^"']+["']/i.test(tag) || !/\bheight=["'][^"']+["']/i.test(tag)) {
      issues.push(`image missing intrinsic dimensions: ${rel}`);
      break;
    }
  }
}

const sitemap = read('sitemap.xml');
for (const loc of sitemap.matchAll(/<loc>https?:\/\/[^<]+<\/loc>/g)) {
  const url = loc[0].replace(/<\/?loc>/g, '');
  const route = new URL(url).pathname;
  let target = route === '/' ? 'index.html' : route.replace(/^\//, '') + '.html';
  if (route.startsWith('/demo/')) target = route.replace(/^\//, '') + '.html';
  if (!exists(target) && ![...(config.rewrites || [])].some(r => r.source === route)) {
    issues.push(`sitemap target missing: ${route}`);
    continue;
  }
  const page = exists(target) ? read(target) : read((config.rewrites || []).find(r => r.source === route).destination.replace(/^\//, ''));
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(page)) issues.push(`noindex page in sitemap: ${route}`);
  const canonical = page.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
  if (canonical !== url) issues.push(`sitemap canonical mismatch: ${route}`);
}

const sitemapUrls = new Set([...sitemap.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(match => match[1]));
for (const rel of htmlFiles.filter(name => !name.includes('/') && name !== '404.html' && !name.startsWith('google'))) {
  const html = read(rel);
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) continue;
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
  if (canonical && !sitemapUrls.has(canonical)) issues.push(`indexable page missing from sitemap: ${rel}`);
}

for (const rel of fs.readdirSync(path.join(root, 'api')).filter(name => name.endsWith('.js'))) {
  try { execFileSync('node', ['--check', path.join(root, 'api', rel)], { stdio: 'pipe' }); }
  catch { issues.push(`API syntax error: api/${rel}`); }
}

const imgCount = htmlFiles.reduce((n, rel) => n + (read(rel).match(/<img\b/gi) || []).length, 0);
console.log(`AllBee static audit: ${htmlFiles.length} HTML files, ${imgCount} images, ${issues.length} issue(s)`);
if (issues.length) {
  for (const issue of issues) console.error(' - ' + issue);
  process.exitCode = 1;
}
