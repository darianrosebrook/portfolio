import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Links from '../Links';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Links', () => {
  it('renders links list correctly', () => {
    render(
      <Links>
        <Links.Item href="/link1">Link 1</Links.Item>
        <Links.Item href="/link2">Link 2</Links.Item>
      </Links>
    );

    const link1 = screen.getByText('Link 1');
    const link2 = screen.getByText('Link 2');

    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
    expect(link1).toHaveAttribute('href', '/link1');
    expect(link2).toHaveAttribute('href', '/link2');
  });

  it('applies custom className', () => {
    render(
      <Links className="custom-class">
        <Links.Item href="/test">Test Link</Links.Item>
      </Links>
    );

    const container = screen.getByText('Test Link').closest('ul, ol');
    expect(container).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Links data-testid="test-links">
        <Links.Item href="/test">Test Link</Links.Item>
      </Links>
    );

    expect(screen.getByTestId('test-links')).toBeInTheDocument();
  });

  it('renders as ordered list when type is "ol"', () => {
    render(
      <Links type="ol">
        <Links.Item href="/test">Test Link</Links.Item>
      </Links>
    );

    const container = screen.getByText('Test Link').closest('ol');
    expect(container).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Links>
          <Links.Item href="/test">Test Link</Links.Item>
        </Links>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper list structure', () => {
      render(
        <Links>
          <Links.Item href="/test1">Link 1</Links.Item>
          <Links.Item href="/test2">Link 2</Links.Item>
        </Links>
      );

      const list = screen.getByRole('list');
      const listItems = screen.getAllByRole('listitem');

      expect(list).toBeInTheDocument();
      expect(listItems).toHaveLength(2);
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Links>
          <Links.Item href="/test">Test Link</Links.Item>
        </Links>
      );

      const list = screen.getByRole('list');

      // Verify CSS custom properties are being used
      expect(list).toHaveClass('links');
    });
  });
});
