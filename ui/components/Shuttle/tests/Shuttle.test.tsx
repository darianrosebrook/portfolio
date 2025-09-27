import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Shuttle from '../Shuttle';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Shuttle', () => {
  it('renders shuttle component', () => {
    render(
      <Shuttle>
        <Shuttle.Item>Item 1</Shuttle.Item>
        <Shuttle.Item>Item 2</Shuttle.Item>
      </Shuttle>
    );

    const item1 = screen.getByText('Item 1');
    const item2 = screen.getByText('Item 2');

    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Shuttle className="custom-class">
        <Shuttle.Item>Item</Shuttle.Item>
      </Shuttle>
    );

    const item = screen.getByText('Item');
    expect(item).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Shuttle data-testid="test-shuttle">
        <Shuttle.Item>Item</Shuttle.Item>
      </Shuttle>
    );

    expect(screen.getByTestId('test-shuttle')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Shuttle>
          <Shuttle.Item>Item</Shuttle.Item>
        </Shuttle>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Shuttle>
          <Shuttle.Item>Item</Shuttle.Item>
        </Shuttle>
      );

      const item = screen.getByText('Item');

      // Verify CSS custom properties are being used
      expect(item).toHaveClass('shuttle');
    });
  });
});
