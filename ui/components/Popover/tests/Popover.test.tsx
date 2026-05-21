import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Popover from '../Popover';
import { contractTest } from '@/test/utils/contractTest';

describe('Popover', () => {
  describe('rendering', () => {
    it('renders the trigger child', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Popover content</Popover.Content>
        </Popover>
      );

      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    it('does not render content until the trigger is activated', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Popover content</Popover.Content>
        </Popover>
      );

      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('shows content when trigger is clicked and hides on second click', async () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Popover content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      fireEvent.click(trigger);
      expect(screen.getByText('Popover content')).toBeInTheDocument();

      fireEvent.click(trigger);
      await waitFor(
        () =>
          expect(screen.queryByText('Popover content')).not.toBeInTheDocument(),
        { timeout: 500 }
      );
    });
  });

  describe('className routing', () => {
    it('applies custom className to the popover container, not the trigger', () => {
      const { container } = render(
        <Popover className="custom-class">
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const root = container.querySelector('[data-ds-component="Popover"]');
      expect(root).toHaveClass('custom-class');

      const trigger = screen.getByRole('button', { name: 'Click me' });
      expect(trigger).not.toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('sets aria-haspopup="dialog" on the trigger (not the literal "true")', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('reflects open state via aria-expanded', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('wires aria-controls to the content id when open', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      fireEvent.click(trigger);

      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      const dialog = screen.getByRole('dialog');
      expect(dialog.id).toBe(controlsId);
    });

    it('exposes the content as role="dialog"', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Design Tokens', () => {
    it('marks the trigger with the popoverTrigger class', () => {
      render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Click me' });
      expect(trigger).toHaveClass('popoverTrigger');
    });

    it('marks the container with the popoverContainer class and data-ds-component', () => {
      const { container } = render(
        <Popover>
          <Popover.Trigger>Click me</Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      );

      const root = container.querySelector('[data-ds-component="Popover"]');
      expect(root).toHaveClass('popoverContainer');
    });
  });

  describe('Contract obligations', () => {
    contractTest('Popover', 'dismissal.triggers', 'escape', async () => {
      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Popover content</Popover.Content>
        </Popover>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByText('Popover content')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(
        () =>
          expect(screen.queryByText('Popover content')).not.toBeInTheDocument(),
        { timeout: 500 }
      );
    });
  });
});
