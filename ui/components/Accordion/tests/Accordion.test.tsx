import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from '../Accordion';

describe('Accordion', () => {
  it('renders accordion items', () => {
    render(
      <Accordion type="single" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Trigger value="item-1">
            Is it accessible?
          </Accordion.Trigger>
          <Accordion.Content value="item-1">
            Yes. It adheres to the WAI-ARIA design pattern.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByText('Is it accessible?')).toBeInTheDocument();
  });

  it('toggles content visibility when trigger is clicked', () => {
    render(
      <Accordion type="single" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Trigger value="item-1">
            Is it accessible?
          </Accordion.Trigger>
          <Accordion.Content value="item-1">
            Yes. It adheres to the WAI-ARIA design pattern.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports multiple open items when type is multiple', () => {
    render(
      <Accordion type="multiple">
        <Accordion.Item value="item-1">
          <Accordion.Trigger value="item-1">Item 1</Accordion.Trigger>
          <Accordion.Content value="item-1">Content 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger value="item-2">Item 2</Accordion.Trigger>
          <Accordion.Content value="item-2">Content 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const triggers = screen.getAllByRole('button');

    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'true');
  });
});
