import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PropControls } from '@/ui/modules/docs/primitives/PropControls';

describe('PropControls', () => {
  it('updates values on boolean and number inputs', () => {
    const controls = [
      {
        id: 'disabled',
        label: 'Disabled',
        kind: 'boolean',
        defaultValue: false,
      },
      {
        id: 'count',
        label: 'Count',
        kind: 'number',
        defaultValue: 1,
        min: 0,
        max: 10,
      },
    ] as any;
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <PropControls controls={controls} values={{}} onChange={onChange} />
    );

    const checkbox = getByLabelText('Disabled') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalled();

    const number = getByLabelText('Count') as HTMLInputElement;
    fireEvent.change(number, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
