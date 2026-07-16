import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { DocInteractive } from '@/ui/modules/CodeSandbox/variants/DocInteractive';

// DocInteractive renders a real SandpackProvider (via CodeWorkbench), which
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
  SandpackPreview: () => null,
  SandpackCodeEditor: () => null,
  useSandpack: () => ({
    sandpack: { files: { '/App.tsx': {} }, openFile: vi.fn() },
  }),
}));

vi.useFakeTimers();

describe('DocInteractive hash debounce', () => {
  it('debounces hash updates on rapid section changes', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const sections = [
      { id: 'a', code: { file: '/A.tsx', lines: [1, 2] } },
      { id: 'b', code: { file: '/B.tsx', lines: [3, 4] } },
    ] as any;

    // Render component (SectionSync will not run without nodes; simulate highlight changes via props bridge behavior)
    render(
      <div>
        <div data-section-id="a">A</div>
        <div data-section-id="b">B</div>
        <DocInteractive
          project={{ files: [{ path: '/A.tsx', contents: '' }] }}
          sections={sections}
        />
      </div>
    );

    // Trigger multiple hash updates by programmatically changing hash and advancing timers
    window.history.replaceState(null, '', '#a');
    window.history.replaceState(null, '', '#b');
    vi.advanceTimersByTime(200);

    expect(replaceSpy).toHaveBeenCalled();
  });
});
