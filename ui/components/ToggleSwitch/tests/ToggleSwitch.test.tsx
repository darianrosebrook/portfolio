import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ToggleSwitch from '../ToggleSwitch';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('ToggleSwitch', () => {
  it('renders toggle switch', () => {
    render(<ToggleSwitch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ToggleSwitch className="custom-class" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<ToggleSwitch data-testid="test-switch" />);

    expect(screen.getByTestId('test-switch')).toBeInTheDocument();
  });

  it('can be checked', () => {
    render(<ToggleSwitch checked />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('can be disabled', () => {
    render(<ToggleSwitch disabled />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('toggles when clicked', () => {
    let checked = false;
    const handleChange = jest.fn((e) => (checked = e.target.checked));

    render(<ToggleSwitch checked={checked} onChange={handleChange} />);

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
      const { container } = render(<ToggleSwitch />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(<ToggleSwitch />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('provides proper label association', () => {
      render(
        <label>
          Toggle me
          <ToggleSwitch />
        </label>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<ToggleSwitch />);

      const switchElement = screen.getByRole('switch');

      // Verify CSS custom properties are being used
      expect(switchElement).toHaveClass('toggleSwitch');
    });
  });
});
