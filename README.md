# AluGridX website (Node.js, SEO-first)

Same design as the approved AI draft (`public/style.css` + `public/app.js` untouched apart from product links),
rebuilt as a clean, editable Node.js project that **keeps the live WordPress URLs** so existing SEO is not lost.
Zero runtime dependencies (Node 22+). `nodemailer` is optional, only for SMTP e-mail.

## Run locally
```bash
cp .env.example .env      # set SITE_URL=http://localhost:3000, TRUST_PROXY=0, FORCE_CANONICAL=0
npm start                 # http://localhost:3000
npm run check             # SEO audit (titles, canonicals, broken links, redirects)
npm test
```

## Folder structure
```
server.js            HTTP server: redirects, static files, gzip/brotli, caching, security headers, enquiry API
config.js            .env + business facts (phone, e-mail, address)
lib/layout.js        <head> (title, canonical, Open Graph, Twitter, JSON-LD), header, footer
lib/ui.js            HTML helpers: cards, buttons, enquiry form, finish SVG
lib/seo.js           schema.org builders, sitemap.xml, robots.txt, per-page SEO overrides
lib/site.js          renders all pages once at start-up + builds the 301 redirect table
lib/enquiry.js       enquiry API: validation, uploads, private receipts
lib/mail.js          e-mail notification (SMTP or webhook)
pages/home.js        homepage
pages/catalog.js     /products/, product pages, finder, compare, gallery, applications, downloads
pages/company.js     about-us, custom-manufacturing, contact-us, quote, privacy, 404
data/products.json   ALL product content + `slug` (= URL on the old site)
data/seo.json        exact <title>/<meta description> per URL  <-- fill with the OLD site's values
data/redirects.json  old URL -> new URL (301)
public/              style.css, app.js, assets/, resources/ (PDFs)
scripts/check-seo.js SEO audit
hosting/             nginx, pm2, systemd examples
```

## Editing content
* Product text/options: `data/products.json` then restart. A new product = new object + image in `public/assets/`.
* Page text: the matching file in `pages/`.
* Title/description of any URL: `data/seo.json` (key = URL path).
* Phone / e-mail / address: `config.js`.

## Deploy (VPS / Node hosting)
1. Upload the folder OUTSIDE the web root. `npm install --omit=dev` (only if using SMTP: `npm i nodemailer`).
2. `.env`: `SITE_URL=https://alugridx.com` (must equal the live canonical host), `DATA_DIR=/var/lib/alugridx`,
   `TRUST_PROXY=1`, `FORCE_CANONICAL=1`, SMTP_* or CONTACT_ENDPOINT.
3. Run with pm2 or systemd (see `hosting/`), put Nginx + HTTPS in front (`hosting/nginx.conf.example`).
4. Submit a test enquiry and confirm the e-mail arrives. Back up `DATA_DIR`.

## SEO migration checklist (do not skip)
1. BEFORE launch: crawl the live WordPress site (Screaming Frog, free up to 500 URLs) and export every URL, title,
   meta description, H1. Also export "Pages" from Google Search Console.
2. Copy exact old titles/descriptions into `data/seo.json`; every old URL must either exist or be listed in `data/redirects.json`.
3. Test on a staging domain with `STAGING=1` (noindex). Run `npm run check`.
4. Launch on the SAME domain (no change of address needed). Remove `STAGING`.
5. Same day: re-test all old URLs return 200 or a single 301 (no chains), submit `/sitemap.xml` in Search Console,
   request indexing of the homepage, check Coverage/Pages report daily for 2 weeks.
6. Keep the old WordPress backup for at least 6 months.
