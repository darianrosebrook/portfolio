import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../test/test-utils';
import { AnimatedSection } from '../AnimatedSection';

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

describe('AnimatedSection', () => {
  it('preserves content and section semantics', () => {
    render(<AnimatedSection>Section content</AnimatedSection>);

    expect(screen.getByText('Section content').tagName).toBe('SECTION');
  });
});
