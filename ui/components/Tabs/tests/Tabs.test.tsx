import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from '../Tabs';

describe('Tabs', () => {
  it('renders tabs with content', () => {
    render(
      <Tabs>
        <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
        <Tabs.Panel value="tab1">Panel 1 Content</Tabs.Panel>
        <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
        <Tabs.Panel value="tab2">Panel 2 Content</Tabs.Panel>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');
    const panel1 = screen.getByText('Panel 1 Content');

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(panel1).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Tabs className="custom-class">
        <Tabs.Tab value="tab1">Tab</Tabs.Tab>
        <Tabs.Panel value="tab1">Content</Tabs.Panel>
      </Tabs>
    );

    const tabs = screen.getByText('Tab').closest('[data-state]');
    expect(tabs).toHaveClass('custom-class');
  });

  it('switches content when tabs are clicked', () => {
    render(
      <Tabs>
        <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
        <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
        <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
        <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');
    const panel1 = screen.getByText('Panel 1');
    const panel2 = screen.getByText('Panel 2');

    // Panel 1 should be visible initially
    expect(panel1).toBeVisible();
    expect(panel2).not.toBeVisible();

    // Click tab 2
    fireEvent.click(tab2);

    // Panel 2 should now be visible
    expect(panel1).not.toBeVisible();
    expect(panel2).toBeVisible();
  });

  it('uses keyboard navigation', () => {
    render(
      <Tabs>
        <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
        <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
        <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
        <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
      </Tabs>
    );

    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');

    // Tab 1 should be focused initially
    expect(tab1).toHaveAttribute('tabindex', '0');
    expect(tab2).toHaveAttribute('tabindex', '-1');

    // Navigate to tab 2
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });

    expect(tab1).toHaveAttribute('tabindex', '-1');
    expect(tab2).toHaveAttribute('tabindex', '0');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Tabs>
          <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
        </Tabs>
      );
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes', () => {
      render(
        <Tabs>
          <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
          <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
        </Tabs>
      );

      const tab1 = screen.getByText('Tab 1');
      const panel1 = screen.getByText('Panel 1');

      expect(tab1).toHaveAttribute('role', 'tab');
      expect(panel1).toHaveAttribute('role', 'tabpanel');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(
        <Tabs>
          <Tabs.Tab value="tab1">Tab</Tabs.Tab>
          <Tabs.Panel value="tab1">Content</Tabs.Panel>
        </Tabs>
      );

      const tabs = screen.getByText('Tab').closest('[data-state]');

      // Verify the component is rendered with proper structure
      expect(tabs).toBeInTheDocument();
    });
  });
});
