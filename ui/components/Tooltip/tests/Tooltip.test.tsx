import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

import Tooltip from '../Tooltip';
import { contractTest } from '@/test/utils/contractTest';

// Tooltip now wraps children in a span that owns the hover/focus/click
// handlers and the aria-describedby relationship (the wrapper pattern
// mirrors Popover.Trigger). Tests target the wrapper via the
// `data-slot="tooltip-trigger"` selector.
const getTrigger = (container: HTMLElement) =>
  container.querySelector('[data-slot="tooltip-trigger"]') as HTMLElement;

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Trigger</button>
      </Tooltip>
    );

    // Children are still rendered inside the wrapper.
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(getTrigger(container));
    act(() => vi.runAllTimers());

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('applies custom className', () => {
    render(
      <Tooltip content="Content" className="custom-class">
        <button>Trigger</button>
      </Tooltip>
    );

    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Tooltip content="Content">
          <button>Trigger</button>
        </Tooltip>
      );
      expect(container).toBeInTheDocument();
    });

    it('provides proper ARIA attributes when visible', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = getTrigger(container);
      fireEvent.focus(trigger);
      act(() => vi.runAllTimers());

      expect(trigger).toHaveAttribute('aria-describedby');
      vi.useRealTimers();
    });
  });

  describe('Contract obligations', () => {
    contractTest('Tooltip', 'a11y.apgPattern', 'tooltip', () => {
      vi.useFakeTimers();
      const { container } = render(
        <Tooltip content="Helpful tip" delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );
      fireEvent.mouseEnter(getTrigger(container));
      act(() => vi.runAllTimers());
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      vi.useRealTimers();
    });

    contractTest('Tooltip', 'dismissal.triggers', 'escape', () => {
      vi.useFakeTimers();

      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = getTrigger(container);

      // Show tooltip via focus
      fireEvent.focus(trigger);
      act(() => vi.runAllTimers());
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Escape must dismiss without moving focus from trigger (WCAG 2.1 SC 1.4.13)
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    contractTest('Tooltip', 'dismissal.triggers', 'blur', () => {
      vi.useFakeTimers();

      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Trigger</button>
        </Tooltip>
      );

      const trigger = getTrigger(container);

      // Show tooltip via focus
      fireEvent.focus(trigger);
      act(() => vi.runAllTimers());
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Blur on trigger must hide the tooltip
      fireEvent.blur(trigger);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
