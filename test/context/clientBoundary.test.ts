import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The root layout is a server component and imports the context providers.
 * Any context module that touches createContext or a React hook must therefore
 * declare itself a client module, or the RSC boundary rejects it at build time
 * with "You're importing a module that depends on createContext into a React
 * Server Component module".
 *
 * This pins that boundary so a new context module (or a dropped directive)
 * fails here in milliseconds instead of in a production build.
 */

const CONTEXT_DIR = join(process.cwd(), 'context');

/** APIs that force a module onto the client side of the RSC boundary. */
const CLIENT_ONLY_APIS = [
  'createContext',
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useContext',
  'useReducer',
  'useMemo',
  'useCallback',
];

/**
 * The first thing a client module must say. `'use client'` is only honored as
 * the leading statement, so position — not mere presence — is what matters.
 */
function firstStatement(source: string): string {
  const lines = source.split('\n');
  let inBlockComment = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') continue;

    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false;
      continue;
    }
    if (line.startsWith('/*')) {
      if (!line.includes('*/')) inBlockComment = true;
      continue;
    }
    if (line.startsWith('//')) continue;

    return line;
  }
  return '';
}

function usedClientApis(source: string): string[] {
  return CLIENT_ONLY_APIS.filter((api) =>
    new RegExp(`\\b${api}\\b`).test(source)
  );
}

const moduleFiles = readdirSync(CONTEXT_DIR).filter(
  (f) => f.endsWith('.ts') || f.endsWith('.tsx')
);

describe('context/ client boundary', () => {
  it('finds context modules to check', () => {
    // Guards against the suite silently passing because the glob broke.
    expect(moduleFiles.length).toBeGreaterThan(0);
  });

  it.each(moduleFiles)(
    '%s declares "use client" first when it uses client-only React APIs',
    (file) => {
      const source = readFileSync(join(CONTEXT_DIR, file), 'utf8');
      const apis = usedClientApis(source);

      if (apis.length === 0) {
        // A pure re-export barrel needs no directive; nothing to assert.
        return;
      }

      expect(
        firstStatement(source),
        `context/${file} uses ${apis.join(', ')} but does not open with a ` +
          `'use client' directive. Importing it from the server root layout ` +
          `will fail the build.`
      ).toMatch(/^'use client'|^"use client"/);
    }
  );

  it('covers the two modules that regressed in FIX-001', () => {
    // Pins the specific files that broke when providers moved into the
    // server layout, so a future refactor cannot quietly drop them.
    expect(moduleFiles).toContain('ReducedMotionContext.tsx');
    expect(moduleFiles).toContain('InteractionContext.tsx');
  });
});
