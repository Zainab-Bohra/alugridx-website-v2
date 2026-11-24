import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { config, root } from './config.js';
import { buildSite } from './lib/site.js';
import * as enquiry from './lib/enquiry.js';

const PUBLIC = path.join(root, 'public');
await fsp.mkdir(config.dataDir, { recursive: true, mode: 0o700 });
if (config.dataDir === PUBLIC || config.dataDir.startsWith(PUBLIC + path.sep)) throw new Error('DATA_DIR must be outside public/.');

const site = buildSite();
const siteUrl = new URL(config.siteUrl);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|javascript)|image\/svg)/;

const baseHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(siteUrl.protocol === 'https:' ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}),
  ...(config.staging ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
});

const compressed = new Map(); // key -> {gzip, br}
function send(req, res, status, type, body, extra = {}) {
  const headers = { ...baseHeaders(), 'Content-Type': type, Vary: 'Accept-Encoding', ...extra };
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  headers.ETag = '"' + createHash('md5').update(buf).digest('hex').slice(0, 16) + '"';
  if (status === 200 && req.headers['if-none-match'] === headers.ETag) { res.writeHead(304, headers); return res.end(); }
  let out = buf;
  if (COMPRESSIBLE.test(type) && buf.length > 512) {
    const accept = String(req.headers['accept-encoding'] || '');
    const enc = /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : '';
    if (enc) {
      const key = headers.ETag + enc;
      if (!compressed.has(key)) compressed.set(key, enc === 'br' ? zlib.brotliCompressSync(buf) : zlib.gzipSync(buf));
      if (compressed.size > 500) compressed.clear();
      out = compressed.get(key);
      headers['Content-Encoding'] = enc;
    }
  }
  headers['Content-Length'] = out.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
}
const redirect = (res, to, status = 301) => { res.writeHead(status, { Location: to, ...baseHeaders() }); res.end(); };

async function readBody(req, limit) {
  const parts = []; let size = 0;
  for await (const part of req) { size += part.length; if (size > limit) return null; parts.push(part); }
  return Buffer.concat(parts);
}
const jsonError = (res, status, error) => { res.writeHead(status, { 'Content-Type': 'application/json', ...baseHeaders() }); res.end(JSON.stringify({ ok: false, error })); };
async function sendWebResponse(req, res, r) {
  const h = { ...baseHeaders(), ...Object.fromEntries(r.headers) };
  res.writeHead(r.status, h);
  res.end(req.method === 'HEAD' ? undefined : Buffer.from(await r.arrayBuffer()));
}

/** www <-> non-www and http -> https, so Google only ever sees ONE version of each URL. */
function canonicalRedirect(req) {
  if (!config.forceCanonical) return null;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase().split(':')[0];
  const proto = config.trustProxy ? String(req.headers['x-forwarded-proto'] || siteUrl.protocol.slice(0, -1)) : siteUrl.protocol.slice(0, -1);
  const want = siteUrl.hostname;
  const isVariant = host === 'www.' + want || 'www.' + host === want;
  if (isVariant || (proto !== siteUrl.protocol.slice(0, -1) && host === want)) return siteUrl.origin + req.url;
  return null;
}

const ipOf = (req) => (config.trustProxy ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress) || 'unknown';

async function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return false; }
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) return false;
  let st; try { st = await fsp.stat(file); } catch { return false; }
  if (!st.isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  const versioned = /[?&]v=/.test(req.url) && ['.css', '.js'].includes(ext);
  const cache = versioned ? 'public, max-age=31536000, immutable' : ['.png', '.webp', '.jpg', '.pdf', '.svg'].includes(ext) ? 'public, max-age=604800' : 'public, max-age=3600';
  const extra = { 'Cache-Control': cache };
  if (ext === '.csv') extra['Content-Disposition'] = 'attachment; filename="AluGridX-RFQ-Template.csv"';
  send(req, res, 200, MIME[ext] || 'application/octet-stream', await fsp.readFile(file), extra);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, siteUrl);
    const pathname = url.pathname;
    const isRead = req.method === 'GET' || req.method === 'HEAD';

    if (pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }

    const canon = canonicalRedirect(req);
    if (canon) return redirect(res, canon);

    // ---- enquiry backend ----
    if (pathname === '/api/enquiries') {
      if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed.');
      const len = Number(req.headers['content-length'] || 0);
      if (len > 11 * 1024 * 1024) return jsonError(res, 413, 'Maximum upload is 10 MB.');
      const body = await readBody(req, 11 * 1024 * 1024);
      if (!body) return jsonError(res, 413, 'Maximum upload is 10 MB.');
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (v !== undefined && !['host', 'connection', 'transfer-encoding'].includes(k)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      const request = new Request(new URL(req.url, siteUrl), { method: 'POST', headers, body });
      return sendWebResponse(req, res, await enquiry.submit(request, ipOf(req), site.products));
    }
    if (pathname.startsWith('/api/enquiries/')) return isRead ? sendWebResponse(req, res, await enquiry.attachment(pathname, req.method)) : jsonError(res, 405, 'Method not allowed.');
    if (pathname.startsWith('/enquiry/')) return isRead ? sendWebResponse(req, res, await enquiry.receipt(pathname, req.method)) : jsonError(res, 405, 'Method not allowed.');

    if (!isRead) return jsonError(res, 405, 'Method not allowed.');

    // ---- generated files ----
    if (pathname === '/robots.txt') return send(req, res, 200, MIME['.txt'], site.robots, { 'Cache-Control': 'public, max-age=3600' });
    if (pathname === '/sitemap.xml') return send(req, res, 200, MIME['.xml'], site.sitemap, { 'Cache-Control': 'public, max-age=3600' });
    if (pathname === '/data.js') return send(req, res, 200, MIME['.js'], site.dataJs, { 'Cache-Control': /[?&]v=/.test(req.url) ? 'public, max-age=31536000, immutable' : 'no-cache' });

    // ---- 301 redirects (old URLs -> new URLs) ----
    const slashed = pathname.endsWith('/') ? pathname : pathname + '/';
    const target = site.redirects.get(slashed.toLowerCase());
    if (target) return redirect(res, target + url.search);

    // ---- HTML pages ----
    if (!/\.[a-z0-9]+$/i.test(pathname)) {
      if (!pathname.endsWith('/')) return redirect(res, pathname + '/' + url.search);
      const page = site.pages.get(pathname) || site.pages.get(pathname.toLowerCase());
      if (page) return send(req, res, 200, MIME['.html'], page.html, { 'Cache-Control': 'public, max-age=0, must-revalidate' });
    } else if (await serveStatic(req, res, pathname)) return;

    return send(req, res, 404, MIME['.html'], site.notFound, { 'Cache-Control': 'no-cache' });
  } catch (e) {
    console.error('Request error:', e);
    if (!res.headersSent) jsonError(res, 500, 'Request could not be processed. Please try again.');
    else res.end();
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.listen(config.port, config.host, () =>
  console.log(`AluGridX running on http://${config.host}:${config.port}  (SITE_URL=${config.siteUrl}${config.staging ? ', STAGING: noindex' : ''}) – ${site.pages.size} pages, ${site.redirects.size} redirects`),
);
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
