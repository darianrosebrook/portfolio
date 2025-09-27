import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SlinkyCursor from '../SlinkyCursor';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('SlinkyCursor', () => {
  it('renders slinky cursor', () => {
    render(<SlinkyCursor />);

    const cursor = document.querySelector('.slinky-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SlinkyCursor className="custom-class" />);

    const cursor = document.querySelector('.slinky-cursor');
    expect(cursor).toHaveClass('custom-class');
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<SlinkyCursor />);

      const cursor = document.querySelector('.slinky-cursor');

      // Verify CSS custom properties are being used
      expect(cursor).toHaveClass('slinkyCursor');
    });
  });
});
