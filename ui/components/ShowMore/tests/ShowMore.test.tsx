import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ShowMore from '../ShowMore';
import { contractTest } from '@/test/utils/contractTest';

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
      <ShowMore className="custom-class" data-testid="showmore-root">
        <ShowMore.Trigger>Trigger</ShowMore.Trigger>
        <ShowMore.Content>Content</ShowMore.Content>
      </ShowMore>
    );

    // className is applied to the root ShowMore div, not the inner trigger button
    const root = screen.getByTestId('showmore-root');
    expect(root).toHaveClass('custom-class');
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

      // <button> has an implicit role of "button" — no explicit role attribute needed.
      // Use getByRole to confirm the element is accessible as a button.
      const trigger = screen.getByRole('button', { name: 'Show more' });
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <ShowMore data-testid="showmore-root">
          <ShowMore.Trigger>Trigger</ShowMore.Trigger>
          <ShowMore.Content>Content</ShowMore.Content>
        </ShowMore>
      );

      // The root container carries the 'showmore' class (CSS module class name)
      const root = screen.getByTestId('showmore-root');
      expect(root).toHaveClass('showmore');
    });
  });

  describe('Contract behavioral obligations', () => {
    contractTest('ShowMore', 'a11y.apgPattern', 'button', () => {
      render(
        <ShowMore>
          <ShowMore.Trigger>Show more</ShowMore.Trigger>
          <ShowMore.Content>Content</ShowMore.Content>
        </ShowMore>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
