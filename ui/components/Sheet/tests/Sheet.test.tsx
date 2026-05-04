import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet } from '../Sheet';
import { contractTest } from '@/test/utils/contractTest';

describe('Sheet', () => {
  it('renders sheet trigger', () => {
    render(
      <Sheet>
        <Sheet.Trigger>Open Sheet</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Sheet Title</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>Sheet content</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });

  it('opens sheet when trigger is clicked', () => {
    render(
      <Sheet>
        <Sheet.Trigger>Open Sheet</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Sheet Title</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>Sheet content</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    const trigger = screen.getByText('Open Sheet');
    fireEvent.click(trigger);

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('closes sheet when close button is clicked', () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Trigger>Open Sheet</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Sheet Title</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Body>Sheet content</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close sheet');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
  });

  it('supports different sides', () => {
    render(
      <Sheet defaultOpen side="left">
        <Sheet.Content>
          <Sheet.Body>Left sheet content</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    const content = screen.getByRole('dialog');
    expect(content).toHaveAttribute('data-side', 'left');
  });

  contractTest('Sheet', 'focus.strategy', 'trap', () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Content>
          <Sheet.Body>
            <button>First</button>
            <button>Last</button>
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    const first = screen.getByText('First');
    const last = screen.getByText('Last');

    // Tab from last element wraps to first
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(first).toHaveFocus();
  });

  contractTest('Sheet', 'dismissal.triggers', 'escape', () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Content closeOnEscape>
          <Sheet.Body>Sheet content</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );

    expect(screen.getByText('Sheet content')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Sheet content')).not.toBeInTheDocument();
  });
});
