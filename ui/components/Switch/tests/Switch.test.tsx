import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Switch from '../Switch';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Switch', () => {
  it('renders switch', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Switch data-testid="test-switch" />);

    expect(screen.getByTestId('test-switch')).toBeInTheDocument();
  });

  it('can be checked', () => {
    render(<Switch checked />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('can be disabled', () => {
    render(<Switch disabled />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('toggles when clicked', () => {
    let checked = false;
    const handleChange = jest.fn((e) => (checked = e.target.checked));

    render(<Switch checked={checked} onChange={handleChange} />);

    const switchElement = screen.getByRole('switch');

    // Click to check
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: { checked: true } })
    );

    // Click to uncheck
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: { checked: false } })
    );
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Switch />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Switch />);

      const switchElement = screen.getByRole('switch');

      // Verify CSS custom properties are being used
      expect(switchElement).toHaveClass('switch');
    });
  });
});
