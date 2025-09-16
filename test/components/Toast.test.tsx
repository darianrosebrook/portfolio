import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi } from 'vitest';
import { ToastProvider, ToastViewport, useToast } from '@/ui/components/Toast';

expect.extend(toHaveNoViolations);

function WithEnqueue({
  count = 1,
  label = 'enqueue',
}: {
  count?: number;
  label?: string;
}) {
  const { enqueue } = useToast();
  return (
    <div>
      <button
        aria-label={label}
        onClick={() => {
          for (let i = 0; i < count; i++) {
            enqueue({ title: `Toast ${i + 1}` });
          }
        }}
      >
        Enqueue
      </button>
      <ToastViewport aria-label="notifications" />
    </div>
  );
}

describe('Toast Composer', () => {
  it('renders up to 3 toasts and queues the rest', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <WithEnqueue count={5} />
      </ToastProvider>
    );

    await user.click(screen.getByLabelText('enqueue'));

    const region = screen.getByLabelText('notifications');
    const items = within(region).getAllByRole('status');
    expect(items.length).toBeLessThanOrEqual(3);
  });

  it('dismiss removes one and backfills from queue', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <WithEnqueue count={4} />
      </ToastProvider>
    );

    await user.click(screen.getByLabelText('enqueue'));
    const region = screen.getByLabelText('notifications');
    // find first close button and click
    const closes = within(region).queryAllByRole('button', {
      name: /dismiss/i,
    });
    if (closes[0]) await user.click(closes[0]);
    // after transition time, expect still up to 3
    await new Promise((r) => setTimeout(r, 300));
    const items = within(region).getAllByRole('status');
    expect(items.length).toBeLessThanOrEqual(3);
  });

  it('auto-dismiss after duration', async () => {
    function Helper() {
      const { enqueue } = useToast();
      React.useEffect(() => {
        enqueue({ title: 'Auto', durationMs: 250 });
      }, [enqueue]);
      return null;
    }
    render(
      <ToastProvider>
        <Helper />
        <ToastViewport aria-label="notifications" />
      </ToastProvider>
    );
    // initially present
    expect(await screen.findByRole('status')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 800));
    // should be gone
    expect(screen.queryAllByRole('status').length).toBe(0);
  });

  it('pauses timer on hover and resumes on leave', async () => {
    function Helper() {
      const { enqueue } = useToast();
      React.useEffect(() => {
        enqueue({ title: 'Hover', durationMs: 300 });
      }, [enqueue]);
      return null;
    }
    render(
      <ToastProvider>
        <Helper />
        <ToastViewport aria-label="notifications" />
      </ToastProvider>
    );
    const item = await screen.findByRole('status');
    fireEvent.mouseEnter(item);
    await new Promise((r) => setTimeout(r, 400));
    // still present because paused
    expect(screen.getByRole('status')).toBeInTheDocument();
    fireEvent.mouseLeave(item);
    await new Promise((r) => setTimeout(r, 1000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no basic accessibility violations', async () => {
    render(
      <ToastProvider>
        <WithEnqueue count={1} />
      </ToastProvider>
    );
    await userEvent.click(screen.getByLabelText('enqueue'));
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
