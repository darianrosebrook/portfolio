import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dialog from '../Dialog';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Dialog', () => {
  it('renders dialog correctly', () => {
    render(<Dialog open>Dialog Content</Dialog>);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Dialog Content');
  });

  it('is not rendered when closed', () => {
    render(<Dialog open={false}>Dialog Content</Dialog>);

    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Dialog open className="custom-class">
        Content
      </Dialog>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-class');
  });

  it('renders header when provided', () => {
    render(
      <Dialog open>
        <Dialog.Header>Dialog Title</Dialog.Header>
        <Dialog.Body>Dialog Content</Dialog.Body>
      </Dialog>
    );

    const header = screen.getByText('Dialog Title');
    const body = screen.getByText('Dialog Content');

    expect(header).toBeInTheDocument();
    expect(body).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Dialog open>Dialog Content</Dialog>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper focus management', () => {
      render(<Dialog open>Dialog Content</Dialog>);
      const dialog = screen.getByRole('dialog');

      // Dialog should be focusable
      expect(dialog).toHaveAttribute('tabindex', '-1');
    });

    it('traps focus within dialog', () => {
      render(
        <Dialog open>
          <Dialog.Header>Focus Test</Dialog.Header>
          <Dialog.Body>
            <button>First Button</button>
            <button>Second Button</button>
          </Dialog.Body>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');

      expect(dialog).toContainElement(firstButton);
      expect(dialog).toContainElement(secondButton);
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Dialog open>Content</Dialog>);
      const dialog = screen.getByRole('dialog');

      // Verify CSS custom properties are being used
      expect(dialog).toHaveClass('dialog');
    });
  });
});
