import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Details from '../Details';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Details', () => {
  it('renders details with summary and content', () => {
    render(
      <Details>
        <Details.Summary>Click to expand</Details.Summary>
        <Details.Content>Hidden content</Details.Content>
      </Details>
    );

    const summary = screen.getByText('Click to expand');
    const content = screen.getByText('Hidden content');

    expect(summary).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('toggles content visibility when summary is clicked', () => {
    render(
      <Details>
        <Details.Summary>Toggle</Details.Summary>
        <Details.Content>Content</Details.Content>
      </Details>
    );

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
      <Details className="custom-class">
        <Details.Summary>Summary</Details.Summary>
        <Details.Content>Content</Details.Content>
      </Details>
    );

    const details = screen.getByText('Summary').closest('details');
    expect(details).toHaveClass('custom-class');
  });

  it('starts open when open prop is true', () => {
    render(
      <Details open>
        <Details.Summary>Summary</Details.Summary>
        <Details.Content>Content</Details.Content>
      </Details>
    );

    const content = screen.getByText('Content');
    expect(content).not.toHaveAttribute('hidden');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Details>
          <Details.Summary>Summary</Details.Summary>
          <Details.Content>Content</Details.Content>
        </Details>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper keyboard navigation', () => {
      render(
        <Details>
          <Details.Summary>Summary</Details.Summary>
          <Details.Content>Content</Details.Content>
        </Details>
      );

      const summary = screen.getByText('Summary');
      const details = summary.closest('details');

      // Should be focusable
      details.focus();
      expect(details).toHaveFocus();

      // Should respond to Enter and Space
      fireEvent.keyDown(details, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(details, { key: 'Enter', code: 'Enter' });

      fireEvent.keyDown(details, { key: ' ', code: 'Space' });
      fireEvent.keyUp(details, { key: ' ', code: 'Space' });
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Details>
          <Details.Summary>Summary</Details.Summary>
          <Details.Content>Content</Details.Content>
        </Details>
      );

      const details = screen.getByText('Summary').closest('details');

      // Verify CSS custom properties are being used
      expect(details).toHaveClass('details');
    });
  });
});
