import { A, btn, img, card, cta, productUrl } from '../lib/ui.js';
import { seo, organization, website } from '../lib/seo.js';

export default function home(P) {
  const items = [P[0], P[2], P[1]];
  const headlines = [
    'Precision airflow.<br><em>Considered design.</em>',
    'Engineered for<br><em>your environment.</em>',
    'Better spaces.<br><em>Better airflow.</em>',
  ];
  const copy = [
    'Grilles, diffusers and ventilation solutions that connect engineering with architecture. Made in the UAE.',
    'Explore ventilation components and custom fabrication for your project’s requirements.',
    'Discover air distribution products that bring function and finish together.',
  ];
  const slider = `<section class="hero-slider" aria-label="Featured solutions" aria-roledescription="carousel" tabindex="0"><div class="hero-slides">${items
    .map(
      (p, i) =>
        `<article class="hero-slide ${i === 0 ? 'current' : ''}" aria-hidden="${i !== 0}"><div class="wrap hero-inner"><div class="hero-copy"><div class="eyebrow">ALUGRIDX / ${p.tag.toUpperCase()}</div><h1>${headlines[i]}</h1><p>${copy[i]}</p><div class="actions">${btn(productUrl(p), p.name)}${A('/product-finder/', 'Find your solution →', 'text-link')}</div><div class="hero-caption">MANUFACTURED IN AJMAN <span>BUILT TO YOUR SPECIFICATION</span></div></div><div class="hero-visual"><div class="hero-circle"></div><span class="vertical-label">AIRFLOW REDEFINED</span>${img(p, '', false)}<div class="hero-product-label"><span>0${i + 1} / COLLECTION</span><strong>${p.name}</strong></div></div></div></article>`,
    )
    .join('')}</div><div class="wrap hero-controls"><div class="hero-dots">${items
    .map((p, i) => `<button data-slide="${i}" aria-label="Show ${p.name}" aria-pressed="${i === 0}" class="${i === 0 ? 'active' : ''}"><span>0${i + 1}</span><i></i></button>`)
    .join('')}</div><div class="hero-controls-right"><button id="pause-slider" aria-label="Pause slideshow">Pause Ⅱ</button><button id="prev-slide" aria-label="Previous slide">←</button><button id="next-slide" aria-label="Next slide">→</button></div></div></section>`;

  const body =
    slider +
    `<div class="trust-strip wrap"><span>Grilles & registers</span><i>✦</i><span>Architectural diffusers</span><i>✦</i><span>Louvers & dampers</span><i>✦</i><span>Custom fabrication</span></div><section class="section wrap"><div class="section-head"><div><div class="eyebrow">THE ALUGRIDX COLLECTION</div><h2>Every detail.<br><em>A better flow.</em></h2></div><div><p>Explore air distribution, ventilation and control products for your next specification.</p>${A('/products/', 'View all ' + P.length + ' product families ↗', 'text-link')}</div></div><div class="product-grid home-grid">${[P[0], P[3], P[2]].map(card).join('')}</div></section><section class="finder-banner wrap"><div><span class="eyebrow">A CLEARER STARTING POINT</span><h2>Not sure which<br>product to choose?</h2></div><div><p>Start with the installation location and air duty. Our finder narrows the collection so you can discuss the right details with our team.</p>${btn('/product-finder/', 'Find my product')}</div><div class="finder-mark" aria-hidden="true">↗</div></section><section class="section wrap story-grid"><div class="story-image"><img src="/assets/company-1.png" alt="AluGridX branded wall display from the company website" loading="lazy"><span>ALUGRIDX / OUR IDENTITY</span></div><div><div class="eyebrow">LOCAL MANUFACTURING. A LONGSTANDING LEGACY.</div><h2>Built on legacy.<br><em>Driven by innovation.</em></h2><p>Established in 2025 under Hashim Darwish Commission LLC, AluGridX brings a fresh manufacturing focus to a business legacy that began in 1986.</p><p>From our Ajman factory, we work with your product dimensions, finishes and fabrication requirements.</p>${btn('/about-us/', 'Meet AluGridX', true)}</div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><span class="eyebrow">SPECIFICATION MADE SIMPLER</span><h2>From first idea<br><em>to a clear RFQ.</em></h2></div>${A('/custom-manufacturing/', 'Our approach ↗', 'text-link')}</div><div class="steps"><article><span>01</span><h3>Find your product</h3><p>Browse, compare and explore the details that matter to your application.</p></article><article><span>02</span><h3>Build your specification</h3><p>Add dimensions, quantities and finish preferences to your quotation basket.</p></article><article><span>03</span><h3>Share your project</h3><p>Upload drawings or a BOQ and submit a single request to our factory team.</p></article></div></div></section>` +
    cta;

  return {
    path: '/',
    ...seo('/', {
      title: 'AC Grills Manufacturer & Supplier in Dubai | Alugridx',
      description: 'Alugridx is Dubai\'s top AC grills manufacturer and diffuser supplier, delivering high-quality commercial HVAC airflow solutions.',
    }),
    body,
    schema: [organization(), website()],
  };
}
