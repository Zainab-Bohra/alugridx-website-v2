// Run:  npm run check      (also used by tests/)
// Fails when something would hurt SEO: duplicate titles, broken internal links, links to redirected URLs...
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../config.js';
import { buildSite } from '../lib/site.js';

export function audit() {
  const site = buildSite();
  const errors = [];
  const warnings = [];
  const titles = new Map();
  const descs = new Map();

  for (const [url, { html, robots }] of site.pages) {
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const desc = html.match(/<meta name="description" content="(.*?)">/)?.[1] || '';
    if ((html.match(/<link rel="canonical"/g) || []).length !== 1) errors.push(`${url}: needs exactly one canonical`);
    if (!html.includes(`<link rel="canonical" href="`)) errors.push(`${url}: canonical missing`);
    if (!title) errors.push(`${url}: missing <title>`);
    if (title.length > 70) warnings.push(`${url}: title is ${title.length} chars (aim for <= 60)`);
    if (desc.length < 70 || desc.length > 170) warnings.push(`${url}: description is ${desc.length} chars (aim for 120-160)`);
    if (robots.startsWith('index')) {
      if (titles.has(title)) errors.push(`${url}: same <title> as ${titles.get(title)}`); else titles.set(title, url);
      if (descs.has(desc)) errors.push(`${url}: same description as ${descs.get(desc)}`); else descs.set(desc, url);
    }
    // every internal link must land on a real page / file (not on a redirect, not on a 404)
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const link = m[1];
      if (link === '/') continue;
      const isFile = /\.[a-z0-9]+$/i.test(link);
      if (isFile) {
        if (!['/data.js', '/robots.txt', '/sitemap.xml'].includes(link) && !fs.existsSync(path.join(root, 'public', link))) errors.push(`${url}: missing file ${link}`);
      } else if (site.redirects.has(link.toLowerCase())) errors.push(`${url}: internal link points to a redirected URL ${link} -> ${site.redirects.get(link.toLowerCase())}`);
      else if (!site.pages.has(link)) errors.push(`${url}: broken internal link ${link}`);
    }
  }
  for (const [from, to] of site.redirects) {
    if (!site.pages.has(to)) errors.push(`redirect ${from} -> ${to} does not land on a real page`);
    if (site.redirects.has(to)) errors.push(`redirect chain: ${from} -> ${to} -> ${site.redirects.get(to)}`);
  }
  return { site, errors, warnings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { site, errors, warnings } = audit();
  console.log(`${site.pages.size} pages, ${site.redirects.size} redirects checked.`);
  warnings.forEach((w) => console.log('WARN ', w));
  errors.forEach((e) => console.log('ERROR', e));
  console.log(errors.length ? `\n${errors.length} error(s).` : '\nSEO audit passed.');
  process.exit(errors.length ? 1 : 0);
}
