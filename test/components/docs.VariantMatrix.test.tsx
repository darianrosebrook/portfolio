import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { VariantMatrix } from '@/ui/modules/docs/primitives/VariantMatrix';

describe('VariantMatrix', () => {
  it('renders tiles and emits selection', () => {
    const rows = { id: 'size', label: 'Size', values: ['sm', 'md'] } as any;
    const cols = {
      id: 'tone',
      label: 'Tone',
      values: ['neutral', 'brand'],
    } as any;
    const onTileSelect = vi.fn();
    const template = () => <div data-testid="preview" />;

    const { getAllByRole } = render(
      <VariantMatrix
        rows={rows}
        cols={cols}
        template={template}
        onTileSelect={onTileSelect}
      />
    );

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
    expect(onTileSelect).toHaveBeenCalled();
  });
});
