import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedCard } from '../AnimatedCard';

vi.mock('gsap', () => {
  const mock = { registerPlugin: vi.fn(), set: vi.fn(), to: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })) };
  return { default: mock, gsap: mock };
});
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => ({ prefersReducedMotion: false }),
}));

describe('AnimatedCard', () => {
  it('renders children without throwing', () => {
    render(<AnimatedCard>Card content</AnimatedCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it.todo('contract: anatomy slots (image, title, overlay) render correctly');
  it.todo('contract: hover effects are disabled when prefersReducedMotion is true');
  it.todo('contract: scroll trigger animation fires on viewport entry');
});
