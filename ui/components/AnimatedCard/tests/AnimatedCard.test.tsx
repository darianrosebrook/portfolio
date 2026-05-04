import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../test/test-utils';
import { AnimatedCard } from '../AnimatedCard';

vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn((callback: () => void) => {
      callback();
      return { revert: vi.fn() };
    }),
    registerPlugin: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => ({ prefersReducedMotion: true }),
}));

describe('AnimatedCard', () => {
  it('renders children in the requested semantic element', () => {
    render(
      <AnimatedCard as="article" triggerOnScroll={false}>
        Portfolio project
      </AnimatedCard>
    );

    expect(screen.getByText('Portfolio project').tagName).toBe('ARTICLE');
  });
});
