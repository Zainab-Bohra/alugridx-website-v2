import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../config.js';
import { sitemapXml, robotsTxt } from './seo.js';
import { renderPage, setDataVersion } from './layout.js';
import home from '../pages/home.js';
import { productsPage, productPage, finderPage, comparePage, galleryPage, applicationsPage, downloadsPage } from '../pages/catalog.js';
import { aboutPage, customPage, quotePage, contactPage, privacyPage, notFoundPage } from '../pages/company.js';

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const normalise = (p) => (p.endsWith('/') ? p : p + '/').toLowerCase();

/** Renders every page ONCE at start-up. Requests are then served from memory (fast = good for SEO). */
export function buildSite() {
  const P = readJson('data/products.json').map((p) => ({ ...p, url: `/${p.slug}/` }));

  const defs = [
    home(P),
    productsPage(P),
    ...P.map((p) => productPage(p, P)),
    aboutPage(),
    customPage(),
    applicationsPage(P),
    galleryPage(P),
    downloadsPage(P),
    contactPage(),
    quotePage(),
    finderPage(P),
    comparePage(),
    privacyPage(),
  ];

  // data.js is read by public/app.js (search, compare, basket)
  const dataJs = 'window.ALUGRIDX_PRODUCTS=' + JSON.stringify(P.map(({ slug, onOldSite, ...rest }) => rest)) + ';';
  setDataVersion(createHash('sha256').update(dataJs).digest('hex').slice(0, 10));

  const pages = new Map();
  for (const d of defs) {
    if (pages.has(d.path)) throw new Error('Duplicate page path: ' + d.path);
    pages.set(d.path, { html: renderPage(d), robots: d.robots || 'index,follow' });
  }
  const nf = notFoundPage();
  const notFound = renderPage(nf);

  // 301 redirects: manual list + /products/<id>/ (the AI draft's URLs) -> real URL
  const redirects = new Map();
  const manual = readJson('data/redirects.json');
  for (const [from, to] of Object.entries(manual)) if (!from.startsWith('_')) redirects.set(normalise(from), to);
  for (const p of P) {
    const from = normalise(`/products/${p.id}/`);
    if (!redirects.has(from)) redirects.set(from, p.url);
  }
  for (const [from, to] of redirects) if (pages.has(from)) throw new Error(`Redirect source is also a live page: ${from} -> ${to}`);

  const indexable = [...pages].filter(([, v]) => v.robots.startsWith('index')).map(([k]) => k);
  return { products: P, pages, notFound, redirects, dataJs, sitemap: sitemapXml(indexable), robots: robotsTxt() };
}
