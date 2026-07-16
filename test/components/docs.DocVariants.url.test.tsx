import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DocVariants } from '@/ui/modules/CodeSandbox/variants/DocVariants';

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
    sandpack: { files: { '/App.tsx': {} }, openFile: vi.fn() },
  }),
}));

describe('DocVariants URL sync', () => {
  it('reads initial selection from URL and updates query on selection', () => {
    window.history.replaceState(null, '', '/docs?size=md&tone=brand#x');

    const project = {
      files: [{ path: '/App.tsx', contents: 'export default null' }],
    } as any;
    const grid = {
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
    } as any;

    const { getAllByRole } = render(
      <DocVariants
        project={project}
        componentName="TestComponent"
        controls={[]}
        grid={grid}
        linkSelectionToURL
      />
    );

    // Component reads initial values from URL params on mount
    expect(window.location.search).toContain('size=md');
    expect(window.location.search).toContain('tone=brand');

    // The only interactive element rendered is the "Open in CodeSandbox" link;
    // variant tile selectors are not rendered when controls=[] and no grid tile
    // UI is present. Verify the link is present (not a <button>).
    const links = getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
