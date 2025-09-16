import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useOTP, UseOTPOptions } from '@/ui/components/OTP/useOTP';

describe('useOTP Hook', () => {
  const defaultOptions: UseOTPOptions = {
    length: 6,
    mode: 'numeric',
  };

  it('initializes with empty array', () => {
    const { result } = renderHook(() => useOTP(defaultOptions));

    expect(result.current.chars).toEqual(['', '', '', '', '', '']);
    expect(result.current.code).toBe('');
    expect(result.current.isComplete).toBe(false);
  });

  it('initializes with default value', () => {
    const { result } = renderHook(() =>
      useOTP({ ...defaultOptions, defaultValue: '123' })
    );

    expect(result.current.chars).toEqual(['1', '2', '3', '', '', '']);
    expect(result.current.code).toBe('123');
    expect(result.current.isComplete).toBe(false);
  });

  it('handles controlled mode', () => {
    const { result } = renderHook(() =>
      useOTP({ ...defaultOptions, value: '456789' })
    );

    expect(result.current.chars).toEqual(['4', '5', '6', '7', '8', '9']);
    expect(result.current.code).toBe('456789');
    expect(result.current.isComplete).toBe(true);
  });

  describe('Character Setting', () => {
    it('sets valid numeric character', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.setChar(0, '5');
      });

      expect(result.current.chars[0]).toBe('5');
      expect(onChange).toHaveBeenCalledWith('5');
    });

    it('rejects invalid character in numeric mode', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.setChar(0, 'a');
      });

      expect(result.current.chars[0]).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('accepts alphanumeric characters in alphanumeric mode', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, mode: 'alphanumeric', onChange })
      );

      act(() => {
        result.current.setChar(0, 'A');
      });

      expect(result.current.chars[0]).toBe('A');
      expect(onChange).toHaveBeenCalledWith('A');

      act(() => {
        result.current.setChar(1, '5');
      });

      expect(result.current.chars[1]).toBe('5');
    });

    it('handles custom regex mode', () => {
      const onChange = vi.fn();
      const hexRegex = /^[A-F0-9]$/i;
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, mode: hexRegex, onChange })
      );

      act(() => {
        result.current.setChar(0, 'F');
      });

      expect(result.current.chars[0]).toBe('F');

      act(() => {
        result.current.setChar(1, 'G');
      });

      expect(result.current.chars[1]).toBe('');
    });

    it('extracts last character from multi-character input', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.setChar(0, '123');
      });

      expect(result.current.chars[0]).toBe('3');
      expect(onChange).toHaveBeenCalledWith('3');
    });
  });

  describe('Character Clearing', () => {
    it('clears character at index', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, defaultValue: '123456', onChange })
      );

      act(() => {
        result.current.clearChar(2);
      });

      expect(result.current.chars).toEqual(['1', '2', '', '4', '5', '6']);
      expect(onChange).toHaveBeenCalledWith('12456');
    });
  });

  describe('Paste Handling', () => {
    it('distributes pasted content across fields', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.handlePaste(0, '123456');
      });

      expect(result.current.chars).toEqual(['1', '2', '3', '4', '5', '6']);
      expect(onChange).toHaveBeenCalledWith('123456');
    });

    it('filters invalid characters during paste', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.handlePaste(0, '1a2b3c4');
      });

      expect(result.current.chars).toEqual(['1', '2', '3', '4', '', '']);
      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('handles paste from middle position', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.handlePaste(2, '789');
      });

      expect(result.current.chars).toEqual(['', '', '7', '8', '9', '']);
      expect(onChange).toHaveBeenCalledWith('789');
    });

    it('respects field boundaries during paste', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onChange })
      );

      act(() => {
        result.current.handlePaste(4, '123456789');
      });

      expect(result.current.chars).toEqual(['', '', '', '', '1', '2']);
      expect(onChange).toHaveBeenCalledWith('12');
    });
  });

  describe('Completion Detection', () => {
    it('detects completion when all fields are filled', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onComplete })
      );

      // Fill all fields
      for (let i = 0; i < 6; i++) {
        act(() => {
          result.current.setChar(i, String(i + 1));
        });
      }

      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalledWith('123456');
    });

    it('calls onComplete during paste when all fields filled', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, onComplete })
      );

      act(() => {
        result.current.handlePaste(0, '123456');
      });

      expect(onComplete).toHaveBeenCalledWith('123456');
    });
  });

  describe('Disabled and ReadOnly States', () => {
    it('prevents changes when disabled', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, disabled: true, onChange })
      );

      act(() => {
        result.current.setChar(0, '5');
      });

      expect(result.current.chars[0]).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('prevents changes when readOnly', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useOTP({ ...defaultOptions, readOnly: true, onChange })
      );

      act(() => {
        result.current.setChar(0, '5');
      });

      expect(result.current.chars[0]).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Length Changes', () => {
    it('adjusts array length when length prop changes', () => {
      const { result, rerender } = renderHook(
        ({ length }) => useOTP({ ...defaultOptions, length }),
        { initialProps: { length: 4 } }
      );

      expect(result.current.chars).toHaveLength(4);

      rerender({ length: 8 });

      expect(result.current.chars).toHaveLength(8);
    });

    it('preserves existing values when length increases', () => {
      const { result, rerender } = renderHook(
        ({ length }) =>
          useOTP({ ...defaultOptions, length, defaultValue: '12' }),
        { initialProps: { length: 4 } }
      );

      expect(result.current.chars).toEqual(['1', '2', '', '']);

      rerender({ length: 6 });

      expect(result.current.chars).toEqual(['1', '2', '', '', '', '']);
    });
  });

  describe('Focus Management', () => {
    it('provides focus and blur methods', () => {
      const { result } = renderHook(() => useOTP(defaultOptions));

      expect(typeof result.current.focus).toBe('function');
      expect(typeof result.current.blur).toBe('function');
    });
  });
});
