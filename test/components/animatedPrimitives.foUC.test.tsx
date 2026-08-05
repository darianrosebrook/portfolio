import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';

import { AnimatedText } from '@/ui/components/AnimatedText';
import { AnimatedSection } from '@/ui/components/AnimatedSection';
import { AnimatedCard } from '@/ui/components/AnimatedCard';

/**
 * The reveal animation is an enhancement. If a visitor has no JavaScript — or it
 * fails to load — the content must still be readable. These primitives used to
 * hide themselves with an inline `opacity: 0` during render, which is emitted
 * into the server HTML and never cleared without JS, permanently hiding content.
 *
 * The hidden starting state belongs in a pre-paint client effect instead, so the
 * server markup stays visible.
 */

const reducedMotionMock = vi.hoisted(() => ({ prefersReducedMotion: false }));

vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => reducedMotionMock,
  ReducedMotionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

beforeEach(() => {
  reducedMotionMock.prefersReducedMotion = false;
});

/** Matches `opacity:0` / `opacity: 0` but not `opacity:0.5`. */
const HIDDEN = /opacity\s*:\s*0(?!\.\d)/;

const cases: Array<[string, React.ReactElement]> = [
  ['AnimatedText', <AnimatedText text="readable headline" />],
  [
    'AnimatedSection',
    <AnimatedSection>
      <p>readable section body</p>
    </AnimatedSection>,
  ],
  [
    'AnimatedCard',
    <AnimatedCard>
      <p>readable card body</p>
    </AnimatedCard>,
  ],
];

describe('animated primitives: no-JS readability', () => {
  it.each(cases)(
    '%s emits no inline opacity:0 in server markup',
    (name, element) => {
      const html = renderToStaticMarkup(element);

      expect(
        html,
        `${name} ships an inline opacity:0 in server HTML. Without JavaScript ` +
          `nothing clears it, so the content is permanently invisible.`
      ).not.toMatch(HIDDEN);
    }
  );

  it.each(cases)('%s still renders its text content', (name, element) => {
    // Guards against the assertion above passing because nothing rendered.
    const html = renderToStaticMarkup(element);
    expect(html).toMatch(/readable/);
  });

  it.each(cases)(
    '%s emits no inline opacity:0 under reduced motion either',
    (name, element) => {
      reducedMotionMock.prefersReducedMotion = true;
      const html = renderToStaticMarkup(element);
      expect(html).not.toMatch(HIDDEN);
    }
  );

  it('on the client the hide IS applied, proving it moved to a pre-paint effect', () => {
    // The complement of the assertions above: absence of opacity:0 in server
    // markup would be worthless if the element were never hidden at all — the
    // animation would just not happen. Rendering with effects active must still
    // produce the hidden start state, only now from gsap rather than from JSX.
    const { container } = render(<AnimatedText text="client headline" />);
    const words = Array.from(
      container.querySelectorAll<HTMLElement>('.word')
    );

    expect(words.length).toBeGreaterThan(0);
    expect(
      words.some((el) => HIDDEN.test(el.getAttribute('style') ?? '')),
      'no word was hidden on the client, so the reveal animation has no start state'
    ).toBe(true);
  });
});
