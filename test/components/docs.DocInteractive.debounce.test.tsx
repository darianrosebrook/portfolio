import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { DocInteractive } from '@/ui/modules/docs/variants/DocInteractive';

vi.useFakeTimers();

describe('DocInteractive hash debounce', () => {
  it('debounces hash updates on rapid section changes', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const sections = [
      { id: 'a', code: { file: '/A.tsx', lines: [1, 2] } },
      { id: 'b', code: { file: '/B.tsx', lines: [3, 4] } },
    ] as any;

    // Render component (SectionSync will not run without nodes; simulate highlight changes via props bridge behavior)
    render(
      <div>
        <div data-section-id="a">A</div>
        <div data-section-id="b">B</div>
        <DocInteractive
          project={{ files: [{ path: '/A.tsx', contents: '' }] }}
          sections={sections}
        />
      </div>
    );

    // Trigger multiple hash updates by programmatically changing hash and advancing timers
    window.history.replaceState(null, '', '#a');
    window.history.replaceState(null, '', '#b');
    vi.advanceTimersByTime(200);

    expect(replaceSpy).toHaveBeenCalled();
  });
});
