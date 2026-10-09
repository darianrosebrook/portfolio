// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { expect, it } from 'vitest';
import nextConfig from '../next.config.mjs';

const require = createRequire(import.meta.url);
const { webpack } = require('next/dist/compiled/webpack/webpack');

it('bundles the lazy fontkit import for a browser and preserves variable glyph outlines', async () => {
  const root = process.cwd();
  const directory = await mkdtemp(path.join(tmpdir(), 'fontkit-browser-'));
  let compiler;

  try {
    const entry = path.join(directory, 'entry.js');
    await writeFile(
      entry,
      // Keep the asynchronous import in one file so the VM needs no script loader.
      `globalThis.fontReady = import(/* webpackMode: "eager" */ 'fontkit')
        .then(({ create }) => create(new Uint8Array(globalThis.fontBytes)));`
    );

    const config = nextConfig.webpack(
      {
        mode: 'development',
        target: 'web',
        context: root,
        entry,
        devtool: false,
        output: { path: directory, filename: 'browser.js' },
        resolve: { modules: [path.join(root, 'node_modules'), 'node_modules'] },
      },
      { dev: true, isServer: false, isEdge: false }
    );

    compiler = webpack(config);
    const stats = await new Promise((resolve, reject) => {
      compiler.run((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    expect(
      stats.hasErrors(),
      stats.toString({ all: false, errors: true })
    ).toBe(false);

    // This context has browser binary APIs, but no Node require, module or Buffer.
    const context = createContext({
      TextDecoder,
      TextEncoder,
      fontBytes: await readFile(
        path.join(root, 'public/fonts/InterVariable.ttf')
      ),
    });
    runInContext(
      await readFile(path.join(directory, 'browser.js'), 'utf8'),
      context
    );
    const font = await context.fontReady;

    expect(font.familyName).toBe('Inter Variable');
    expect(font.unitsPerEm).toBe(2048);
    const light = font
      .getVariation({ wght: 100, opsz: 32 })
      .glyphForCodePoint(0x41);
    const heavy = font
      .getVariation({ wght: 900, opsz: 32 })
      .glyphForCodePoint(0x41);
    expect(Array.from(light.codePoints)).toEqual([0x41]);
    expect(light.path.toSVG()).toMatch(/^M/);
    expect(heavy.path.toSVG()).not.toBe(light.path.toSVG());
    expect(heavy.advanceWidth).toBeGreaterThan(light.advanceWidth);
  } finally {
    if (compiler) {
      await new Promise((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
