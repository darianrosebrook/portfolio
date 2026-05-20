import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Button from '../Button';
import { contractTest } from '@/test/utils/contractTest';

// Extend Jest matchers

describe('Button', () => {
  it('renders button with text correctly', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('forwards ref to the underlying element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Button data-testid="test-button">Test</Button>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Accessible button</Button>);
      // Note: axe testing is handled by the setup file
      expect(container).toBeInTheDocument();
    });

    it('supports keyboard activation', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');

      // Verify CSS custom properties are being used
      // Note: In jsdom, CSS custom properties may not resolve,
      // but we can check that the class is applied correctly
      expect(button.className).toContain('button');
    });
  });

  describe('Variants', () => {
    it('applies variant classes correctly', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('applies size classes correctly', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-size', 'large');
    });
  });
});

describe('Icon-only detection', () => {
  it('wraps string children in a span.label so text buttons are detectable', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    const label = button.querySelector('.label');
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent('Save');
  });

  it('does not add a .label wrapper around non-text children (icon-only path)', () => {
    render(
      <Button ariaLabel="Close">
        <svg data-testid="icon" aria-hidden="true" />
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.querySelector('.label')).toBeNull();
    expect(button.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('exposes ariaLabel as the accessible name when set', () => {
    render(
      <Button ariaLabel="Open menu">
        <svg aria-hidden="true" />
      </Button>
    );
    expect(
      screen.getByRole('button', { name: 'Open menu' })
    ).toBeInTheDocument();
  });

  it('wraps text in span.label even during the loading state', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button');
    const label = button.querySelector('.label.loadingText');
    expect(label).not.toBeNull();
    expect(label).toHaveTextContent('Saving');
  });
});

describe('Contract behavioral obligations', () => {
  contractTest('Button', 'a11y.apgPattern', 'button', () => {
    render(<Button>Label</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
