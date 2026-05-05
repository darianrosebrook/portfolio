import React from 'react';
import { render, screen } from '../test-utils';
import ToggleSwitch from '@/ui/components/ToggleSwitch';

describe('ToggleSwitch', () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with children correctly', () => {
    render(<ToggleSwitch {...defaultProps}>Test Toggle</ToggleSwitch>);

    const toggle = screen.getByRole('switch', { name: 'Test Toggle' });
    expect(toggle).toBeInTheDocument();
  });

  it('renders checked state correctly', () => {
    render(
      <ToggleSwitch {...defaultProps} checked={true}>
        Test Toggle
      </ToggleSwitch>
    );

    const toggle = screen.getByRole('switch', { name: 'Test Toggle' });
    expect(toggle).toBeChecked();
  });
});
