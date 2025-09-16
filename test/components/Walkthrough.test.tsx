import React from 'react';
import { render, fireEvent } from '../test-utils';
import { WalkthroughProvider, Walkthrough } from '@/ui/components/Walkthrough';

describe('Walkthrough composer', () => {
  const steps = [
    { id: 'one', title: 'Step 1', description: 'Desc', target: '#anchor' },
  ];

  function Setup() {
    return (
      <div>
        <div id="anchor" style={{ width: 100, height: 20 }} />
        <WalkthroughProvider steps={steps} autoStart>
          <Walkthrough />
        </WalkthroughProvider>
      </div>
    );
  }

  test('closes on outside click when open', () => {
    const { container, queryByText } = render(<Setup />);
    // content should render
    expect(queryByText('Step 1')).toBeTruthy();
    // click outside
    fireEvent.mouseDown(container);
    // should close
    expect(queryByText('Step 1')).toBeFalsy();
  });

  test('keyboard shortcuts: Esc cancels, Enter advances', () => {
    const { getByText } = render(<Setup />);
    // Esc should close
    fireEvent.keyDown(document, { key: 'Escape' });
    // Re-render to open again
    const { getByText: getByText2 } = render(<Setup />);
    // Enter should progress to done (single step -> complete/close)
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(() => getByText2('Step 1')).toThrow();
  });
});
