import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedText } from '../AnimatedText';

vi.mock('gsap', () => {
  const mock = { registerPlugin: vi.fn(), set: vi.fn(), to: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })) };
  return { default: mock, gsap: mock };
});
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => ({ prefersReducedMotion: false }),
}));

describe('AnimatedText', () => {
  it('renders text content without throwing', () => {
    const { container } = render(<AnimatedText text="Hello world" />);
    // AnimatedText splits text into per-word spans; check container text content
    expect(container.textContent).toContain('Hello');
    expect(container.textContent).toContain('world');
  });

  it.todo('contract: renders correct element type when "as" prop is provided');
  it.todo('contract: blur-in variant splits text into word spans');
  it.todo('contract: animations skip when prefersReducedMotion is true');
});
