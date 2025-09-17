import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { SectionSync } from '@/ui/modules/docs/primitives/SectionSync';

describe('SectionSync', () => {
  it('emits decorations and active section when intersections occur', () => {
    const onActiveSection = vi.fn();
    const onDecorate = vi.fn();

    const sections = [
      { id: 'overview', code: { file: '/App.tsx', lines: [1, 3] } },
      { id: 'usage', code: { file: '/App.tsx', lines: [10, 12] } },
    ];

    const { container } = render(
      <div>
        <div data-section-id="overview">Overview</div>
        <div data-section-id="usage">Usage</div>
        <SectionSync
          sections={sections as any}
          onActiveSection={onActiveSection}
          onDecorate={onDecorate}
        />
      </div>
    );

    // Simulate observer callback
    const nodes = container.querySelectorAll('[data-section-id]');
    const cb = (global.IntersectionObserver as unknown as any).mock
      ?.calls?.[0]?.[0];
    if (cb) {
      cb([
        {
          target: nodes[0],
          intersectionRatio: 0.8,
          isIntersecting: true,
          boundingClientRect: nodes[0].getBoundingClientRect?.(),
        } as any,
      ]);
    }

    expect(onActiveSection).toHaveBeenCalled();
    expect(onDecorate).toHaveBeenCalled();
  });
});
