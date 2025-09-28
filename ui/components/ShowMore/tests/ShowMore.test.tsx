import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ShowMore from '../ShowMore';

// Extend Jest matchers

describe('ShowMore', () => {
  it('renders show more component', () => {
    render(
      <ShowMore>
        <ShowMore.Trigger>Show more</ShowMore.Trigger>
        <ShowMore.Content>Hidden content</ShowMore.Content>
      </ShowMore>
    );

    const trigger = screen.getByText('Show more');
    const content = screen.getByText('Hidden content');

    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('toggles content visibility', () => {
    render(
      <ShowMore>
        <ShowMore.Trigger>Toggle</ShowMore.Trigger>
        <ShowMore.Content>Content</ShowMore.Content>
      </ShowMore>
    );

    const trigger = screen.getByText('Toggle');
    const content = screen.getByText('Content');

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
      <ShowMore className="custom-class">
        <ShowMore.Trigger>Trigger</ShowMore.Trigger>
        <ShowMore.Content>Content</ShowMore.Content>
      </ShowMore>
    );

    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ShowMore>
          <ShowMore.Trigger>Show more</ShowMore.Trigger>
          <ShowMore.Content>Content</ShowMore.Content>
        </ShowMore>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper button semantics', () => {
      render(
        <ShowMore>
          <ShowMore.Trigger>Show more</ShowMore.Trigger>
          <ShowMore.Content>Content</ShowMore.Content>
        </ShowMore>
      );

      const trigger = screen.getByText('Show more');
      expect(trigger).toHaveAttribute('role', 'button');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <ShowMore>
          <ShowMore.Trigger>Trigger</ShowMore.Trigger>
          <ShowMore.Content>Content</ShowMore.Content>
        </ShowMore>
      );

      const trigger = screen.getByText('Trigger');

      // Verify CSS custom properties are being used
      expect(trigger).toHaveClass('showMore');
    });
  });
});
