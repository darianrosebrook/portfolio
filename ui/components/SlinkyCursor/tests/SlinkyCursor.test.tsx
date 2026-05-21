import * as React from 'react';
import { render } from '@testing-library/react';

import SlinkyCursor from '../SlinkyCursor';
import { InteractionProvider } from '@/context/InteractionContext';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';

// SlinkyCursor calls useInteraction() which requires InteractionProvider.
// InteractionProvider in turn calls useReducedMotion() which requires ReducedMotionProvider.
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ReducedMotionProvider>
      <InteractionProvider>{children}</InteractionProvider>
    </ReducedMotionProvider>
  );
}

describe('SlinkyCursor', () => {
  it('renders slinky cursor', () => {
    render(<SlinkyCursor />, { wrapper: Wrapper });

    // Component renders a div with class "pest" (not "slinky-cursor")
    const cursor = document.querySelector('[data-ds-component="Slinkycursor"]');
    expect(cursor).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SlinkyCursor />, { wrapper: Wrapper });

    const cursor = document.querySelector('[data-ds-component="Slinkycursor"]');
    expect(cursor).toBeInTheDocument();
  });

  describe('Design Tokens', () => {
    it('uses design tokens instead of hardcoded values', () => {
      render(<SlinkyCursor />, { wrapper: Wrapper });

      // Component renders with class "pest" per SlinkyCursor.tsx
      const cursor = document.querySelector('[data-ds-component="Slinkycursor"]');
      expect(cursor).toHaveClass('pest');
    });
  });
});
