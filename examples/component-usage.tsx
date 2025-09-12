/**
 * Example showing how to use the enhanced design token system in React components
 */

import React from 'react';
import {
  generate,
  createDefaultConfig,
} from '../utils/designTokens/componentTokenUtils';
import designTokens from '../ui/designTokens.json';

// Example component tokens
const buttonTokens = {
  prefix: 'button',
  tokens: {
    // Simple references
    background: '{semantic.color.background.primary}',
    foreground: '{semantic.color.foreground.primary}',

    // Interpolation with fallbacks
    border:
      '1px solid {semantic.color.border.primary} || {core.color.neutral.300}',

    // Complex interpolation
    padding:
      'calc({semantic.size.padding.small} + {semantic.size.padding.xsmall})',

    // Typography
    fontSize: '{semantic.typography.body.medium}',
    fontWeight: '{semantic.typography.fontWeight.regular}',

    // States
    hover: {
      background: '{semantic.color.background.hover}',
      transform: 'translateY(-1px)',
    },

    disabled: {
      background: '{semantic.color.background.disabled}',
      foreground: '{semantic.color.foreground.disabled}',
      opacity: '0.6',
    },
  },
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  theme?: 'light' | 'dark';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  theme = 'light',
  onClick,
}) => {
  // Create resolver configuration
  const config = createDefaultConfig({
    theme,
    cssVarPrefix: '--button-',
    unitPreferences: {
      dimension: 'px',
      duration: 'ms',
    },
  });

  // Generate CSS custom properties
  const tokenStyles = generate(buttonTokens, designTokens, config);

  // Apply variant-specific overrides
  const variantStyles =
    variant === 'secondary'
      ? { '--button-background': tokenStyles['--button-foreground'] }
      : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...tokenStyles,
        ...variantStyles,
        // Additional component-specific styles
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease-in-out',
      }}
      className="button"
    >
      {children}
    </button>
  );
};

// Example usage in a parent component
export const ButtonExample: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Button Component with Design Tokens</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Theme:
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button theme={theme} onClick={() => console.log('Primary clicked')}>
          Primary Button
        </Button>

        <Button
          theme={theme}
          variant="secondary"
          onClick={() => console.log('Secondary clicked')}
        >
          Secondary Button
        </Button>

        <Button
          theme={theme}
          disabled
          onClick={() => console.log('This should not fire')}
        >
          Disabled Button
        </Button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Generated CSS Variables:</h3>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(
            generate(
              buttonTokens,
              designTokens,
              createDefaultConfig({ theme })
            ),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};
