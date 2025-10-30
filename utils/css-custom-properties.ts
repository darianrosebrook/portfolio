/**
 * CSS Custom Properties utility for type-safe custom property declarations
 * 
 * This utility helps avoid 'as any' type assertions when setting CSS custom properties
 * in React components. It provides proper typing while maintaining flexibility.
 */
import React from 'react';

/**
 * Creates a CSSProperties object with custom properties
 * Type-safe way to set CSS custom properties without 'as any'
 * 
 * @example
 * ```tsx
 * const style = createCSSProperties({
 *   '--component-height': '200px',
 *   '--component-width': '100%',
 * });
 * ```
 */
export function createCSSProperties(
  customProperties: Record<string, string | number | undefined>
): React.CSSProperties {
  return customProperties as React.CSSProperties;
}

/**
 * Type-safe helper for setting a single CSS custom property
 * 
 * @example
 * ```tsx
 * const style = {
 *   ...existingStyle,
 *   ...setCSSProperty('--custom-var', 'value'),
 * };
 * ```
 */
export function setCSSProperty(
  name: string,
  value: string | number | undefined
): React.CSSProperties {
  return { [name]: value } as React.CSSProperties;
}

