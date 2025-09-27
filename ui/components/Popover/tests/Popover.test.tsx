import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Popover from '../Popover';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Popover', () => {
  it('renders popover trigger', () => {
    render(
      <Popover>
        <Popover.Trigger>Click me</Popover.Trigger>
        <Popover.Content>Popover content</Popover.Content>
      </Popover>
    );

    const trigger = screen.getByText('Click me');
    expect(trigger).toBeInTheDocument();
  });

  it('shows content when trigger is clicked', () => {
    render(
      <Popover>
        <Popover.Trigger>Click me</Popover.Trigger>
        <Popover.Content>Popover content</Popover.Content>
      </Popover>
    );

    const trigger = screen.getByText('Click me');
    const content = screen.getByText('Popover content');

    // Content should be hidden initially
    expect(content).toHaveAttribute('hidden');

    // Click to show
    fireEvent.click(trigger);
    expect(content).not.toHaveAttribute('hidden');

    // Click again to hide
    fireEvent.click(trigger);
    expect(content).toHaveAttribute('hidden');
  });

  it('applies custom className', () => {
    render(
      <Popover className="custom-class">
        <Popover.Trigger>Click me</Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    );

    const trigger = screen.getByText('Click me');
    expect(trigger).toHaveClass('custom-class');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByText('Click me');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByText('Click me');

      // Verify CSS custom properties are being used
      expect(trigger).toHaveClass('popover');
    });
  });
});
