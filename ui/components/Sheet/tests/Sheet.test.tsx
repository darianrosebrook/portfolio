import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet } from '../Sheet';

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

  it('closes on escape key when closeOnEscape is true', () => {
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
