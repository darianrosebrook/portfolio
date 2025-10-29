import { describe, it, expect, vi, afterEach } from 'vitest';
import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import { PropsBridge } from '@/ui/modules/CodeSandbox/primitives/PropsBridge';

describe('PropsBridge', () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
  });

  it('calls sandpack.updateFile with JSON when values change', async () => {
    const updateFile = vi.fn();
    vi.doMock('@codesandbox/sandpack-react', () => ({
      useSandpack: () => ({ sandpack: { updateFile } }),
    }));
    const { PropsBridge: TestedBridge } = await import(
      '@/ui/modules/CodeSandbox/primitives/PropsBridge'
    );
    const { rerender } = render(<TestedBridge values={{ a: 1 }} />);
    rerender(<TestedBridge values={{ a: 2 }} />);
    expect(updateFile).toHaveBeenCalled();
  });
});
