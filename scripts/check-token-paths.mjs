#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const data = JSON.parse(readFileSync(path.join(ROOT, 'ui/designTokens.json'), 'utf8'));

function getByPath(obj, p) {
  const parts = p.split('.');
  let curr = obj;
  for (const k of parts) {
    if (!curr || typeof curr !== 'object') return undefined;
    curr = curr[k];
  }
  return curr;
}

function findPaths(obj, prefix = '') {
  const paths = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && '$value' in v) {
      paths.push({ path: p, type: v.$type, value: v.$value });
    } else if (v && typeof v === 'object') {
      paths.push(...findPaths(v, p));
    }
  }
  return paths;
}

const allPaths = findPaths(data);

const checks = process.argv.slice(2);
if (checks.length > 0) {
  for (const p of checks) {
    const v = getByPath(data, p);
    console.log(`${p}: ${v ? JSON.stringify(v).slice(0, 100) : 'NOT FOUND'}`);
  }
} else {
  // Default: show all paths
  for (const { path: p, type, value } of allPaths) {
    console.log(`${p} [${type}] = ${JSON.stringify(value).slice(0, 60)}`);
  }
}
