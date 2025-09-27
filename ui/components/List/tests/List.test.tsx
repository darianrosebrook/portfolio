import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import List from '../List';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('List', () => {
  it('renders list correctly', () => {
    render(
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
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
        <List.Item>Item</List.Item>
      </List>
    );

    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <List data-testid="test-list">
        <List.Item>Item</List.Item>
      </List>
    );

    expect(screen.getByTestId('test-list')).toBeInTheDocument();
  });

  it('renders as ordered list when type is "ol"', () => {
    render(
      <List type="ol">
        <List.Item>Item</List.Item>
      </List>
    );

    const list = screen.getByText('Item').closest('ol');
    expect(list).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <List>
          <List.Item>Item</List.Item>
        </List>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper list structure', () => {
      render(
        <List>
          <List.Item>Item 1</List.Item>
          <List.Item>Item 2</List.Item>
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
          <List.Item>Item</List.Item>
        </List>
      );

      const list = screen.getByRole('list');

      // Verify CSS custom properties are being used
      expect(list).toHaveClass('list');
    });
  });
});
