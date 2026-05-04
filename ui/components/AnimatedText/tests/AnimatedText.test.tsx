import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../../test/test-utils';
import { AnimatedText } from '../AnimatedText';

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

describe('AnimatedText', () => {
  it('renders text words inside the requested element', () => {
    render(<AnimatedText as="h2" text="Hello world" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Hello world'
    );
  });
});
