import fs from 'node:fs';
import path from 'node:path';
import { config, business, root } from '../config.js';

const overrides = JSON.parse(fs.readFileSync(path.join(root, 'data/seo.json'), 'utf8'));
const abs = (p) => (p.startsWith('http') ? p : config.siteUrl + p);

/** data/seo.json wins over the defaults written in the page files. */
export const seo = (pagePath, defaults) => ({ ...defaults, ...(overrides[pagePath] || {}) });

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': config.siteUrl + '/#organization',
  name: business.name,
  legalName: business.legalName,
  url: config.siteUrl + '/',
  logo: abs(business.logo),
  email: business.email,
  telephone: business.phone,
  sameAs: [business.instagram],
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressCountry: business.address.country,
  },
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: business.name,
  url: config.siteUrl + '/',
});

export const localBusiness = () => ({
  ...organization(),
  '@type': 'LocalBusiness',
  '@id': config.siteUrl + '/#localbusiness',
  image: abs(business.ogImage),
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '15:00' },
  ],
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
});

export const productSchema = (p, url) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.name,
  description: p.description + ' ' + p.detail,
  image: abs('/assets/' + p.image),
  category: p.category,
  url: abs(url),
  brand: { '@type': 'Brand', name: business.name },
  manufacturer: { '@id': config.siteUrl + '/#organization' },
});

export const itemList = (P, urlOf) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: P.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(urlOf(p)), name: p.name })),
});

export function sitemapXml(entries) {
  const urls = entries.map((p) => `<url><loc>${config.siteUrl}${p}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function robotsTxt() {
  if (config.staging) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /enquiry/\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
}
