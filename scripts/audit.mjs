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
  if (!isUtility && !/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html)) issues.push(`missing meta description: ${rel}`);
  if (!isUtility && !/<link[^>]+rel=["']canonical["']/i.test(html)) issues.push(`missing canonical: ${rel}`);
  if (!isUtility && !/<meta[^>]+property=["']og:title["'][^>]+content=["'][^"']+/i.test(html)) issues.push(`missing og:title: ${rel}`);
  if (!isUtility && !/<h1\b[^>]*>/i.test(html)) issues.push(`missing h1: ${rel}`);
  if (!isUtility && (html.match(/<h1\b/gi) || []).length > 1) issues.push(`multiple h1 elements: ${rel}`);
  if (html.includes('/assets/site-core.css') && !html.includes('/assets/site-theme.js')) issues.push(`site-core page missing site-theme.js: ${rel}`);
  if (html.includes('class="ab-footer"') && !html.includes('/assets/shared-runtime-2.js')) issues.push(`global footer missing shared runtime: ${rel}`);
  for (const tag of html.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || []) {
    if (!/\brel=["'][^"']*noopener/i.test(tag)) issues.push(`target=_blank link missing noopener: ${rel}`);
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (tag.includes("'+") || tag.includes('${')) continue;
    if (!/\balt=["'][^"']*["']/i.test(tag)) {
      issues.push(`image missing alt: ${rel}`);
      break;
    }
    if (!/\bwidth=["'][^"']+["']/i.test(tag) || !/\bheight=["'][^"']+["']/i.test(tag)) {
      issues.push(`image missing intrinsic dimensions: ${rel}`);
      break;
    }
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (src && !/^(?:https?:|data:|blob:)/i.test(src)) {
      let cleanSrc = src.split('?')[0].split('#')[0];
      try { cleanSrc = decodeURIComponent(cleanSrc); } catch {}
      const imagePath = cleanSrc.startsWith('/')
        ? path.join(root, cleanSrc.replace(/^\//, ''))
        : path.resolve(path.dirname(path.join(root, rel)), cleanSrc);
      if (!fs.existsSync(imagePath)) {
        issues.push(`image source missing: ${rel} -> ${src}`);
        break;
      }
      if (/\.svg$/i.test(imagePath)) {
        const svgHead = fs.readFileSync(imagePath).subarray(0, 1024).toString('utf8');
        if (!/<svg\b/i.test(svgHead)) {
          issues.push(`invalid SVG image: ${rel} -> ${src}`);
          break;
        }
      }
    }
  }
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); }
    catch { issues.push(`invalid JSON-LD: ${rel}`); break; }
  }
}

// All pages using the global AllBee footer should stay structurally identical.
const footerBlocks = [];
for (const rel of htmlFiles.filter(name => !name.includes('/'))) {
  const html = read(rel);
  const match = html.match(/<footer\b[^>]*class=["'][^"']*\bab-footer\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i);
  if (match) footerBlocks.push({ rel, block: match[0].replace(/\s+/g, ' ').trim() });
}
if (footerBlocks.length > 1) {
  const canonicalFooter = footerBlocks[0].block;
  for (const entry of footerBlocks.slice(1)) {
    if (entry.block !== canonicalFooter) issues.push(`global footer drift: ${entry.rel}`);
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