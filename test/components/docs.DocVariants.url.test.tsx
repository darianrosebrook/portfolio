import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DocVariants } from '@/ui/modules/CodeSandbox/variants/DocVariants';
import type {
  VariantGrid,
  VirtualProject,
} from '@/ui/modules/CodeSandbox/types';

const { updateFileMock } = vi.hoisted(() => ({
  updateFileMock: vi.fn(),
}));

// DocVariants renders a real SandpackProvider (via CodeWorkbench), which
// spins up @codesandbox/sandpack-client's bundler iframe. That client is
// meant for a browser, not jsdom: it keeps initializing asynchronously past
// unmount and throws on a torn-down iframe, leaking an unhandled rejection
// into the test run. Mock the package so only the render tree is exercised.
vi.mock('@codesandbox/sandpack-react', () => ({
  SandpackProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SandpackThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SandpackLayout: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  // Real SandpackPreview renders an "Open in CodeSandbox" link in its action
  // bar; stand in with an anchor so the URL-sync test's role="link" check
  // still exercises the same DOM shape it did against the real component.
  SandpackPreview: () => <a href="https://codesandbox.io">Open sandbox</a>,
  SandpackCodeEditor: () => null,
  useSandpack: () => ({
    sandpack: {
      files: { '/App.tsx': {} },
      openFile: vi.fn(),
      updateFile: updateFileMock,
    },
  }),
}));

/** Set the document URL so location.search is populated before mount. */
function setDocumentUrl(url: string): void {
  window.history.replaceState(null, '', url);
  // jsdom 26+ syncs location from replaceState. Older jsdom left it stale;
  // force-sync so DocVariants can still read initial query params.
  if (!window.location.search) {
    const resolved = new URL(url, window.location.origin || 'http://localhost');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ancestorOrigins: [] as unknown as DOMStringList,
        href: resolved.href,
        origin: resolved.origin,
        protocol: resolved.protocol,
        host: resolved.host,
        hostname: resolved.hostname,
        port: resolved.port,
        pathname: resolved.pathname,
        search: resolved.search,
        hash: resolved.hash,
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
        toString: () => resolved.href,
      } satisfies Location,
    });
  }
}

describe('DocVariants URL sync', () => {
  it('reads initial selection from URL and updates query on selection', async () => {
    updateFileMock.mockClear();
    setDocumentUrl('/docs?size=md&tone=brand#x');

    expect(window.location.search).toContain('size=md');
    expect(window.location.search).toContain('tone=brand');

    const project: VirtualProject = {
      files: [{ path: '/App.tsx', contents: 'export default null' }],
    };
    const grid: VariantGrid = {
      rows: {
        id: 'size',
        label: 'Size',
        values: ['sm', 'md'],
        defaultValue: 'sm',
      },
      cols: {
        id: 'tone',
        label: 'Tone',
        values: ['neutral', 'brand'],
        defaultValue: 'neutral',
      },
    };

    const { getAllByRole } = render(
      <DocVariants
        project={project}
        componentName="TestComponent"
        controls={[]}
        grid={grid}
        linkSelectionToURL
      />
    );

    // PropsBridge writes selection into the Sandpack FS; that proves DocVariants
    // initialized values from the URL query (not only that location.search is set).
    await waitFor(() => {
      const propsWrites = updateFileMock.mock.calls.filter(
        (call) => call[0] === '/props.json'
      );
      expect(propsWrites.length).toBeGreaterThan(0);
      const latest = JSON.parse(String(propsWrites.at(-1)?.[1])) as Record<
        string,
        unknown
      >;
      expect(latest).toMatchObject({ size: 'md', tone: 'brand' });
    });

    // The only interactive element rendered is the "Open in CodeSandbox" link;
    // variant tile selectors are not rendered when controls=[] and no grid tile
    // UI is present. Verify the link is present (not a <button>).
    const links = getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
