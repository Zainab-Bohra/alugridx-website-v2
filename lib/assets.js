import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { root } from '../config.js';

/** Short content hash used for cache-busting: /style.css?v=abc123 (safe to cache for 1 year). */
export const fileVersion = (rel) =>
  createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex').slice(0, 10);
