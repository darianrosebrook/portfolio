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

    // The component renders a checkbox, not a switch
    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute(
      'id',
      expect.stringContaining('toggleSwitch')
    );
  });

  it('renders checked state correctly', () => {
    render(
      <ToggleSwitch {...defaultProps} checked={true}>
        Test Toggle
      </ToggleSwitch>
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });
});
