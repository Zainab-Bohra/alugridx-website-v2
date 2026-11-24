import { A, btn, cta, heading, enquiryForm } from '../lib/ui.js';
import { seo, breadcrumbs, localBusiness } from '../lib/seo.js';
import { business } from '../config.js';

const SITE = 'Alugridx';
const steps = (list) => `<div class="steps">${list.map(([n, h, p]) => `<article><span>${n}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div>`;

export function aboutPage() {
  const body =
    heading('OUR STORY', 'A local factory.<br><em>A lasting legacy.</em>', 'Built on legacy. Driven by innovation.') +
    `<section class="wrap story-grid section-topless"><div class="story-image"><img src="/assets/company-1.png" alt="AluGridX branded wall display" loading="lazy"></div><div><h2>Airflow redefined,<br>from Ajman.</h2><p>AluGridX Air Conditioning Industry LLC was established in 2025 under Hashim Darwish Commission LLC, a business established in 1986.</p><p>Our focus is on HVAC grilles, diffusers, louvers, dampers and custom fabrication. We bring product requirements and architectural details into the same conversation, from the first drawing to the agreed specification.</p><div class="facts"><div><strong>2025</strong><span>AluGridX established</span></div><div><strong>1986</strong><span>Our parent company’s legacy</span></div><div><strong>Ajman</strong><span>Our manufacturing home</span></div></div></div></section><section class="soft section"><div class="wrap"><div class="eyebrow">HOW WE WORK</div><h2>Clear details.<br><em>Considered solutions.</em></h2>${steps([
      ['01', 'Start with the application', 'We discuss how the product will be used and how it needs to fit the space.'],
      ['02', 'Coordinate the specification', 'Dimensions, mounting details, finish and quantities form the basis of our quotation.'],
      ['03', 'Keep the conversation open', 'Our factory team is available for product questions and project coordination.'],
    ])}</div></section>` +
    cta;
  return {
    path: '/about-us/',
    ...seo('/about-us/', { title: `About ${SITE} | HVAC Grilles & Diffusers Manufacturer UAE`, description: 'Alugridx Air Conditioning Industry LLC manufactures HVAC grilles, diffusers, louvers and dampers in Ajman, UAE, built on a legacy that began in 1986.' }),
    body,
    active: '/about-us/',
    schema: [breadcrumbs([['Home', '/'], ['About us', '/about-us/']])],
  };
}

export function customPage() {
  const faqs = [
    ['Can I request a non-standard size?', 'Yes. Submit your required dimensions for review. Manufacturing feasibility and final details are confirmed by our team.'],
    ['Can I request a specific RAL finish?', 'Include the RAL code and finish requirements in your enquiry. Availability and coating details are confirmed with your quotation.'],
    ['What should I include in my drawing?', 'Show the face and opening dimensions, installation section, fixing requirements and any interfaces with the ceiling, wall or duct.'],
    ['Will the website calculate a final price?', 'The website builds a specification and quotation request. Final pricing is provided by the factory after review.'],
  ];
  const body =
    heading('MADE AROUND YOUR PROJECT', 'Your dimensions.<br><em>Our manufacturing focus.</em>', 'A custom solution starts with a clear drawing, a defined application and a conversation about the details.') +
    `<section class="wrap section-topless split"><div class="custom-graphic"><div class="dimension horizontal">YOUR SPECIFICATION ↔</div><img src="/assets/linear-bar-grilles.png" alt="Linear bar grille product"><div class="dimension vertical">↕ PROJECT DIMENSIONS</div></div><div><h2>Bring the detail.<br>We’ll work through it.</h2><p>Whether you’re coordinating an interior finish or an external opening, share the information that defines your requirement.</p><ul class="checklist"><li>Product type and application</li><li>Face, neck, opening and connection dimensions</li><li>Frame, blade or slot arrangement</li><li>Finish preference and installation detail</li><li>Quantities, drawings and required delivery date</li></ul>${btn('/quote/?interest=custom', 'Start a custom enquiry')}</div></section><section class="soft section"><div class="wrap"><h2>Three steps to a clear quotation.</h2>${steps([
      ['01', 'Share your drawing', 'Attach your PDF, drawing file, reference image or BOQ to the enquiry.'],
      ['02', 'Confirm the requirements', 'Our team reviews the dimensions, configuration and finish with you.'],
      ['03', 'Agree the next steps', 'Pricing, technical details and delivery arrangements are confirmed with your quotation.'],
    ])}</div></section><section class="wrap section"><div class="section-head"><h2>Questions before you start?</h2></div>${faqs.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>` +
    cta;
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return {
    path: '/custom-manufacturing/',
    ...seo('/custom-manufacturing/', { title: `Custom HVAC Grilles & Diffusers Manufacturing | ${SITE}`, description: 'Need a non-standard size or RAL finish? Alugridx manufactures custom AC grilles, diffusers and louvers to your drawing in the UAE.' }),
    body,
    active: '/custom-manufacturing/',
    schema: [faqSchema],
  };
}

export function quotePage() {
  const body =
    heading('YOUR PROJECT / YOUR SPECIFICATION', 'One project.<br><em>One clear request.</em>', 'Add products, review dimensions and quantities, then attach your drawing or BOQ. No payment is required; the factory confirms pricing after review.') +
    `<section class="wrap section-topless quote-layout"><div><div class="section-head basket-heading"><h2>Your quotation basket</h2><button id="export-basket" class="text-button">Export schedule ↓</button></div><div id="quote-items"></div><div class="quote-general"><h3>Have a custom requirement?</h3><p>You can submit a general project enquiry without selecting a product. Include the details and attach a drawing below.</p><div class="actions">${A('/products/', 'Add more products →', 'text-link')}${A('/product-finder/', 'Use product finder ↗', 'text-link')}</div></div>${enquiryForm(true)}</div><aside class="quote-summary"><div class="eyebrow">YOUR NEXT STEP</div><h3>From specification<br>to quotation.</h3><ol><li>Review sizes and quantities.</li><li>Share drawings and project details.</li><li>Submit for factory review.</li></ol><p class="small">Your basket is saved in this browser. Submitted requests and attachments are stored securely for review.</p><hr><strong>Need help?</strong><a href="tel:${business.phone}">${business.phoneDisplay}</a><a href="mailto:${business.email}">${business.email}</a></aside></section>`;
  return { path: '/quote/', ...seo('/quote/', { title: `Request a Quotation | ${SITE}`, description: 'Build a quotation request for Alugridx grilles, diffusers, louvers and dampers.' }), body, robots: 'noindex,follow' };
}

export function contactPage() {
  const body =
    heading('LET’S TALK AIRFLOW', 'Good projects start<br><em>with a conversation.</em>', 'Share your product requirements, ask for technical information or arrange a visit to our Ajman factory.') +
    `<section class="wrap section-topless contact-layout"><div class="contact-info"><div class="eyebrow">DIRECT TO OUR TEAM</div><a href="tel:${business.phone}"><small>CALL / WHATSAPP</small>${business.phoneDisplay} ↗</a><a href="mailto:${business.email}"><small>EMAIL</small>${business.email} ↗</a><div class="address"><small>OUR FACTORY</small><p>Building No. 144, Warehouse No. 16<br>Humaideya Street, Al Jurf 3<br>Near Red Chilly Restaurant<br>Ajman, United Arab Emirates</p><a class="text-link" href="https://maps.google.com/?q=Alugridx+Air+Conditioning+Industry+LLC+Ajman" target="_blank" rel="noopener">Get directions ↗</a></div><details class="hours"><summary>Factory opening hours</summary><p>Mon–Thu: 9am–1pm, 2pm–6pm<br>Fri: 9am–12:30pm, 2pm–6pm<br>Sat: 9am–1pm, 2pm–3pm<br>Sunday: Closed</p><p class="small">Please call ahead to arrange your visit.</p></details><div class="contact-quote"><h3>Quoting several products?</h3><p>Build a schedule with dimensions, finishes and quantities.</p>${A('/quote/', 'Open quotation builder ↗', 'text-link light')}</div></div>${enquiryForm()}</section>`;
  return {
    path: '/contact-us/',
    ...seo('/contact-us/', { title: `Contact ${SITE} | AC Grills Factory in Ajman, UAE`, description: 'Call, WhatsApp or email the Alugridx factory team in Al Jurf 3, Ajman for AC grille, diffuser and louver enquiries.' }),
    body,
    active: '/contact-us/',
    schema: [localBusiness(), breadcrumbs([['Home', '/'], ['Contact us', '/contact-us/']])],
  };
}

export function privacyPage() {
  const body =
    heading('YOUR ENQUIRY DATA', 'Privacy &<br><em>project information.</em>') +
    `<section class="wrap section-topless prose"><h2>What this website collects</h2><p>When you submit a request, the website collects the contact details, project information, product specifications and files you provide. This information is used to process and respond to your enquiry.</p><h2>Saved baskets and comparisons</h2><p>Quotation baskets and comparison choices are saved locally in your browser. They are submitted only when you send an enquiry. You can remove items or clear your browser data.</p><h2>Submitted requests and files</h2><p>Requests and attachments are stored on the website’s server. A private reference link is created for your submission and may be included in the notification to AluGridX. Anyone with that link can view the submission, so share it only with the people handling your enquiry.</p><h2>Contact and communication</h2><p>The website attempts to send an email notification to the AluGridX team and displays whether that notification was delivered. WhatsApp and email links open external services under their own privacy terms.</p><h2>Questions or removal requests</h2><p>Contact <a href="mailto:${business.email}">${business.email}</a> and quote your enquiry reference to ask about your submission or request removal. Do not upload passwords, payment-card information or unrelated personal documents.</p></section>`;
  return { path: '/privacy/', ...seo('/privacy/', { title: `Privacy Information | ${SITE}`, description: 'How Alugridx handles enquiry data, drawing attachments, saved quotation baskets and comparison choices on this website.' }), body };
}

export function notFoundPage() {
  const body =
    heading('404 / PAGE NOT FOUND', 'Let’s get you<br><em>back on track.</em>', 'The page you’re looking for is not available.') +
    `<div class="wrap section-topless actions">${btn('/', 'Return home')}${btn('/products/', 'Browse products', true)}</div>`;
  return { path: '/404/', title: `Page Not Found | ${SITE}`, description: 'This page is not available.', body, robots: 'noindex,follow' };
}
