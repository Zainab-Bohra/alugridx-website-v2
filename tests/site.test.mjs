import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/check-seo.js';

const { site, errors } = audit();

test('SEO audit has no errors', () => assert.deepEqual(errors, []));

test('old WordPress product URLs are live pages', () => {
  for (const u of [
    '/ceiling-diffusers/', '/linear-bar-grilles/', '/linear-slot-diffusers/', '/door-transfer-grilles/',
    '/external-louvers/', '/sand-trap-louvers/', '/volume-control-dampers/', '/round-ceiling-diffusers/', '/disc-valves/',
    '/supply-return-air-registers-grilles-and-fresh-air-grilles/', '/egegg-crate-grilles-registers-diffusers/',
    '/products/', '/about-us/', '/contact-us/',
  ]) assert.ok(site.pages.has(u), u + ' must exist');
});

test('AI-draft URLs 301 to the old URLs', () => {
  assert.equal(site.redirects.get('/products/ceiling-diffusers/'), '/ceiling-diffusers/');
  assert.equal(site.redirects.get('/about/'), '/about-us/');
  assert.equal(site.redirects.get('/products/egg-crate-grilles/'), '/egegg-crate-grilles-registers-diffusers/');
});

test('sitemap lists only indexable pages', () => {
  assert.ok(!site.sitemap.includes('/quote/'));
  assert.ok(!site.sitemap.includes('/compare/'));
  assert.ok(site.sitemap.includes('/about-us/'));
});
