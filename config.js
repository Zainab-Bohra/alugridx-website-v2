import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.dirname(fileURLToPath(import.meta.url));
if (fs.existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));

const env = process.env;
export const config = {
  siteUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  port: Number(env.PORT || 3000),
  host: env.HOST || '127.0.0.1',
  dataDir: path.resolve(root, env.DATA_DIR || './private-data'),
  trustProxy: env.TRUST_PROXY === '1',
  forceCanonical: env.FORCE_CANONICAL === '1',
  staging: env.STAGING === '1',
  smtp: { host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), user: env.SMTP_USER, pass: env.SMTP_PASS },
  notifyTo: env.NOTIFY_TO || 'info@alugridx.com',
  notifyFrom: env.NOTIFY_FROM || 'website@alugridx.com',
  contactEndpoint: env.CONTACT_ENDPOINT || '',
};

// Business facts used in the footer, schema.org JSON-LD and the contact page.
export const business = {
  name: 'AluGridX',
  legalName: 'Alugridx Air Conditioning Industry LLC',
  phone: '+971585521251',
  phoneDisplay: '+971 58 552 1251',
  email: 'info@alugridx.com',
  instagram: 'https://www.instagram.com/alugridx/',
  address: {
    street: 'Building No. 144, Warehouse No. 16, Humaideya Street, Al Jurf 3',
    city: 'Ajman',
    country: 'AE',
  },
  logo: '/assets/company-logo.png',
  ogImage: '/assets/company-1.png',
};
