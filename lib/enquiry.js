import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { esc } from './ui.js';
import { versions } from './layout.js';
import { notifyTeam } from './mail.js';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const fail = (error, status = 400) => new Response(JSON.stringify({ ok: false, error }), { status, headers: JSON_HEADERS });
const ok = (data) => new Response(JSON.stringify(data), { headers: JSON_HEADERS });

const TYPES = {
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  dwg: 'application/octet-stream', dxf: 'application/octet-stream',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel', csv: 'text/csv',
};
const FINISHES = ['RAL 9016 — Traffic white', 'RAL 9005 — Jet black', 'Custom finish — confirm with factory'];
const FIELD_MAX = { name: 100, email: 160, phone: 40, company: 160, project: 160, location: 160, delivery: 20, message: 5000 };
export const validToken = (s) => /^[a-f0-9]{48}$/.test(s);

// --- tiny file store: DATA_DIR/enquiries/<token>/record.json + files/<n> ---
const dir = (token) => path.join(config.dataDir, 'enquiries', token);
async function put(token, rel, data) {
  const file = path.join(dir(token), rel);
  await fsp.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = file + '.' + randomUUID() + '.tmp';
  await fsp.writeFile(tmp, data, { mode: 0o600 });
  await fsp.rename(tmp, file);
}
async function get(token, rel) {
  try { return await fsp.readFile(path.join(dir(token), rel)); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}

const limits = new Map(); // simple per-IP rate limit: 6 enquiries / minute

/** POST /api/enquiries  (multipart/form-data from public/app.js) */
export async function submit(request, ip, products) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return fail('Please submit this form from the AluGridX website.', 403);
  if (Number(request.headers.get('Content-Length') || 0) > 11 * 1024 * 1024) return fail('The total upload is too large. Attach up to 10 MB.', 413);
  if (!(request.headers.get('Content-Type') || '').startsWith('multipart/form-data')) return fail('Please submit the website enquiry form.');

  const now = Date.now();
  const hit = limits.get(ip) || { count: 0, start: now };
  if (now - hit.start > 60000) { hit.count = 0; hit.start = now; }
  if (hit.count >= 6) return fail('Please wait one minute before submitting another request.', 429);
  hit.count++; limits.set(ip, hit); if (limits.size > 5000) limits.clear();

  let form;
  try { form = await request.formData(); } catch { return fail('The form could not be read. Please try again.'); }
  if (form.get('website')) return fail('The request could not be accepted.'); // honeypot

  const fields = {};
  for (const [key, max] of Object.entries(FIELD_MAX)) {
    const v = form.get(key);
    if (v !== null && typeof v !== 'string') return fail('Invalid form field.');
    fields[key] = String(v || '').trim();
    if (fields[key].length > max) return fail('One of the form fields is too long.');
  }
  if (!fields.name || !fields.phone || !fields.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    return fail('Please enter your name, valid email, phone number and project message.');
  if (form.get('consent') !== 'on') return fail('Please agree to the use of your details for this enquiry.');

  let items;
  try { items = JSON.parse(String(form.get('items') || '[]')); } catch { return fail('The product schedule could not be read.'); }
  if (!Array.isArray(items) || items.length > 50) return fail('Use up to 50 product lines per request.');
  const safeItems = [];
  const int = (n, max) => Number.isInteger(n) && n >= 1 && n <= max;
  for (const it of items) {
    const p = it && typeof it === 'object' && products.find((x) => x.id === it.product);
    if (!p || !int(it.width, 30000) || !int(it.height, 30000) || !int(it.quantity, 100000) || !FINISHES.includes(it.finish) || typeof it.notes !== 'string' || it.notes.length > 1000)
      return fail('Review the products, dimensions, finishes and quantities in your basket.');
    safeItems.push({ product: p.id, name: p.name, width: it.width, height: it.height, quantity: it.quantity, finish: it.finish, notes: it.notes });
  }

  const files = form.getAll('files').filter((f) => typeof f !== 'string' && f.size > 0);
  if (files.length > 5) return fail('Attach up to five files.');
  if (files.reduce((n, f) => n + f.size, 0) > 10 * 1024 * 1024) return fail('Attachments must total 10 MB or less.');
  for (const f of files) {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!TYPES[ext]) return fail('One of the attachment types is not supported.');
    if (f.size > 5 * 1024 * 1024) return fail('Each attachment must be 5 MB or less.');
  }

  const token = randomBytes(24).toString('hex');
  const reference = 'AGX-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-' + token.slice(0, 8).toUpperCase();
  const record = { reference, createdAt: new Date().toISOString(), kind: form.get('kind') === 'quotation' ? 'quotation' : 'general', fields, items: safeItems, files: [], notified: false };
  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop().toLowerCase();
      const name = f.name.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 180);
      await put(token, 'files/' + i, Buffer.from(await f.arrayBuffer()));
      record.files.push({ index: i, name, size: f.size, type: TYPES[ext] });
    }
    await put(token, 'record.json', JSON.stringify(record));
  } catch (e) {
    console.error('Enquiry save failed:', e.message);
    return fail('We could not save your request. Your form details have been kept; please try again or contact our team.', 503);
  }

  const receipt = '/enquiry/' + token + '/';
  const link = config.siteUrl + receipt;
  const text = [
    'Website enquiry ' + reference, 'Type: ' + record.kind,
    'Name: ' + fields.name, 'Email: ' + fields.email, 'Phone: ' + fields.phone, 'Company: ' + fields.company,
    'Project: ' + fields.project, 'Location: ' + fields.location, 'Delivery requested: ' + fields.delivery, '',
    fields.message, '',
    ...safeItems.map((x, i) => `${i + 1}. ${x.name} | ${x.width} × ${x.height} mm | Qty ${x.quantity} | ${x.finish} | ${x.notes}`), '',
    'Attachments: ' + record.files.length, 'View submission and attachments: ' + link,
  ].join('\n');
  record.notified = await notifyTeam({ fields, subject: `Website enquiry ${reference} – ${fields.name}`, text });
  try { await put(token, 'record.json', JSON.stringify(record)); } catch {}
  return ok({ ok: true, reference, receipt, notified: record.notified });
}

/** GET /api/enquiries/<token>/files/<n> */
export async function attachment(pathname, method) {
  const m = pathname.match(/^\/api\/enquiries\/([a-f0-9]{48})\/files\/(\d)$/);
  if (!m) return fail('Attachment not found.', 404);
  const rec = await get(m[1], 'record.json');
  if (!rec) return fail('Attachment not found.', 404);
  const file = JSON.parse(rec).files.find((f) => f.index === +m[2]);
  const body = file && (await get(m[1], 'files/' + file.index));
  if (!body) return fail('Attachment not found.', 404);
  return new Response(method === 'HEAD' ? null : body, {
    headers: { 'Content-Type': file.type, 'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(file.name), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' },
  });
}

/** GET /enquiry/<token>/  (private receipt, noindex) */
export async function receipt(pathname, method) {
  const token = pathname.split('/')[2];
  if (!validToken(token)) return fail('Enquiry not found.', 404);
  const raw = await get(token, 'record.json');
  if (!raw) return fail('Enquiry not found.', 404);
  const record = JSON.parse(raw);
  const f = record.fields;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>${esc(record.reference)} — AluGridX</title><link rel="stylesheet" href="/style.css?v=${versions.css}"></head><body><main class="receipt"><a href="/"><img src="/assets/logo-color.png" alt="AluGridX" width="220" height="40"></a><div class="eyebrow" style="margin-top:35px">ENQUIRY RECEIPT</div><h1>${esc(record.reference)}</h1><p>Submitted ${esc(record.createdAt)}. This receipt confirms storage of your request; it is not an order confirmation or a price quotation.</p><p>${record.notified ? 'Notification to the AluGridx team was confirmed.' : 'Automatic email notification was not confirmed. Please share this reference with info@alugridx.com or call +971 58 552 1251.'}</p><dl>${Object.entries(f).filter(([k]) => k !== 'message').map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || 'Not supplied')}</dd></div>`).join('')}</dl><h2>Project message</h2><pre>${esc(f.message)}</pre>${record.items.length ? `<h2>Product schedule</h2><div class="receipt-table-wrap"><table><thead><tr><th>Product</th><th>Dimensions (mm)</th><th>Quantity</th><th>Finish / notes</th></tr></thead><tbody>${record.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.width} × ${i.height}</td><td>${i.quantity}</td><td>${esc(i.finish)}<br>${esc(i.notes)}</td></tr>`).join('')}</tbody></table></div>` : ''}<h2>Attachments</h2><div class="files">${record.files.length ? record.files.map((x) => `<a href="/api/enquiries/${token}/files/${x.index}">${esc(x.name)} ↓ (${Math.round(x.size / 1024)} KB)</a>`).join('') : 'No attachments.'}</div><p class="small" style="margin-top:30px">Keep this link private. Anyone with the link can view this submission and its attachments.</p><button class="btn" onclick="window.print()">Print / save receipt</button> <a href="/quote/" class="text-link">Return to quotation builder →</a></main></body></html>`;
  return new Response(method === 'HEAD' ? null : html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' },
  });
}