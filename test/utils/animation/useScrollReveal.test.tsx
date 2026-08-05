import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';

/**
 * These pin the three properties the old per-component GSAP blocks got wrong or
 * left implicit:
 *
 *  A1 — content is visible at rest, so a no-JS visitor sees the article
 *  A2 — prefers-reduced-motion suppresses the animation entirely
 *  A4 — ScrollTrigger is registered once, centrally, not per call site
 */

const gsapMock = vi.hoisted(() => ({
  set: vi.fn(),
  to: vi.fn(),
  registerPlugin: vi.fn(),
}));

const reducedMotionMock = vi.hoisted(() => ({ prefersReducedMotion: false }));

vi.mock('gsap', () => ({ gsap: gsapMock, default: gsapMock }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { name: 'ScrollTrigger' } }));

// Stand in for useGSAP with a layout effect so the callback runs on the client
// but not during server rendering — matching the real hook's timing.
vi.mock('@gsap/react', () => ({
  useGSAP: (cb: () => void, opts?: { dependencies?: unknown[] }) => {
    React.useLayoutEffect(
      () => {
        cb();
      },
      opts?.dependencies ?? []
    );
  },
}));

vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => reducedMotionMock,
}));

beforeEach(() => {
  gsapMock.set.mockClear();
  gsapMock.to.mockClear();
  reducedMotionMock.prefersReducedMotion = false;
});

afterEach(() => {
  vi.resetModules();
});

async function loadHook() {
  const mod = await import('@/utils/animation/useScrollReveal');
  return mod.useScrollReveal;
}

describe('useScrollReveal', () => {
  it('A1: server markup leaves content visible — no opacity:0 inline style', async () => {
    const useScrollReveal = await loadHook();

    function Article() {
      const ref = useScrollReveal<HTMLDivElement>({ variant: 'fade-up' });
      return <div ref={ref}>lede copy</div>;
    }

    const html = renderToStaticMarkup(<Article />);

    // The visible resting state is the whole point: a no-JS visitor must read
    // the article. Any opacity:0 in server output would hide it permanently.
    expect(html).not.toMatch(/opacity\s*:\s*0/);
    expect(html).toContain('lede copy');
    // And nothing may have been hidden during server render.
    expect(gsapMock.set).not.toHaveBeenCalled();
  });

  it('A2: prefers-reduced-motion runs no animation at all', async () => {
    reducedMotionMock.prefersReducedMotion = true;
    const useScrollReveal = await loadHook();

    function Section() {
      const ref = useScrollReveal<HTMLDivElement>({ variant: 'blur-in' });
      return <div ref={ref}>content</div>;
    }

    render(<Section />);

    // Neither the hide nor the reveal may run — content simply shows.
    expect(gsapMock.set).not.toHaveBeenCalled();
    expect(gsapMock.to).not.toHaveBeenCalled();
  });

  it('A2 (contrast): without reduced motion it does hide then reveal', async () => {
    reducedMotionMock.prefersReducedMotion = false;
    const useScrollReveal = await loadHook();

    function Section() {
      const ref = useScrollReveal<HTMLDivElement>({ variant: 'fade-up', y: 20 });
      return <div ref={ref}>content</div>;
    }

    render(<Section />);

    // Proves the A2 assertion above is meaningful rather than vacuously true:
    // the same component DOES animate when motion is allowed.
    expect(gsapMock.set).toHaveBeenCalledWith(expect.anything(), {
      opacity: 0,
      y: 20,
    });
    expect(gsapMock.to).toHaveBeenCalledTimes(1);
    expect(gsapMock.to.mock.calls[0][1]).toMatchObject({ opacity: 1, y: 0 });
  });

  it('A4: registers ScrollTrigger exactly once on module load', async () => {
    gsapMock.registerPlugin.mockClear();
    vi.resetModules();

    await import('@/utils/animation/useScrollReveal');

    // Centralizing registration here is why call sites no longer repeat it.
    expect(gsapMock.registerPlugin).toHaveBeenCalledTimes(1);
    expect(gsapMock.registerPlugin).toHaveBeenCalledWith({
      name: 'ScrollTrigger',
    });
  });

  it('target:"children" staggers the children, not the container', async () => {
    const useScrollReveal = await loadHook();

    function Lede() {
      const ref = useScrollReveal<HTMLDivElement>({ target: 'children' });
      return (
        <div ref={ref}>
          <p>one</p>
          <p>two</p>
        </div>
      );
    }

    render(<Lede />);

    const targets = gsapMock.set.mock.calls[0][0] as Element[];
    expect(targets).toHaveLength(2);
    expect(gsapMock.to.mock.calls[0][1]).toHaveProperty('stagger');
  });
});
