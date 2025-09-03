# Design Token System

This project implements a flexible design token system that supports **Bring Your Own Design System (BYODS)** patterns. Components can be themed using multiple token sources with smart defaults and type safety.

## Features

- 🎨 **Smart Defaults**: Components work out of the box with sensible fallback values
- 🔧 **BYODS Support**: Bring your own design system tokens via JSON, CSS, or inline overrides
- 🛡️ **Type Safety**: Full TypeScript support with token interfaces
- ⚡ **Performance**: Efficient token resolution with memoization
- 🎯 **Accessibility**: Built-in accessibility considerations and safe defaults
- 🔄 **Consistent API**: Standardized theming interface across all components

## Quick Start

### Basic Usage

```tsx
import { Button } from '@/components/Button';
import { Container as AlertNotice } from '@/components/AlertNotice';

// Use with default tokens
<Button variant="primary" size="medium">
  Click me
</Button>

<AlertNotice status="success" level="section" index={0}>
  Success message
</AlertNotice>
```

### Custom Theming

```tsx
import { Button, ButtonTheme } from '@/components/Button';

// Override specific tokens
const customTheme: ButtonTheme = {
  tokens: {
    'color-background-primary': '#ff6b35',
    'color-foreground-primary': '#ffffff',
    'radius-default': '4px',
  },
};

<Button theme={customTheme} variant="primary">
  Custom Button
</Button>;
```

### External Design System Integration

```tsx
import { Button } from '@/components/Button';
import myDesignSystemTokens from './my-design-system.json';

const theme = {
  tokenConfig: myDesignSystemTokens,
};

<Button theme={theme} variant="primary">
  Design System Button
</Button>;
```

## Token Sources (Priority Order)

1. **JSON Configuration** - Component's default tokens.json file
2. **External Token Config** - Your design system's token configuration
3. **Inline Token Overrides** - Direct token value overrides
4. **CSS Property Overrides** - Direct CSS style overrides

## Component Examples

### Button Component

```tsx
import { Button, ButtonTheme } from '@/components/Button';

// Basic usage
<Button variant="primary" size="large">
  Primary Button
</Button>;

// With custom theme
const buttonTheme: ButtonTheme = {
  tokens: {
    'color-background-primary': '#2563eb',
    'color-foreground-primary': '#ffffff',
    'size-large-padding': '20px',
    'transition-duration': '0.2s',
  },
  cssProperties: {
    '--custom-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};

<Button theme={buttonTheme} variant="primary" size="large">
  Custom Themed Button
</Button>;
```

### AlertNotice Component

```tsx
import {
  Container as AlertNotice,
  Title,
  BodyContent,
  Icon,
  AlertNoticeTheme,
} from '@/components/AlertNotice';

// Basic usage
<AlertNotice status="warning" level="section" index={0}>
  <Icon status="warning" />
  <Title>Warning</Title>
  <BodyContent>This is a warning message.</BodyContent>
</AlertNotice>;

// With custom theme
const alertTheme: AlertNoticeTheme = {
  tokens: {
    'color-background-warning': '#fef3c7',
    'color-foreground-warning': '#92400e',
    'size-section-padding': '24px',
    'radius-default': '12px',
  },
};

<AlertNotice theme={alertTheme} status="warning" level="section" index={0}>
  <Icon status="warning" />
  <Title>Custom Warning</Title>
  <BodyContent>This warning uses custom tokens.</BodyContent>
</AlertNotice>;
```

## Creating New Components with Token Support

Use the component factory utility to quickly add token support to new components:

```tsx
// MyComponent.types.ts
import { TokenValue } from '@/utils/designTokens';
import { ComponentTheme } from '@/utils/componentFactory';

export interface MyComponentTokens {
  'color-background': TokenValue;
  'color-foreground': TokenValue;
  'size-padding': TokenValue;
  'radius-default': TokenValue;
}

export interface MyComponentTheme extends ComponentTheme<MyComponentTokens> {}

export const DEFAULT_MY_COMPONENT_TOKENS: MyComponentTokens = {
  'color-background': '#ffffff',
  'color-foreground': '#000000',
  'size-padding': '16px',
  'radius-default': '8px',
};
```

```tsx
// MyComponent.tsx
import React from 'react';
import { createTokenHook } from '@/utils/componentFactory';
import {
  MyComponentTheme,
  DEFAULT_MY_COMPONENT_TOKENS,
} from './MyComponent.types';
import defaultTokenConfig from './MyComponent.tokens.json';
import styles from './MyComponent.module.scss';

const useMyComponentTokens = createTokenHook({
  componentName: 'myComponent',
  defaultTokens: DEFAULT_MY_COMPONENT_TOKENS,
  defaultTokenConfig,
});

interface MyComponentProps {
  theme?: MyComponentTheme;
  children: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({ theme, children }) => {
  const { cssProperties } = useMyComponentTokens(theme);

  return (
    <div className={styles.myComponent} style={cssProperties}>
      {children}
    </div>
  );
};

export default MyComponent;
```

## Token Configuration Format

### Component tokens.json Structure

```json
{
  "prefix": "myComponent",
  "tokens": {
    "color": {
      "background": {
        "primary": "{semantic.color.background.primary}",
        "secondary": "{semantic.color.background.secondary}"
      },
      "foreground": {
        "primary": "{semantic.color.foreground.primary}"
      }
    },
    "size": {
      "padding": "{core.size.04}",
      "radius": "{core.radius.medium}"
    }
  },
  "fallbacks": {
    "myComponent-color-background-primary": "#ffffff",
    "myComponent-color-background-secondary": "#f5f5f5",
    "myComponent-color-foreground-primary": "#000000",
    "myComponent-size-padding": "16px",
    "myComponent-size-radius": "8px"
  }
}
```

### Global Design System Integration

```json
{
  "core": {
    "color": {
      "primary": { "$value": "#2563eb" },
      "secondary": { "$value": "#64748b" }
    },
    "size": {
      "01": { "$value": "4px" },
      "02": { "$value": "8px" },
      "03": { "$value": "12px" },
      "04": { "$value": "16px" }
    }
  },
  "semantic": {
    "color": {
      "background": {
        "primary": { "$value": "{core.color.primary}" }
      }
    }
  }
}
```

## Best Practices

### 1. Use Semantic Tokens

Prefer semantic tokens over primitive values:

```tsx
// ✅ Good - semantic meaning
'color-background-primary': '{semantic.color.background.primary}'

// ❌ Avoid - primitive values
'color-background-primary': '#ffffff'
```

### 2. Provide Fallbacks

Always include fallback values in your tokens.json:

```json
{
  "fallbacks": {
    "component-token-name": "fallback-value"
  }
}
```

### 3. Use Type-Safe Token Interfaces

Define comprehensive token interfaces:

```tsx
export interface ComponentTokens {
  'color-background-primary': TokenValue;
  'color-background-secondary': TokenValue;
  // ... all possible tokens
}
```

### 4. Validate Props with Safe Defaults

Use the validation utilities:

```tsx
import { safeTokenValue } from '@/utils/designTokens';

const safeSize = safeTokenValue(size, 'medium', (val) =>
  ['small', 'medium', 'large'].includes(val as string)
) as ComponentSize;
```

### 5. Consistent Naming Conventions

Follow the established naming pattern:

- `{category}-{property}-{variant}`
- Examples: `color-background-primary`, `size-padding-large`, `typography-weight-bold`

## Advanced Usage

### Multiple Theme Sources

```tsx
const baseTheme = { tokens: { 'color-background-primary': '#ffffff' } };
const brandTheme = { tokens: { 'color-background-primary': '#2563eb' } };
const contextTheme = { tokens: { 'size-padding': '24px' } };

// Themes are merged in order (later overrides earlier)
<Button theme={mergeThemes(baseTheme, brandTheme, contextTheme)}>
  Multi-themed Button
</Button>;
```

### Runtime Token Updates

```tsx
const [theme, setTheme] = useState<ButtonTheme>({
  tokens: { 'color-background-primary': '#2563eb' },
});

// Update theme dynamically
const updateTheme = () => {
  setTheme({
    tokens: { 'color-background-primary': '#dc2626' },
  });
};

<Button theme={theme} onClick={updateTheme}>
  Dynamic Theme Button
</Button>;
```

### CSS-in-JS Integration

```tsx
const theme: ButtonTheme = {
  cssProperties: {
    '--button-custom-shadow': '0 10px 25px rgba(0, 0, 0, 0.2)',
    '--button-custom-transform': 'translateY(-2px)',
  }
};

// Use in CSS
.button:hover {
  box-shadow: var(--button-custom-shadow);
  transform: var(--button-custom-transform);
}
```

## Migration Guide

### From Existing Components

1. **Create token types** - Define your component's token interface
2. **Create tokens.json** - Move hardcoded values to token configuration
3. **Update component** - Add theme prop and token hook
4. **Update styles** - Replace hardcoded values with CSS custom properties
5. **Add fallbacks** - Ensure components work without themes

### Example Migration

Before:

```tsx
const Button = ({ variant, children }) => (
  <button className={`btn btn-${variant}`}>{children}</button>
);
```

After:

```tsx
const Button = ({ variant, theme, children }) => {
  const { cssProperties } = useButtonTokens(theme, variant);

  return (
    <button className={`btn btn-${variant}`} style={cssProperties}>
      {children}
    </button>
  );
};
```

## Troubleshooting

### Common Issues

1. **Tokens not applying**: Check CSS custom property names match token keys
2. **Type errors**: Ensure token interfaces are properly imported
3. **Performance issues**: Use memoization dependencies correctly
4. **Fallback not working**: Verify fallback values in tokens.json

### Debug Mode

Enable token debugging:

```tsx
const { tokens, cssProperties } = useComponentTokens(theme);
console.log('Resolved tokens:', tokens);
console.log('CSS properties:', cssProperties);
```

## Contributing

When adding new components or extending existing ones:

1. Follow the established patterns
2. Include comprehensive token interfaces
3. Provide meaningful fallback values
4. Add examples to this documentation
5. Test with multiple theme configurations

## Resources

- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
