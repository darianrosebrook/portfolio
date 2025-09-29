import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Chip } from '@/ui/components/Chip';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Chip Component', () => {
  const user = userEvent.setup();

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Chip>Default Chip</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent('Default Chip');
      expect(chip).toHaveAttribute('data-variant', 'default');
      expect(chip).toHaveAttribute('data-size', 'medium');
    });

    it('renders with custom variant and size', () => {
      render(
        <Chip variant="selected" size="large">
          Selected Large Chip
        </Chip>
      );

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'selected');
      expect(chip).toHaveAttribute('data-size', 'large');
      expect(chip).toHaveTextContent('Selected Large Chip');
    });

    it('renders with different content types', () => {
      render(
        <Chip>
          <span>Custom Content</span>
        </Chip>
      );

      const chip = screen.getByRole('button');
      expect(chip).toHaveTextContent('Custom Content');
    });
  });

  describe('Variants', () => {
    it('renders default variant without icon', () => {
      render(<Chip variant="default">Default</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'default');

      // Should not have an icon for default variant
      const icon = chip.querySelector('[aria-hidden="true"]');
      expect(icon).not.toBeInTheDocument();
    });

    it('renders selected variant with checkmark icon', () => {
      render(<Chip variant="selected">Selected</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'selected');

      // Should have a checkmark icon
      const icon = chip.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();

      // Icon should be the checkmark SVG
      const svg = icon?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders dismissible variant with X icon', () => {
      render(<Chip variant="dismissible">Dismissible</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'dismissible');

      // Should have an X icon
      const icon = chip.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();

      // Icon should be the X SVG
      const svg = icon?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Chip onClick={handleClick}>Clickable</Chip>);

      const chip = screen.getByRole('button');
      await user.click(chip);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles keyboard interactions', async () => {
      const handleClick = vi.fn();
      render(<Chip onClick={handleClick}>Keyboard</Chip>);

      const chip = screen.getByRole('button');
      chip.focus();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Press Space
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('is disabled when disabled prop is true', async () => {
      const handleClick = vi.fn();
      render(
        <Chip disabled onClick={handleClick}>
          Disabled
        </Chip>
      );

      const chip = screen.getByRole('button');
      expect(chip).toBeDisabled();

      await user.click(chip);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('passes axe accessibility tests', async () => {
      const { container } = render(
        <>
          <Chip>Default</Chip>
          <Chip variant="selected" ariaLabel="Selected chip">
            Selected
          </Chip>
          <Chip variant="dismissible" ariaLabel="Dismissible chip">
            Dismissible
          </Chip>
        </>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(
        <Chip
          variant="selected"
          ariaLabel="Toggle selection"
          ariaPressed={true}
          title="Custom title"
        >
          With ARIA
        </Chip>
      );

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('aria-label', 'Toggle selection');
      expect(chip).toHaveAttribute('aria-pressed', 'true');
      expect(chip).toHaveAttribute('title', 'Custom title');
    });

    it('has proper focus styles', () => {
      render(<Chip>Focusable</Chip>);

      const chip = screen.getByRole('button');
      chip.focus();

      expect(chip).toHaveFocus();
    });

    it('supports custom role', () => {
      render(
        <Chip role="checkbox" ariaPressed={true}>
          Checkbox Role
        </Chip>
      );

      const chip = screen.getByRole('checkbox');
      expect(chip).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('As Child Pattern', () => {
    it('supports asChild pattern', () => {
      render(
        <Chip asChild>
          <a href="/test">Link Chip</a>
        </Chip>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Link Chip');
    });
  });

  describe('Size Variants', () => {
    it.each(['small', 'medium', 'large'] as const)(
      'renders %s size correctly',
      (size) => {
        render(<Chip size={size}>{size} Size</Chip>);

        const chip = screen.getByRole('button');
        expect(chip).toHaveAttribute('data-size', size);
      }
    );
  });

  describe('Text Content Handling', () => {
    it('handles string children correctly', () => {
      render(<Chip>Simple String</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveTextContent('Simple String');
    });

    it('handles number children correctly', () => {
      render(<Chip>{42}</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveTextContent('42');
    });

    it('handles null/undefined children gracefully', () => {
      render(<Chip>{null}</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toBeEmptyDOMElement();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string children', () => {
      render(<Chip>{''}</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toBeEmptyDOMElement();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(100);
      render(<Chip>{longText}</Chip>);

      const chip = screen.getByRole('button');
      expect(chip).toHaveTextContent(longText);
    });
  });
});
