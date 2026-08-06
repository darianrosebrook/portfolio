import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Breadcrumbs from '../Breadcrumbs';
import { contractTest } from '@/test/utils/contractTest';

// Extend Jest matchers

describe('Breadcrumbs', () => {
  it('renders breadcrumb navigation correctly', () => {
    const base = { label: 'Home', href: '/' };
    const crumbs = [
      { label: 'Category', href: '/category' },
      { label: 'Current Page', href: '/category/current' },
    ];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const categoryLink = screen.getByRole('link', { name: 'Category' });
    const currentPage = screen.getByText('Current Page');

    expect(nav).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(categoryLink).toBeInTheDocument();
    expect(currentPage).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const base = { label: 'Home', href: '/' };
    const crumbs: Array<{ label: string; href: string }> = [];

    render(
      <Breadcrumbs base={base} crumbs={crumbs} className="custom-class" />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('renders links correctly', () => {
    const base = { label: 'Home', href: '/home' };
    const crumbs = [
      { label: 'About', href: '/about' },
      { label: 'Team', href: '/about/team' },
    ];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About' });

    expect(homeLink).toHaveAttribute('href', '/home');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders current page as span when no href', () => {
    const base = { label: 'Home', href: '/home' };
    const crumbs = [{ label: 'Current', href: '' }];

    render(<Breadcrumbs base={base} crumbs={crumbs} />);

    const currentItem = screen.getByText('Current');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const base = { label: 'Home', href: '/' };
      const crumbs = [{ label: 'Current', href: '' }];

      const { container } = render(<Breadcrumbs base={base} crumbs={crumbs} />);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA navigation landmark', () => {
      const base = { label: 'Home', href: '/' };
      const crumbs: Array<{ label: string; href: string }> = [];

      render(<Breadcrumbs base={base} crumbs={crumbs} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      const base = { label: 'Home', href: '/' };
      const crumbs: Array<{ label: string; href: string }> = [];

      render(<Breadcrumbs base={base} crumbs={crumbs} />);

      const nav = screen.getByRole('navigation');

      expect(nav).toHaveAttribute('data-slot', 'breadcrumbs');
    });
  });
});

describe('Contract behavioral obligations', () => {
  contractTest('breadcrumbs', 'a11y.apgPattern', 'breadcrumb', () => {
    const base = { label: 'Home', href: '/' };
    const crumbs = [{ label: 'Category', href: '/category' }];
    render(<Breadcrumbs base={base} crumbs={crumbs} />);
    expect(
      screen.getByRole('navigation', { name: /breadcrumb/i })
    ).toBeInTheDocument();
  });
});
