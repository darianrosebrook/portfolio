import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedSection } from '../AnimatedSection';

vi.mock('gsap', () => {
  const mock = { registerPlugin: vi.fn(), set: vi.fn(), to: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })) };
  return { default: mock, gsap: mock };
});
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/context/ReducedMotionContext', () => ({
  useReducedMotion: () => ({ prefersReducedMotion: false }),
}));

describe('AnimatedSection', () => {
  it('renders children without throwing', () => {
    render(<AnimatedSection>Section content</AnimatedSection>);
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it.todo('contract: renders correct semantic element when "as" prop is provided');
  it.todo('contract: stagger-children variant animates direct children individually');
  it.todo('contract: animations skip when prefersReducedMotion is true');
});
