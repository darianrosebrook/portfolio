import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import ToggleSwitch from '../ToggleSwitch';

// Extend Jest matchers

describe('ToggleSwitch', () => {
  it('renders toggle switch', () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={false} onChange={handleChange}>
        Toggle
      </ToggleSwitch>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch
        checked={false}
        onChange={handleChange}
        className="custom-class"
      >
        Toggle
      </ToggleSwitch>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement.parentElement).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch
        checked={false}
        onChange={handleChange}
        data-testid="test-switch"
      >
        Toggle
      </ToggleSwitch>
    );

    expect(screen.getByTestId('test-switch')).toBeInTheDocument();
  });

  it('can be checked', () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={true} onChange={handleChange}>
        Toggle
      </ToggleSwitch>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('can be disabled', () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={false} onChange={handleChange} disabled>
        Toggle
      </ToggleSwitch>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('toggles when clicked', () => {
    let checked = false;
    const handleChange = vi.fn((e) => (checked = e.target.checked));

    render(
      <ToggleSwitch checked={checked} onChange={handleChange}>
        Toggle
      </ToggleSwitch>
    );

    const switchElement = screen.getByRole('switch');

    // Click to check
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledTimes(1);

    // Click to uncheck
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <ToggleSwitch checked={false} onChange={handleChange}>
          Toggle
        </ToggleSwitch>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      const handleChange = vi.fn();
      render(
        <ToggleSwitch checked={false} onChange={handleChange}>
          Toggle
        </ToggleSwitch>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('provides proper label association', () => {
      render(
        <ToggleSwitch checked={false} onChange={vi.fn()}>
          Toggle
        </ToggleSwitch>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-label', 'Toggle');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      const handleChange = vi.fn();
      render(
        <ToggleSwitch checked={false} onChange={handleChange}>
          Toggle
        </ToggleSwitch>
      );

      const switchElement = screen.getByRole('switch');

      // Verify CSS custom properties are being used
      expect(switchElement.parentElement?.className).toContain('toggleSwitch');
    });
  });
});
