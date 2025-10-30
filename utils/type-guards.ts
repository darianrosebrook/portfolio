/**
 * Type guard utilities for runtime type checking
 */
import React from 'react';

/**
 * Type guard to check if an element is an HTMLElement
 */
export function isHTMLElement(
  element: Element | null | undefined
): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Type guard to check if a ref is a function ref
 */
export function isFunctionRef<T>(
  ref: React.Ref<T>
): ref is (instance: T | null) => void {
  return typeof ref === 'function';
}

/**
 * Type guard to check if a ref is a ref object
 */
export function isRefObject<T>(
  ref: React.Ref<T>
): ref is React.MutableRefObject<T | null> {
  return ref != null && typeof ref === 'object' && 'current' in ref;
}

/**
 * Type guard to check if a value is a valid React element
 */
export function isValidReactElement(
  element: React.ReactNode
): element is React.ReactElement {
  return React.isValidElement(element);
}

/**
 * Type guard to check if document supports view transitions
 */
export function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as any).startViewTransition === 'function'
  );
}
