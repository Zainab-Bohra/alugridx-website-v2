// Small HTML helpers. Output markup is identical to the approved AI design,
// so public/style.css and public/app.js keep working untouched.
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const A = (href, label, cls = '') => `<a class="${cls}" href="${href}">${label}</a>`;
export const arrow = '<span aria-hidden="true">↗</span>';
export const btn = (href, label, secondary = false) => A(href, label + arrow, 'btn ' + (secondary ? 'secondary' : ''));

/** Public URL of a product page. Uses the slug the product had on the old WordPress site. */
export const productUrl = (p) => `/${p.slug}/`;

export const img = (p, cls = '', lazy = true) =>
  `<img class="${cls}" src="/assets/${p.image}" alt="${esc(p.name)}" ${lazy ? 'loading="lazy"' : ''} width="650" height="500">`;

export const heading = (kicker, h, p = '') =>
  `<div class="page-heading wrap"><div class="eyebrow">${kicker}</div><h1>${h}</h1>${p ? `<p>${p}</p>` : ''}</div>`;

export function card(p) {
  const u = productUrl(p);
  return `<article class="product-card" data-id="${p.id}" data-category="${p.category}" data-application="${p.application}" data-purpose="${p.purpose}"><a class="card-visual" href="${u}">${img(p)}<span class="card-tag">${p.tag}</span><span class="card-open" aria-hidden="true">↗</span></a><div class="card-body"><span class="eyebrow">${p.category}</span><h3>${A(u, p.name)}</h3><p>${p.description}</p><div class="card-actions">${A(u, 'Explore product →', 'text-link')}<label class="compare-check"><input type="checkbox" data-compare="${p.id}"> Compare</label></div></div></article>`;
}

export const cta = `<section class="cta"><div class="wrap cta-inner"><div><div class="eyebrow">FROM YOUR DRAWING TO OUR FACTORY</div><h2>Let’s make your<br>next project <em>flow.</em></h2></div><div><p>Bring us your dimensions, finish and project requirements. We’ll work through the details together.</p>${btn('/quote/', 'Build your quotation request')}${A('/contact-us/', 'Talk to our team →', 'text-link light')}</div></div></section>`;

const circular = ['disc-valves', 'jet-diffusers', 'round-ceiling-diffusers'];
export const isCircular = (p) => circular.includes(p.id);

/** Illustrative finish preview used on product pages. */
export function finishSvg(p) {
  if (isCircular(p))
    return `<svg viewBox="0 0 500 300" role="img" aria-label="Illustrative circular finish sample"><ellipse cx="250" cy="150" rx="126" ry="91" fill="var(--finish)" stroke="#73808c" stroke-width="3"/>${[65, 45, 25]
      .map((r) => `<ellipse cx="250" cy="150" rx="${r * 1.3}" ry="${r}" fill="var(--finish)" stroke="#73808c" stroke-width="3"/>`)
      .join('')}</svg>`;
  const louver = p.category === 'Louvers';
  const bars = Array.from({ length: louver ? 7 : 12 }, (_, i) => `<path d="M77 ${80 + i * (louver ? 21 : 12)}h346v7H77z" fill="var(--finish)" stroke="#73808c" stroke-width=".5"/>`).join('');
  return `<svg viewBox="0 0 500 300" role="img" aria-label="Illustrative grille finish sample"><rect x="55" y="55" width="390" height="190" rx="2" fill="var(--finish)" stroke="#73808c" stroke-width="3"/><rect x="74" y="74" width="352" height="152" fill="#52606e"/>${bars}</svg>`;
}

/** Enquiry form (contact page = general, quote page = quotation). */
export function enquiryForm(isQuote = false) {
  return `<form id="enquiry-form" class="enquiry-form" data-kind="${isQuote ? 'quotation' : 'general'}"><h2>${isQuote ? 'Your project details' : 'Start a conversation.'}</h2><div class="form-grid"><label>Full name *<input name="name" required maxlength="100" autocomplete="name"></label><label>Email *<input name="email" type="email" required maxlength="160" autocomplete="email"></label><label>Phone *<input name="phone" type="tel" required maxlength="40" autocomplete="tel"></label><label>Company<input name="company" maxlength="160" autocomplete="organization"></label><label>Project name<input name="project" maxlength="160"></label><label>Required delivery date<input name="delivery" type="date"></label></div><label>Project location<input name="location" maxlength="160" placeholder="City / site location"></label><label>Message / specification notes *<textarea name="message" required rows="4" maxlength="5000" placeholder="Tell us about your requirements…"></textarea></label><label class="upload-zone">Attach drawings, a BOQ or reference images<input type="file" name="files" id="attachments" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.dwg,.dxf,.xlsx,.xls,.csv"><span>PDF, images, DWG, DXF or spreadsheets · up to 5 files · 5 MB per file · 10 MB total</span></label><ul id="attachment-list" class="attachment-list"></ul><div class="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input name="consent" type="checkbox" required> <span>I agree that AluGridX may use my details and attachments to respond to this enquiry. ${A('/privacy/', 'Privacy information')}</span></label><button type="submit" class="btn wide" id="submit-enquiry">${isQuote ? 'Submit quotation request' : 'Send enquiry'} ↗</button><p class="small">You’ll receive an on-screen reference. Email delivery to the factory team is confirmed separately in your submission result.</p><div id="form-result" role="status" aria-live="polite"></div></form>`;
}
