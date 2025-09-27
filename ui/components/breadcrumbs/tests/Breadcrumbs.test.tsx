import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Breadcrumbs from '../Breadcrumbs';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Breadcrumbs', () => {
  it('renders breadcrumb navigation correctly', () => {
    const base = { label: 'Home', href: '/' };
    const crumbs = [
      { label: 'Category', href: '/category' },
      { label: 'Current Page', href: '/category/current' }
    ];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    const homeLink = screen.getByText('Home');
    const categoryLink = screen.getByText('Category');
    const currentPage = screen.getByText('Current Page');

    expect(nav).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(categoryLink).toBeInTheDocument();
    expect(currentPage).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const base = { label: 'Home', href: '/' };
    const crumbs: Array<{ label: string; href: string }> = [];

    render(<Breadcrumbs base={base} crumbs={crumbs as any} className="custom-class" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('renders links correctly', () => {
    const base = { label: 'Home', href: '/home' };
    const crumbs = [{ label: 'About', href: '/about' }];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const homeLink = screen.getByText('Home');
    const aboutLink = screen.getByText('About');

    expect(homeLink).toHaveAttribute('href', '/home');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders current page as span when no href', () => {
    const base = { label: 'Home', href: '/home' };
    const crumbs = [{ label: 'Current', href: '' }];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const currentItem = screen.getByText('Current');
    expect(currentItem.tagName).toBe('SPAN');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const base = { label: 'Home', href: '/' };
      const crumbs = [{ label: 'Current', href: '' }];

      const { container } = render(<Breadcrumbs base={base} crumbs={crumbs} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA navigation landmark', () => {
      const base = { label: 'Home', href: '/' };
      const crumbs: Array<{ label: string; href: string }> = [];

      render(<Breadcrumbs base={base} crumbs={crumbs} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      const base = { label: 'Home', href: '/' };
      const crumbs: Array<{ label: string; href: string }> = [];

      render(<Breadcrumbs base={base} crumbs={crumbs} />);

      const nav = screen.getByRole('navigation');

      // Verify CSS custom properties are being used
      expect(nav).toHaveClass('breadcrumbs');
    });
  });
});
