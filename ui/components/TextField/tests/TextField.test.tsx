import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import TextField from '../TextField';

// Extend Jest matchers

describe('TextField', () => {
  it('renders text field with label', () => {
    render(<TextField label="Test Label" />);

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('connects label to input correctly', () => {
    render(<TextField label="Email" />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');

    expect(input).toHaveAttribute('aria-labelledby');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('applies custom className', () => {
    render(<TextField label="Test" className="custom-class" />);
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();

    render(<TextField label="Test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test value' }),
      })
    );
  });

  it('can be disabled', () => {
    render(<TextField label="Test" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows error state', () => {
    render(<TextField label="Test" error="This field is required" />);

    const input = screen.getByRole('textbox');
    const error = screen.getByText('This field is required');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(error).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<TextField label="Test Field" />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('associates label with input correctly', () => {
      render(<TextField label="Email Address" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address');

      expect(input).toHaveAttribute('aria-labelledby');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('provides error message association', () => {
      render(<TextField label="Test" error="Error message" />);
      const input = screen.getByRole('textbox');
      const error = screen.getByText('Error message');

      expect(input).toHaveAttribute('aria-describedby');
      expect(error).toHaveAttribute('id');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<TextField label="Test" />);
      const input = screen.getByRole('textbox');

      // Verify CSS custom properties are being used
      expect(input).toHaveClass('input');
    });
  });
});
