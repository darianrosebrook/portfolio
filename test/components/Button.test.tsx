import { render, screen, fireEvent } from '../test-utils';
import Button from '@/components/Button';
import {
  expectNoAccessibilityViolations,
  designSystemAxeConfig,
} from '../axe-helper';
import { describe, expect, it, vi } from 'vitest';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders as button element by default', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders as anchor element when as="a"', () => {
      render(
        <Button as="a" href="/test">
          Link button
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Link button' });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders children content correctly', () => {
      render(<Button>Test Content</Button>);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size class correctly', () => {
      render(<Button size="small">Small button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/small/);
    });

    it('applies medium size class correctly (default)', () => {
      render(<Button>Medium button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/medium/);
    });

    it('applies large size class correctly', () => {
      render(<Button size="large">Large button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/large/);
    });
  });

  describe('Style Variants', () => {
    it('applies primary variant class correctly (default)', () => {
      render(<Button>Primary button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/primary/);
    });

    it('applies secondary variant class correctly', () => {
      render(<Button variant="secondary">Secondary button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/secondary/);
    });

    it('applies tertiary variant class correctly', () => {
      render(<Button variant="tertiary">Tertiary button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/tertiary/);
    });
  });

  describe('Interactive States', () => {
    it('handles disabled state correctly', () => {
      render(<Button disabled>Disabled button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toMatch(/disabled/);
    });

    it('handles loading state correctly', () => {
      render(<Button loading>Loading button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/isLoading/);
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable button</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled button
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    it('applies title attribute correctly', () => {
      render(<Button title="Button tooltip">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Button tooltip');
    });

    it('applies aria-label for icon-only buttons', () => {
      // Create a simple icon component without children to trigger hasOnlyIcon logic
      const IconComponent = () => (
        <svg>
          <path d="M0 0h24v24H0z" />
        </svg>
      );

      render(
        <Button title="Icon button">
          <IconComponent />
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Icon button');
    });

    it('wraps children content in spans', () => {
      render(<Button>Text content</Button>);

      const button = screen.getByRole('button');
      const span = button.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Text content');
    });
  });

  describe('Custom Props and Styling', () => {
    it('applies custom className correctly', () => {
      render(<Button className="custom-class">Custom button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/custom-class/);
    });

    it('forwards HTML button attributes', () => {
      render(
        <Button type="submit" data-testid="submit-btn">
          Submit
        </Button>
      );

      const button = screen.getByTestId('submit-btn');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('forwards HTML anchor attributes for link buttons', () => {
      render(
        <Button as="a" href="/test" target="_blank" rel="noopener">
          External link
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });
  });

  describe('CSS Classes Combination', () => {
    it('combines all modifier classes correctly', () => {
      render(
        <Button
          size="large"
          variant="secondary"
          loading
          disabled
          className="extra-class"
        >
          Complex button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toMatch(/button/); // base class
      expect(button.className).toMatch(/large/);
      expect(button.className).toMatch(/secondary/);
      expect(button.className).toMatch(/isLoading/);
      expect(button.className).toMatch(/disabled/);
      expect(button.className).toMatch(/extra-class/);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button></Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles multiple children correctly', () => {
      render(
        <Button>
          <span>Icon</span>
          Text content
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('IconText content');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have no accessibility violations - basic button', async () => {
      const renderResult = render(<Button>Basic Button</Button>);

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - disabled button', async () => {
      const renderResult = render(<Button disabled>Disabled Button</Button>);

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - link button', async () => {
      const renderResult = render(
        <Button as="a" href="/test">
          Link Button
        </Button>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - icon-only button', async () => {
      const renderResult = render(
        <Button title="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });

    it('should have no accessibility violations - loading state', async () => {
      const renderResult = render(<Button loading>Loading Button</Button>);

      await expectNoAccessibilityViolations(
        renderResult,
        designSystemAxeConfig
      );
    });
  });
});
