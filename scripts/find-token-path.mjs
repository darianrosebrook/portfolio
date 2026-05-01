#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const data = JSON.parse(readFileSync(path.join(ROOT, 'ui/designTokens.json'), 'utf8'));

const keyword = process.argv[2] ?? 'ring';

function search(obj, prefix = '') {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && '$value' in v) {
      if (p.includes(keyword) || k.includes(keyword)) {
        console.log(p, '=', JSON.stringify(v.$value).slice(0, 60));
      }
    } else if (v && typeof v === 'object') {
      search(v, p);
    }
  }
}
search(data);
