/**
 * React ref utilities for safe ref merging and forwarding
 */
import React from 'react';

/**
 * Merges multiple refs into a single ref callback
 * Handles both function refs and ref objects safely
 *
 * @example
 * ```tsx
 * const mergedRef = mergeRefs(ref1, ref2, forwardedRef);
 * return <div ref={mergedRef} />;
 * ```
 */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined | null>
): React.RefCallback<T> {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

/**
 * Creates a ref callback for forwarding a ref
 * Useful when you need to forward a ref but also use it internally
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * const forwardedRefCallback = useForwardedRef(forwardedRef);
 * 
 * return (
 *   <input
 *     ref={(node) => {
 *       inputRef.current = node;
 *       forwardedRefCallback(node);
 *     }}
 *   />
 * );
 * ```
 */
export function useForwardedRef<T>(
  forwardedRef: React.Ref<T>
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef != null) {
        (forwardedRef as React.MutableRefObject<T | null>).current = node;
      }
    },
    [forwardedRef]
  );
}

/**
 * Sets a ref value safely, handling both function refs and ref objects
 */
export function setRef<T>(
  ref: React.Ref<T> | undefined | null,
  value: T | null
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

