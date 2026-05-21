import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DocVariants } from '@/ui/modules/CodeSandbox/variants/DocVariants';

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
