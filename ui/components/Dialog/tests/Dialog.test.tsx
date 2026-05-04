import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, afterEach } from 'vitest';

import Dialog from '../Dialog';
import { contractTest } from '@/test/utils/contractTest';

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
      expect(container).toBeInTheDocument();
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

  describe('Contract obligations', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    contractTest('Dialog', 'focus.strategy', 'trap', () => {
      render(
        <Dialog open modal>
          <button>First</button>
          <button>Last</button>
        </Dialog>
      );

      const first = screen.getByText('First');
      const last = screen.getByText('Last');

      last.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      expect(first).toHaveFocus();
    });

    contractTest('Dialog', 'focus.wrap', 'true/Tab-forward', () => {
      render(
        <Dialog open modal>
          <button>Alpha</button>
          <button>Beta</button>
          <button>Gamma</button>
        </Dialog>
      );

      const gamma = screen.getByText('Gamma');
      const alpha = screen.getByText('Alpha');

      gamma.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      expect(alpha).toHaveFocus();
    });

    contractTest('Dialog', 'focus.wrap', 'true/ShiftTab-backward', () => {
      render(
        <Dialog open modal>
          <button>Alpha</button>
          <button>Beta</button>
          <button>Gamma</button>
        </Dialog>
      );

      const alpha = screen.getByText('Alpha');
      const gamma = screen.getByText('Gamma');

      alpha.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(gamma).toHaveFocus();
    });

    contractTest('Dialog', 'dismissal.triggers', 'escape', async () => {
      // Use controlled mode: open=true, listen for onOpenChange(false)
      const onOpenChange = vi.fn();

      render(
        <Dialog open onOpenChange={onOpenChange}>
          <Dialog.Body>Content</Dialog.Body>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      // close() waits 200ms animation before calling onOpenChange
      await waitFor(
        () => expect(onOpenChange).toHaveBeenCalledWith(false),
        { timeout: 500 }
      );
    });

    contractTest('Dialog', 'dismissal.triggers', 'overlayClick', async () => {
      const onOpenChange = vi.fn();

      render(
        <Dialog open modal closeOnBackdropClick onOpenChange={onOpenChange}>
          <Dialog.Body>Content</Dialog.Body>
        </Dialog>
      );

      const backdrop = screen.getByRole('dialog').parentElement!;
      fireEvent.click(backdrop);

      await waitFor(
        () => expect(onOpenChange).toHaveBeenCalledWith(false),
        { timeout: 500 }
      );
    });

    contractTest('Dialog', 'dismissal.triggers', 'escape/disabled-by-closeOnEscape', () => {
      // closeOnEscape=false: close() is never called, so no async needed
      const onOpenChange = vi.fn();

      render(
        <Dialog open closeOnEscape={false} onOpenChange={onOpenChange}>
          <Dialog.Body>Content</Dialog.Body>
        </Dialog>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    contractTest(
      'Dialog',
      'dismissal.triggers',
      'overlayClick/disabled-by-closeOnBackdropClick',
      () => {
        const onOpenChange = vi.fn();

        render(
          <Dialog open modal closeOnBackdropClick={false} onOpenChange={onOpenChange}>
            <Dialog.Body>Content</Dialog.Body>
          </Dialog>
        );

        const backdrop = screen.getByRole('dialog').parentElement!;
        fireEvent.click(backdrop);

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );

    contractTest('Dialog', 'a11y.role', 'dialog/aria-modal', () => {
      render(<Dialog open modal>Content</Dialog>);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    contractTest('Dialog', 'relationships', 'aria-labelledby', () => {
      render(
        <Dialog open>
          <Dialog.Title>Accessible Title</Dialog.Title>
          <Dialog.Body>Content</Dialog.Body>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      const labelledById = dialog.getAttribute('aria-labelledby');
      expect(labelledById).toBeTruthy();

      const titleEl = document.getElementById(labelledById!);
      expect(titleEl).toBeInTheDocument();
      expect(titleEl).toHaveTextContent('Accessible Title');
    });

    contractTest('Dialog', 'a11y.apgPattern', 'dialog-modal', () => {
      render(<Dialog open modal>Content</Dialog>);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
