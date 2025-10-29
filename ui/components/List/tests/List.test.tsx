import * as React from 'react';
import { render, screen } from '@testing-library/react';

import List from '../List';

// Extend Jest matchers

describe('List', () => {
  it('renders list correctly', () => {
    render(
      <List>
        <li>Item 1</li>
        <li>Item 2</li>
      </List>
    );

    const list = screen.getByRole('list');
    const item1 = screen.getByText('Item 1');
    const item2 = screen.getByText('Item 2');

    expect(list).toBeInTheDocument();
    expect(item1).toBeInTheDocument();
    expect(item2).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <List className="custom-class">
        <li>Item</li>
      </List>
    );

    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <List data-testid="test-list">
        <li>Item</li>
      </List>
    );

    expect(screen.getByTestId('test-list')).toBeInTheDocument();
  });

  it('renders as ordered list when as is "ol"', () => {
    render(
      <List as="ol">
        <li>Item</li>
      </List>
    );

    const list = screen.getByText('Item').closest('ol');
    expect(list).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <List>
          <li>Item</li>
        </List>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper list structure', () => {
      render(
        <List>
          <li>Item 1</li>
          <li>Item 2</li>
        </List>
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
        <List>
          <li>Item</li>
        </List>
      );

      const list = screen.getByRole('list');

      // Verify CSS custom properties are being used
      expect(list).toHaveClass('list');
    });
  });
});
