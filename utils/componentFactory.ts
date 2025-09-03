/**
 * Component Factory Utilities
 *
 * Provides utilities for creating consistent design token implementations
 * across components with BYODS (Bring Your Own Design System) support.
 */

import { useMemo } from 'react';
import { CSSProperties } from 'react';
import {
  TokenValue,
  ComponentTokenConfig,
  mergeTokenSources,
  tokensToCSSProperties,
  TokenSource,
} from './designTokens';

/**
 * Generic component theme interface
 */
export interface ComponentTheme<T extends Record<string, TokenValue>> {
  /** Custom token overrides */
  tokens?: Partial<T>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Token hook factory options
 */
export interface TokenHookOptions<T extends Record<string, TokenValue>> {
  /** Component name for CSS variable prefixing */
  componentName: string;
  /** Default token values */
  defaultTokens: T;
  /** Default token configuration (JSON) */
  defaultTokenConfig: ComponentTokenConfig;
}

/**
 * Creates a standardized token hook for any component
 *
 * @param options - Configuration for the token hook
 * @returns A hook function for managing component tokens
 *
 * @example
 * ```typescript
 * const useMyComponentTokens = createTokenHook({
 *   componentName: 'myComponent',
 *   defaultTokens: DEFAULT_MY_COMPONENT_TOKENS,
 *   defaultTokenConfig: myComponentTokenConfig
 * });
 * ```
 */
export function createTokenHook<T extends Record<string, TokenValue>>(
  options: TokenHookOptions<T>
) {
  const { componentName, defaultTokens, defaultTokenConfig } = options;

  return function useComponentTokens(
    theme?: ComponentTheme<T>,
    ...dependencies: unknown[]
  ): {
    tokens: Record<string, TokenValue>;
    cssProperties: CSSProperties;
  } {
    return useMemo(() => {
      const tokenSources: TokenSource[] = [];

      // 1. Start with JSON token configuration
      tokenSources.push({
        type: 'json',
        data: defaultTokenConfig,
      });

      // 2. Add external token config if provided
      if (theme?.tokenConfig) {
        tokenSources.push({
          type: 'json',
          data: theme.tokenConfig,
        });
      }

      // 3. Add inline token overrides
      if (theme?.tokens) {
        const inlineTokens: Record<string, TokenValue> = {};
        Object.entries(theme.tokens).forEach(([key, value]) => {
          inlineTokens[`${componentName}-${key}`] = value;
        });

        tokenSources.push({
          type: 'inline',
          tokens: inlineTokens,
        });
      }

      // Merge all token sources with fallbacks
      const resolvedTokens = mergeTokenSources(tokenSources, {
        fallbacks: (() => {
          const fallbacks: Record<string, TokenValue> = {};
          Object.entries(defaultTokens).forEach(([key, value]) => {
            fallbacks[`${componentName}-${key}`] = value;
          });
          return fallbacks;
        })(),
      });

      // Generate CSS custom properties
      const cssProperties = tokensToCSSProperties(
        resolvedTokens,
        componentName
      );

      // Add any direct CSS property overrides
      if (theme?.cssProperties) {
        Object.assign(cssProperties, theme.cssProperties);
      }

      return {
        tokens: resolvedTokens,
        cssProperties,
      };
    }, [theme, ...dependencies]);
  };
}

/**
 * Utility for creating component variant class names
 */
export function createVariantClassName(
  styles: Record<string, string>,
  baseClass: string,
  variants: Record<string, string | undefined>,
  additionalClasses: string[] = []
): string {
  const classes = [styles[baseClass] ?? ''];

  // Add variant classes
  Object.entries(variants).forEach(([key, value]) => {
    if (value) {
      const variantClass = `${baseClass}__${key}--${value}`;
      if (styles[variantClass]) {
        classes.push(styles[variantClass]);
      }
    }
  });

  // Add additional classes
  classes.push(...additionalClasses);

  return classes.filter(Boolean).join(' ');
}

/**
 * Utility for safe prop validation with fallbacks
 */
export function validateComponentProps<T>(
  props: Record<string, unknown>,
  validators: Record<string, (value: unknown) => value is T>,
  fallbacks: Record<string, T>
): Record<string, T> {
  const validatedProps: Record<string, T> = {};

  Object.entries(validators).forEach(([key, validator]) => {
    const value = props[key];
    if (validator(value)) {
      validatedProps[key] = value;
    } else {
      validatedProps[key] = fallbacks[key];
      if (value !== undefined) {
        console.warn(
          `Invalid prop "${key}" with value "${value}". Using fallback: "${fallbacks[key]}"`
        );
      }
    }
  });

  return validatedProps;
}

/**
 * Common prop validators
 */
export const validators = {
  string: (value: unknown): value is string => typeof value === 'string',
  number: (value: unknown): value is number =>
    typeof value === 'number' && !isNaN(value),
  boolean: (value: unknown): value is boolean => typeof value === 'boolean',
  positiveNumber: (value: unknown): value is number =>
    typeof value === 'number' && value >= 0,
  nonEmptyString: (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0,
  oneOf:
    <T extends string>(options: T[]) =>
    (value: unknown): value is T =>
      typeof value === 'string' && options.includes(value as T),
};

/**
 * Utility for creating consistent component documentation
 */
export interface ComponentDocumentation {
  name: string;
  description: string;
  props: Record<
    string,
    {
      type: string;
      required?: boolean;
      default?: string;
      description: string;
    }
  >;
  tokens: Record<
    string,
    {
      type: string;
      default: string;
      description: string;
    }
  >;
  examples: Array<{
    title: string;
    description: string;
    code: string;
  }>;
}

/**
 * Creates standardized component documentation
 */
export function createComponentDocs(
  docs: ComponentDocumentation
): ComponentDocumentation {
  return {
    ...docs,
    // Add standard theme prop documentation
    props: {
      ...docs.props,
      theme: {
        type: 'ComponentTheme',
        required: false,
        description:
          'Custom theming options including token overrides and CSS properties',
      },
      className: {
        type: 'string',
        required: false,
        description: 'Additional CSS class names to apply to the component',
      },
    },
  };
}

/**
 * Type helper for extracting token keys from a token interface
 */
export type TokenKeys<T> = T extends Record<infer K, TokenValue> ? K : never;

/**
 * Type helper for creating theme interfaces
 */
export type CreateTheme<T extends Record<string, TokenValue>> =
  ComponentTheme<T>;

/**
 * Utility for merging multiple theme objects
 */
export function mergeThemes<T extends Record<string, TokenValue>>(
  ...themes: Array<ComponentTheme<T> | undefined>
): ComponentTheme<T> | undefined {
  const validThemes = themes.filter(Boolean) as ComponentTheme<T>[];

  if (validThemes.length === 0) return undefined;
  if (validThemes.length === 1) return validThemes[0];

  return validThemes.reduce((merged, theme) => ({
    tokens: { ...merged.tokens, ...theme.tokens },
    cssProperties: { ...merged.cssProperties, ...theme.cssProperties },
    tokenConfig: theme.tokenConfig || merged.tokenConfig,
  }));
}
