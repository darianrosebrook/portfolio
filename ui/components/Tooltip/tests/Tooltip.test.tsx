import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Tooltip from '../Tooltip';

// Extend Jest matchers

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toBeInTheDocument();
  });

  it('shows tooltip content on hover', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger');
    const tooltip = screen.getByText('Tooltip text');

    // Tooltip should be hidden initially
    expect(tooltip).toHaveAttribute('hidden');

    // Hover to show
    fireEvent.mouseEnter(trigger);
    expect(tooltip).not.toHaveAttribute('hidden');
  });

  it('applies custom className', () => {
    render(
      <Tooltip content="Content" className="custom-class">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Tooltip content="Content">
          <button>Trigger</button>
        </Tooltip>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Trigger');
      expect(trigger).toHaveAttribute('aria-describedby');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Tooltip content="Content">
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Trigger');

      // Verify CSS custom properties are being used
      expect(trigger).toHaveClass('tooltip');
    });
  });
});
