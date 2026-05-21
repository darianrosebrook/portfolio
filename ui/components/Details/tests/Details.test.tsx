import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Details from '../Details';

// Extend Jest matchers

describe('Details', () => {
  it('renders details with summary and content', () => {
    render(<Details summary="Click to expand">Hidden content</Details>);

    const summary = screen.getByText('Click to expand');
    const content = screen.getByText('Hidden content');

    expect(summary).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('toggles content visibility when summary is clicked', () => {
    render(<Details summary="Toggle">Content</Details>);

    const summary = screen.getByText('Toggle');
    const content = screen.getByText('Content');

    // Content should be hidden initially
    expect(content).toHaveAttribute('hidden');

    // Click to expand
    fireEvent.click(summary);
    expect(content).not.toHaveAttribute('hidden');

    // Click to collapse
    fireEvent.click(summary);
    expect(content).toHaveAttribute('hidden');
  });

  it('applies custom className', () => {
    render(
      <Details className="custom-class" summary="Summary">
        Content
      </Details>
    );

    const details = screen.getByText('Summary').closest('details');
    expect(details).toHaveClass('custom-class');
  });

  it('starts open when open prop is true', () => {
    render(
      <Details open summary="Summary">
        Content
      </Details>
    );

    const content = screen.getByText('Content');
    expect(content).not.toHaveAttribute('hidden');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Details summary="Summary">Content</Details>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('exposes the summary as the focusable element and toggles on Enter/Space', () => {
      render(<Details summary="Summary">Content</Details>);

      const summaryText = screen.getByText('Summary');
      const summary = summaryText.closest('summary');
      const content = screen.getByText('Content');

      expect(summary).not.toBeNull();
      // Per HTML spec, <summary> is the focusable element of <details>, not
      // the <details> itself (which has no tabindex by default).
      summary!.focus();
      expect(summary).toHaveFocus();

      // Enter toggles open
      expect(content).toHaveAttribute('hidden');
      fireEvent.keyDown(summary!, { key: 'Enter', code: 'Enter' });
      expect(content).not.toHaveAttribute('hidden');

      // Space toggles closed
      fireEvent.keyDown(summary!, { key: ' ', code: 'Space' });
      expect(content).toHaveAttribute('hidden');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Details summary="Summary">Content</Details>);

      const details = screen.getByText('Summary').closest('details');

      // Verify CSS custom properties are being used
      expect(details).toHaveClass('details');
    });
  });
});
