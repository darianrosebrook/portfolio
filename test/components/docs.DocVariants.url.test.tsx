import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DocVariants } from '@/ui/modules/docs/variants/DocVariants';

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

    expect(window.location.search).toContain('size=md');
    expect(window.location.search).toContain('tone=brand');

    const buttons = getAllByRole('button');
    // Click first tile (sm + neutral)
    fireEvent.click(buttons[0]);
    expect(window.location.search).toContain('size=sm');
    expect(window.location.search).toContain('tone=neutral');
  });
});
