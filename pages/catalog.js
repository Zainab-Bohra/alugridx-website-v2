import { A, btn, img, card, cta, heading, finishSvg, isCircular, productUrl, esc } from '../lib/ui.js';
import { seo, breadcrumbs, productSchema, itemList } from '../lib/seo.js';

const SITE = 'Alugridx';

/* ---------- /products/ ---------- */
export function productsPage(P) {
  const filters = `<div class="catalog-tools"><label class="search-box"><span>Search the collection</span><input type="search" id="product-search" placeholder="Search products, applications…" autocomplete="off"></label><label>Installation<select id="application-filter"><option value="">All locations</option>${['Ceiling', 'Wall', 'External', 'Door', 'Duct'].map((x) => `<option>${esc(x)}</option>`).join('')}</select></label><a href="/product-finder/" class="finder-link">Guided product finder ↗</a></div><div class="category-tabs" role="group" aria-label="Product category">${['All products', 'Diffusers', 'Grilles', 'Louvers', 'Dampers'].map((c, i) => `<button data-filter="${i ? esc(c) : ''}" aria-pressed="${i === 0}" class="${i === 0 ? 'active' : ''}">${esc(c)}</button>`).join('')}</div><div class="catalog-status"><span id="result-count">${P.length} product families</span><button id="reset-filters" class="text-button">Reset filters</button></div>`;
  const body =
    heading('PRODUCT COLLECTION', 'Find your next<br><em>airflow solution.</em>', 'Browse our product families. Compare applications, explore finish options and build a quotation request around your project.') +
    `<section class="wrap section-topless" id="products">${filters}<div class="product-grid" id="catalog-grid">${P.map(card).join('')}</div><div class="empty-state" id="no-results" hidden><h2>No matching products</h2><p>Try another term or clear the filters. Our team can also help with custom requirements.</p><button class="btn" id="empty-reset">Clear filters</button></div></section>` +
    cta;
  return {
    path: '/products/',
    ...seo('/products/', {
      title: `HVAC Grilles, Diffusers, Louvers & Dampers | ${SITE}`,
      description: 'Browse Alugridx grilles, ceiling diffusers, louvers and dampers. Made to your size and finish in the UAE. Request a quotation online.',
    }),
    body,
    active: '/products/',
    schema: [breadcrumbs([['Home', '/'], ['Products', '/products/']]), itemList(P, productUrl)],
  };
}

/* ---------- /<product-slug>/ ---------- */
export function productPage(p, P) {
  const url = productUrl(p);
  const safeName = esc(p.name);
  const safeId = esc(p.id);
  const related = P.filter((x) => x.id !== p.id)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 3);
  const body = `<div class="wrap breadcrumbs">${A('/', 'Home')} <span>/</span> ${A('/products/', 'Products')} <span>/</span> ${safeName}</div><section class="wrap product-detail" data-product="${safeId}"><div><div class="detail-photo"><button class="zoom-product" data-zoom="/assets/${esc(p.image)}" data-caption="${safeName}" aria-label="Enlarge ${safeName}">${img(p, '', false)}<span>Enlarge image ⤢</span></button></div><div class="photo-note">Original product image · appearance and configuration vary by specification.</div><div class="detail-thumbs"><button class="active" data-view="photo">Product photo</button><button data-view="finish">Finish visualiser</button></div><div class="finish-visual" hidden style="--finish:#f1f0ea">${finishSvg(p)}<p>Illustrative finish sample. Profile and on-screen colours are indicative.</p></div></div><div class="detail-content"><div class="eyebrow">${esc(p.category)} / ${esc(p.tag)}</div><h1>${safeName}</h1><p class="lead">${esc(p.description)}</p><p>${esc(p.detail)}</p><div class="product-meta"><span>Installation<strong>${esc(p.application)}</strong></span><span>Air duty<strong>${esc(p.purpose)}</strong></span><span>Sizing<strong>Project-specific</strong></span></div><form id="configure-product"><h2>Configure your enquiry</h2><p class="small">Enter the dimensions you need. Final configuration, availability and pricing are confirmed by our team.</p><div class="form-grid"><label>${isCircular(p) ? 'Face diameter' : 'Width / length'} (mm)<input name="width" type="number" min="1" max="30000" step="1" placeholder="e.g. 600" required></label><label>Height / connection (mm)<input name="height" type="number" min="1" max="30000" step="1" placeholder="e.g. 300" required></label><label>Quantity<input name="quantity" type="number" min="1" max="100000" value="1" required></label><label>Finish<select name="finish" id="finish-select"><option>RAL 9016 — Traffic white</option><option>RAL 9005 — Jet black</option><option>Custom finish — confirm with factory</option></select></label></div><label>Configuration notes<textarea name="notes" rows="2" maxlength="1000" placeholder="Neck size, slot count, mounting detail…"></textarea></label><div class="finish-swatches"><button type="button" data-finish="white" class="swatch selected" aria-label="Preview RAL 9016 white" aria-pressed="true"><i class="white"></i>RAL 9016</button><button type="button" data-finish="black" class="swatch" aria-label="Preview RAL 9005 black" aria-pressed="false"><i class="black"></i>RAL 9005</button></div><button class="btn wide" type="submit">Add to quotation basket <span>＋</span></button></form><div class="detail-footer"><label class="compare-check"><input type="checkbox" data-compare="${safeId}"> Compare this product</label>${A('/contact-us/', 'Ask a technical question ↗', 'text-link')}</div></div></section><section class="wrap section-topless spec-grid"><div><div class="eyebrow">SPECIFICATION CHECKLIST</div><h2>Get the details right.</h2><p>To prepare a useful quotation, please include:</p><ul class="checklist">${p.options.map((x) => `<li>${esc(x)}</li>`).join('')}<li>Quantity and project location</li><li>Required delivery date</li></ul></div><div class="spec-panel"><h3>Technical information</h3><dl><dt>Product family</dt><dd>${safeName}</dd><dt>Installation</dt><dd>${esc(p.application)}</dd><dt>Air duty</dt><dd>${esc(p.purpose)}</dd><dt>Dimensions</dt><dd>To project specification</dd><dt>Finish preferences</dt><dd>RAL 9016, RAL 9005 or custom; confirm availability</dd><dt>Performance / drawings</dt><dd>Request for your specific configuration</dd></dl><div class="actions">${A('/resources/' + encodeURIComponent(p.id) + '.pdf', 'Download product overview ↓', 'text-link')}${A('/quote/?interest=' + encodeURIComponent(p.id), 'Request technical submittal ↗', 'text-link')}</div><p class="small">Product overview is a general guide, not a certified datasheet. Airflow, pressure drop, acoustic and dimensional data require configuration-specific confirmation.</p></div></section><section class="soft section"><div class="wrap"><div class="section-head"><h2>Continue exploring.</h2>${A('/products/', 'All products ↗', 'text-link')}</div><div class="product-grid">${related.map(card).join('')}</div></div></section>`;
  return {
    path: url,
    ...seo(url, {
      title: `${p.name} Manufacturer & Supplier in UAE | ${SITE}`,
      description: p.description + ' Explore options and request a quotation from AluGridX, Ajman.',
    }),
    body,
    active: '/products/',
    image: '/assets/' + p.image,
    ogType: 'website',
    schema: [productSchema(p, url), breadcrumbs([['Home', '/'], ['Products', '/products/'], [p.name, url]])],
  };
}

/* ---------- /product-finder/ ---------- */
export function finderPage(P) {
  const radios = (name, list) => list.map((x, i) => `<label><input type="radio" name="${esc(name)}" value="${i ? esc(x) : ''}" ${i ? '' : 'checked'}><span>${esc(x)}</span></label>`).join('');
  const body =
    heading('GUIDED PRODUCT FINDER', 'A better starting point<br><em>for your specification.</em>', 'Choose an installation location and intended air duty to narrow the collection. Final product selection should be confirmed with the project designer and our team.') +
    `<section class="wrap section-topless"><form id="finder-form" class="finder-form"><fieldset><legend><span>01</span> Where will it be installed?</legend><div class="choice-row">${radios('location', ['Any location', 'Ceiling', 'Wall', 'External', 'Door', 'Duct'])}</div></fieldset><fieldset><legend><span>02</span> What is the intended air duty?</legend><div class="choice-row">${radios('purpose', ['Any air duty', 'Supply', 'Return', 'Exhaust', 'Intake', 'Transfer', 'Control'])}</div></fieldset><button class="btn" type="submit">Show matching products ↗</button></form><div class="section-head"><h2 id="finder-result-title">Explore the collection</h2><span id="finder-count">${P.length} product families</span></div><div class="product-grid" id="finder-results">${P.map(card).join('')}</div><div id="finder-empty" class="empty-state" hidden><h3>No direct match in this collection.</h3><p>Try broader options or discuss a custom requirement with our factory team.</p>${btn('/contact-us/', 'Ask our team')}</div></section>`;
  return {
    path: '/product-finder/',
    ...seo('/product-finder/', { title: `Product Finder – Choose HVAC Grilles & Diffusers | ${SITE}`, description: 'Pick an installation location and air duty to find the right Alugridx grille, diffuser, louver or damper for your project.' }),
    body,
  };
}

/* ---------- /compare/ ---------- */
export function comparePage() {
  const body =
    heading('SIDE BY SIDE', 'Compare the details.<br><em>Choose a direction.</em>', 'Select up to three product families to compare applications and configuration considerations. This is a general comparison, not a performance selection tool.') +
    `<section class="wrap section-topless"><div id="comparison"></div><div class="actions">${btn('/products/', 'Browse products', true)}<button id="clear-comparison" class="text-button">Clear comparison</button></div></section>`;
  return { path: '/compare/', ...seo('/compare/', { title: `Compare Products | ${SITE}`, description: 'Compare Alugridx grilles, diffusers, louvers and dampers side by side by application, air duty and configuration needs.' }), body, robots: 'noindex,follow' };
}

/* ---------- /gallery/ ---------- */
export function galleryPage(P) {
  const body =
    heading('THE VISUAL COLLECTION', 'A closer look<br><em>at the details.</em>', 'Explore the original product imagery from AluGridX’s website. Select an image to enlarge it or continue to its product page.') +
    `<section class="wrap section-topless"><div class="gallery-grid">${P.map((p) => `<article><button data-zoom="/assets/${esc(p.image)}" data-caption="${esc(p.name)}">${img(p)}<span>Enlarge ⤢</span></button><div><h3>${esc(p.name)}</h3>${A(productUrl(p), 'Explore ↗', 'text-link')}</div></article>`).join('')}</div><div class="resource-notice"><h3>See the range. Discuss the application.</h3><p>This gallery shows product imagery. For installation references or a factory visit, contact our team.</p>${A('/contact-us/', 'Discuss your project ↗', 'text-link')}</div></section>`;
  return { path: '/gallery/', ...seo('/gallery/', { title: `Product Gallery – AC Grilles & Diffusers | ${SITE}`, description: 'A closer look at Alugridx grilles, diffusers, louvers and dampers. Enlarge product images and explore each range.' }), body };
}

/* ---------- /applications/ ---------- */
export function applicationsPage(P) {
  const body =
    heading('AIRFLOW IN CONTEXT', 'Consider the space.<br><em>Then the solution.</em>', 'Explore common installation locations and the product families to discuss for each application.') +
    `<section class="wrap section-topless"><div class="application-tabs" role="group" aria-label="Installation location">${['Ceiling', 'Wall', 'External', 'Door', 'Duct'].map((x, i) => `<button data-application-tab="${esc(x)}" class="${i ? '' : 'active'}" aria-pressed="${i === 0}">${esc(x)}</button>`).join('')}</div><div class="application-scene"><div class="room-illustration" aria-hidden="true"><div class="room-ceiling"></div><div class="room-wall"></div><div class="room-floor"></div><div class="room-outlet ceiling" id="room-outlet"></div><span id="room-label">CEILING AIR DISTRIBUTION</span></div><div><span class="eyebrow">APPLICATION EXPLORER</span><h2 id="application-title">Ceiling integration</h2><p id="application-description">Coordinate the outlet with ceiling geometry, access needs, air duty and architectural finish.</p><p class="small">Illustrative installation diagram. Not an installation detail or a photograph of a completed project.</p></div></div><div class="section-head"><h2>Explore related products</h2>${A('/gallery/', 'Product gallery ↗', 'text-link')}</div><div class="product-grid" id="application-products">${P.map(card).join('')}</div></section>`;
  return { path: '/applications/', ...seo('/applications/', { title: `HVAC Applications: Ceiling, Wall, External, Door & Duct | ${SITE}`, description: 'See which Alugridx grilles, diffusers, louvers and dampers suit ceiling, wall, external, door and duct installations.' }), body, active: '/applications/' };
}

/* ---------- /downloads/ ---------- */
export function downloadsPage(P) {
  const body =
    heading('THE RESOURCE CENTRE', 'Useful details.<br><em>In one place.</em>', 'Explore product overviews, build a specification and request the technical documents for your chosen configuration.') +
    `<section class="wrap section-topless"><div class="resource-hero"><div><span class="eyebrow">START WITH THE RANGE</span><h2>The AluGridX<br>product collection.</h2><p>A downloadable guide to the product families on this website. Includes application summaries and enquiry checklists.</p>${btn('/resources/product-range.pdf', 'Download product range guide ↓', true)}</div><img src="/assets/company-0.png" alt="AluGridX product range visual from the company website" loading="lazy"></div><div class="section-head"><h2>Product overviews</h2><span>PDF downloads · general product overviews</span></div><label class="resource-search">Find a resource<input type="search" id="resource-search" placeholder="Search by product name"></label><div class="download-list">${P.map((p) => `<article data-resource="${esc(p.name.toLowerCase())}"><div><span class="eyebrow">PRODUCT OVERVIEW</span><h3>${esc(p.name)}</h3></div>${A('/resources/' + encodeURIComponent(p.id) + '.pdf', 'Download PDF ↓', 'text-link')}</article>`).join('')}</div><div class="resource-notice"><h3>Need CAD drawings or performance data?</h3><p>Technical drawings, performance selections and project submittals are configuration-specific. Request these with your product dimensions. Only the general overviews above are available for immediate download.</p>${btn('/quote/?interest=technical', 'Request technical documents')}</div><div class="download-list"><article><div><span class="eyebrow">RFQ TEMPLATE</span><h3>Product schedule template</h3><p>CSV template for organising sizes, quantities and finish requirements.</p></div>${A('/resources/rfq-template.csv', 'Download CSV ↓', 'text-link')}</article></div></section>`;
  return { path: '/downloads/', ...seo('/downloads/', { title: `Downloads: HVAC Product Catalogue PDFs | ${SITE}`, description: 'Download Alugridx product overview PDFs and the product range guide, plus an RFQ schedule template.' }), body, active: '/downloads/' };
}