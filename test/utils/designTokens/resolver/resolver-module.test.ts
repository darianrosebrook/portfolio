import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Resolver } from '@/utils/designTokens/utils/resolver-module';
import type { ResolverDocument } from '@/utils/designTokens/utils/resolver-module';

const FIXTURES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures'
);

function loadFixture(name: string): ResolverDocument {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
}

describe('Resolver local behavior', () => {
  it('alias: {a.b} in token value resolves to the target value', () => {
    const doc = loadFixture('simple-alias.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES });
    const result = resolver.resolve();

    const tokens = result.tokens as Record<string, Record<string, Record<string, unknown>>>;
    expect(tokens.alias.token.$value).toBe('blue');
    expect(result.diagnostics).toHaveLength(0);
  });

  it('modifier precedence: later modifier in resolutionOrder overrides earlier set', () => {
    const doc = loadFixture('modifier-override.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES });

    const dark = resolver.resolve({ theme: 'dark' });
    const darkTokens = dark.tokens as Record<string, Record<string, Record<string, unknown>>>;
    expect(darkTokens.color.bg.$value).toBe('black');

    const light = resolver.resolve({ theme: 'light' });
    const lightTokens = light.tokens as Record<string, Record<string, Record<string, unknown>>>;
    expect(lightTokens.color.bg.$value).toBe('lightgray');
  });

  it('circular ref: detected and warned, does not throw or loop', () => {
    const doc = loadFixture('circular-alias.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES });

    const result = resolver.resolve();

    const circular = result.diagnostics.find((d) => d.code === 'CIRCULAR');
    expect(circular).toBeDefined();
    expect(circular?.message).toMatch(/circular/i);
  });

  it('missing file: resolves without the missing set, emits a diagnostic', () => {
    const doc = loadFixture('missing-file.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES });

    const result = resolver.resolve();

    const missing = result.diagnostics.find((d) => d.code === 'MISSING');
    expect(missing).toBeDefined();

    const tokens = result.tokens as Record<string, Record<string, unknown>>;
    expect(tokens.fallback.$value).toBe('ok');
  });

  it('invalid context, strict=false: warning emitted, default context used', () => {
    const doc = loadFixture('invalid-context.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES, strict: false });

    const result = resolver.resolve({ theme: 'nonexistent-context' });

    const typeMismatch = result.diagnostics.find((d) => d.code === 'TYPE_MISMATCH');
    expect(typeMismatch).toBeDefined();

    // default context "light" is used → lightgray overrides white
    const tokens = result.tokens as Record<string, Record<string, unknown>>;
    expect(tokens.color.$value).toBe('lightgray');
  });

  it('invalid context, strict=true: throws', () => {
    const doc = loadFixture('invalid-context.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES, strict: false });

    expect(() => {
      resolver.resolve({ theme: 'nonexistent-context' });
      // Re-run with strict resolver to test throw path
    }).not.toThrow();

    const strictResolver = new Resolver(loadFixture('invalid-context.resolver.json'), {
      basePath: FIXTURES,
      strict: true,
    });
    expect(() => strictResolver.resolve({ theme: 'nonexistent-context' })).toThrow();
  });

  it('version mismatch: throws for a wrong version string', () => {
    const badDoc = {
      version: 'wrong-version',
      sets: {},
      modifiers: {},
      resolutionOrder: [],
    } as unknown as ResolverDocument;

    expect(() => new Resolver(badDoc, { strict: true })).toThrow();
  });

  it('cross-file reference: resolves correctly across fixture files', () => {
    const doc = loadFixture('cross-file-ref.resolver.json');
    const resolver = new Resolver(doc, { basePath: FIXTURES });
    const result = resolver.resolve();

    const tokens = result.tokens as Record<string, Record<string, Record<string, unknown>>>;
    // From base-tokens.json
    expect(tokens.base.color.$value).toBe('cornflowerblue');
    // From inline source in cross-file-ref
    const extra = (result.tokens as Record<string, Record<string, unknown>>).extra;
    expect(extra.$value).toBe('extra-value');
  });
});
