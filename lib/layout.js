import { config, business } from '../config.js';
import { A, esc } from './ui.js';
import { fileVersion } from './assets.js';

const cssV = fileVersion('public/style.css');
const jsV = fileVersion('public/app.js');
export const versions = { css: cssV, js: jsV };

const FONTS =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap';

const NAV = [
  ['/products/', 'Products'],
  ['/about-us/', 'About us'],
  ['/custom-manufacturing/', 'Custom solutions'],
  ['/applications/', 'Applications'],
  ['/downloads/', 'Resources'],
  ['/contact-us/', 'Contact'],
];

/**
 * Full HTML document with every SEO tag in one place.
 * @param {object} o
 * @param {string} o.title        <title> (already includes brand)
 * @param {string} o.description  meta description (~150 chars)
 * @param {string} o.path         canonical path, e.g. "/ceiling-diffusers/"
 * @param {string} o.body         <main> content
 * @param {string} [o.active]     nav item to highlight
 * @param {string} [o.robots]     "index,follow" | "noindex,follow"
 * @param {string} [o.image]      OG image path
 * @param {object[]} [o.schema]   JSON-LD objects
 */
export function renderPage({ title, description, path, body, active = '', robots = 'index,follow', image, ogType = 'website', schema = [] }) {
  const url = config.siteUrl + path;
  const ogImage = config.siteUrl + (image || business.ogImage);
  const ld = schema.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c3155"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${robots}${robots.startsWith('index') ? ',max-image-preview:large,max-snippet:-1' : ''}"><link rel="canonical" href="${url}"><meta property="og:site_name" content="${business.name}"><meta property="og:locale" content="en_US"><meta property="og:type" content="${ogType}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${ogImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${ogImage}"><link rel="icon" href="/assets/company-logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FONTS}"><link rel="stylesheet" href="/style.css?v=${cssV}"><script src="/data.js?v=${dataVersion()}" defer></script><script src="/app.js?v=${jsV}" defer></script>${ld}</head><body><a class="skip" href="#main">Skip to content</a><div class="topbar"><div class="wrap"><span>UAE MANUFACTURING · AJMAN</span><a href="tel:${business.phone}">${business.phoneDisplay} <span>↗</span></a></div></div><header><div class="wrap header-inner"><a href="/" class="brand" aria-label="AluGridX home"><img src="/assets/company-logo.png" alt="AluGridX — Airflow Redefined" width="145" height="100"></a><button class="mobile-menu" aria-label="Open navigation" aria-expanded="false">☰</button><nav aria-label="Main navigation">${NAV.map(([h, l]) => A(h, l, active === h ? 'active' : '')).join('')}</nav><a class="rfq-link" href="/quote/">Request a quote <span class="basket-count" aria-label="items in quotation basket">0</span> ↗</a></div></header><main id="main">${body}</main>${footer()}<a href="https://wa.me/${business.phone.replace('+', '')}" class="whatsapp" target="_blank" rel="noopener" aria-label="Chat with AluGridX on WhatsApp">Chat with us ↗</a><div class="compare-dock" hidden><span><strong class="compare-count">0</strong> products selected</span>${A('/compare/', 'Compare now →')}<button id="clear-compare">Clear</button></div><div id="toast" role="status" aria-live="polite"></div><dialog id="zoom-dialog"><button class="dialog-close" aria-label="Close image">×</button><img alt=""><p></p></dialog></body></html>`;
}

let _dataV = '0';
export const setDataVersion = (v) => (_dataV = v);
const dataVersion = () => _dataV;

function footer() {
  return `<footer><div class="wrap footer-grid"><div><img src="/assets/logo-color.png" alt="AluGridX — Airflow Redefined" width="230" height="40" loading="lazy"><p>Air Conditioning Industry LLC<br>Manufactured in Ajman, UAE.</p><a href="${business.instagram}" target="_blank" rel="noopener">Instagram ↗</a></div><div><h3>Explore</h3>${A('/products/', 'Product collection')}${A('/product-finder/', 'Find your product')}${A('/compare/', 'Compare products')}${A('/gallery/', 'Product gallery')}</div><div><h3>Work with us</h3>${A('/custom-manufacturing/', 'Custom manufacturing')}${A('/downloads/', 'Downloads & resources')}${A('/quote/', 'Build an RFQ')}${A('/about-us/', 'Our story')}</div><div><h3>Let’s talk</h3><a href="mailto:${business.email}">${business.email}</a><a href="tel:${business.phone}">${business.phoneDisplay}</a><p>Building 144, Warehouse 16<br>Al Jurf 3, Ajman, UAE</p></div></div><div class="wrap footer-bottom"><span>© ${new Date().getUTCFullYear()} AluGridX. All rights reserved.</span><div>${A('/privacy/', 'Privacy')}${A('/contact-us/', 'Factory location ↗')}</div></div></footer>`;
}
