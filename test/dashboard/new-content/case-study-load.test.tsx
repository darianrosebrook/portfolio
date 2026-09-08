// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EditCaseStudyPage from '@/app/dashboard/case-studies/[slug]/page';

vi.mock('@/app/dashboard/_components/ContentEditor', () => ({
  default: ({ initial }: { initial: { slug: string } }) => (
    <div data-testid="content-editor">{initial.slug}</div>
  ),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe('case study load states', () => {
  it('shows a retryable load error instead of mounting an editor for an API error', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ error: 'database unavailable' }, 500))
      .mockResolvedValueOnce(response({ id: 18, slug: 'case-study' }));
    vi.stubGlobal('fetch', fetch);
    await act(async () => {
      render(
        <EditCaseStudyPage params={Promise.resolve({ slug: 'case-study' })} />
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.queryByTestId('content-editor')).not.toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    );
    expect(screen.getByTestId('content-editor')).toHaveTextContent(
      'case-study'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('distinguishes a missing record from loading and preserves an exit link', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response({ error: 'not found' }, 404))
    );
    await act(async () => {
      render(
        <EditCaseStudyPage params={Promise.resolve({ slug: 'missing' })} />
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent('could not be found');
    expect(
      screen.getByRole('link', { name: 'Back to Case Studies' })
    ).toHaveAttribute('href', '/dashboard/case-studies');
    expect(screen.queryByTestId('content-editor')).not.toBeInTheDocument();
  });

  it('rejects success responses that contain no record identity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response({ error: 'unexpected shape' }))
    );
    await act(async () => {
      render(
        <EditCaseStudyPage params={Promise.resolve({ slug: 'missing' })} />
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent('invalid case study');
    expect(screen.queryByTestId('content-editor')).not.toBeInTheDocument();
  });

  it('ignores a stale request response after navigating to another case study', async () => {
    let release!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValueOnce(response({ id: 22, slug: 'newer' }));
    vi.stubGlobal('fetch', fetch);
    const first = Promise.resolve({ slug: 'older' });
    const view = render(<EditCaseStudyPage params={first} />);
    await act(async () => {
      await first;
    });
    await act(async () => {
      view.rerender(
        <EditCaseStudyPage params={Promise.resolve({ slug: 'newer' })} />
      );
    });
    await act(async () => release(response({ id: 21, slug: 'older' })));
    expect(screen.getByTestId('content-editor')).toHaveTextContent('newer');
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
