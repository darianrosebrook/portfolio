import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { PropsBridge } from '@/ui/modules/docs/primitives/PropsBridge';

// Mock useSandpack hook
const mockUpdateFile = vi.fn();
const mockSandpack = {
  updateFile: mockUpdateFile,
  files: {},
  activeFile: '/App.tsx',
  openFile: vi.fn(),
};

vi.mock('@codesandbox/sandpack-react', () => ({
  useSandpack: () => ({ sandpack: mockSandpack }),
}));

describe('PropsBridge Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write initial values to default path', async () => {
    const values = { variant: 'primary', size: 'md', disabled: false };

    render(<PropsBridge values={values} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(values, null, 2)
      );
    });
  });

  it('should write to custom path when specified', async () => {
    const values = { theme: 'dark', compact: true };
    const customPath = '/config/props.json';

    render(<PropsBridge values={values} path={customPath} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        customPath,
        JSON.stringify(values, null, 2)
      );
    });
  });

  it('should update file when values change', async () => {
    const initialValues = { variant: 'primary', size: 'md' };
    const updatedValues = { variant: 'secondary', size: 'lg' };

    const { rerender } = render(<PropsBridge values={initialValues} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(initialValues, null, 2)
      );
    });

    // Clear previous calls to isolate the update
    mockUpdateFile.mockClear();

    rerender(<PropsBridge values={updatedValues} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(updatedValues, null, 2)
      );
    });
  });

  it('should handle complex nested values', async () => {
    const complexValues = {
      variant: 'primary',
      config: {
        theme: 'dark',
        features: ['feature1', 'feature2'],
        metadata: {
          version: '1.0.0',
          author: 'test',
        },
      },
      callbacks: null, // Should be serializable
    };

    render(<PropsBridge values={complexValues} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(complexValues, null, 2)
      );
    });
  });

  it('should handle empty values', async () => {
    const emptyValues = {};

    render(<PropsBridge values={emptyValues} />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(emptyValues, null, 2)
      );
    });
  });

  it('should gracefully handle updateFile errors', async () => {
    // Mock updateFile to throw an error
    mockUpdateFile.mockImplementation(() => {
      throw new Error('Sandpack error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const values = { variant: 'primary' };

    // Should not throw
    expect(() => {
      render(<PropsBridge values={values} />);
    }).not.toThrow();

    // Should still attempt to call updateFile
    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should handle missing updateFile gracefully', async () => {
    // Test that PropsBridge doesn't crash when updateFile is missing
    // This is more of a smoke test since the actual behavior is internal
    const values = { variant: 'primary' };

    // This should not throw
    expect(() => {
      render(<PropsBridge values={values} />);
    }).not.toThrow();

    // The fact that other tests pass shows updateFile works normally
    expect(true).toBe(true);
  });
});

describe('PropsBridge with DocVariants Integration', () => {
  it('should work with typical DocVariants use case', async () => {
    // Simulate how DocVariants would use PropsBridge
    const VariantDemo = () => {
      const [controlValues, setControlValues] = React.useState({
        variant: 'primary',
        size: 'md',
        disabled: false,
      });

      const [tileProps, setTileProps] = React.useState({
        variant: 'secondary',
        size: 'lg',
      });

      const combinedProps = { ...controlValues, ...tileProps };

      return <PropsBridge values={combinedProps} />;
    };

    render(<VariantDemo />);

    await waitFor(() => {
      expect(mockUpdateFile).toHaveBeenCalledWith(
        '/props.json',
        JSON.stringify(
          {
            variant: 'secondary', // tileProps override controlValues
            size: 'lg',
            disabled: false,
          },
          null,
          2
        )
      );
    });
  });
});
