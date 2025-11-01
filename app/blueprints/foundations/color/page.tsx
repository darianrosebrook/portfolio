/**
 * Metadata for the /blueprints/foundations/color page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Color Foundations | Darian Rosebrook',
  description:
    'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
  openGraph: {
    title: 'Color Foundations | Darian Rosebrook',
    description:
      'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Foundations | Darian Rosebrook',
    description:
      'Explore the principles and practices of building robust, accessible color systems for design systems and digital products.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

import styles from './page.module.scss';

const ColorPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Color Foundations</h1>
      <p>
        Color is one of the most powerful tools in design, serving multiple
        purposes from establishing brand identity to providing visual hierarchy
        and ensuring accessibility. This section covers the principles and
        practices of creating a robust color system that scales across themes,
        platforms, and use cases.
      </p>

      <h2>The Role of Color in Design Systems</h2>
      <p>
        Color serves three primary functions in a design system:
      </p>
      <ul>
        <li>
          <strong>Brand Identity:</strong> Colors communicate personality,
          values, and differentiate your product from competitors.
        </li>
        <li>
          <strong>Visual Hierarchy:</strong> Color guides attention, indicates
          importance, and creates relationships between elements.
        </li>
        <li>
          <strong>Functional Communication:</strong> Colors convey states
          (success, error, warning), roles (primary, secondary), and
          interactions (hover, active, disabled).
        </li>
      </ul>

      <p>
        A well-structured color system treats color as a structured vocabulary
        rather than a collection of arbitrary values. This enables consistency,
        accessibility, and maintainability across large-scale applications.
      </p>

      <h2>Two-Layer Color Architecture</h2>
      <p>
        Our color system follows a two-layer architecture that separates
        primitive values from semantic roles:
      </p>

      <h3>Core Layer: Color Primitives</h3>
      <p>
        The core layer contains raw color values organized into palettes. These
        are the building blocks—stable primitives that rarely change across
        brands or themes:
      </p>

      <ul>
        <li>
          <strong>Mode colors:</strong> Fundamental values like black, white,
          light, dark, and transparent
        </li>
        <li>
          <strong>Brand palette:</strong> Primary brand colors organized in
          scales (100-800)
        </li>
        <li>
          <strong>Neutral palette:</strong> Grayscale values for text,
          backgrounds, and borders
        </li>
        <li>
          <strong>Semantic palettes:</strong> Color scales for red, orange,
          yellow, green, and blue used for status and feedback
        </li>
      </ul>

      <p>Example core token structure:</p>
      <pre>
        <code>{`{
  "core.color.palette.brand.primary.500": {
    "$type": "color",
    "$value": "#0A65FE"
  },
  "core.color.palette.neutral.600": {
    "$type": "color",
    "$value": "#555555"
  }
}`}</code>
      </pre>

      <h3>Semantic Layer: Purpose-Driven Roles</h3>
      <p>
        The semantic layer assigns meaning to colors. These tokens describe{' '}
        <em>what</em> a color is used for, not <em>which</em> color it is:
      </p>

      <ul>
        <li>
          <strong>Foreground roles:</strong>{' '}
          <code>foreground.primary</code>, <code>foreground.secondary</code>,{' '}
          <code>foreground.danger</code>, <code>foreground.link</code>
        </li>
        <li>
          <strong>Background roles:</strong>{' '}
          <code>background.primary</code>, <code>background.secondary</code>,{' '}
          <code>background.elevated</code>, <code>background.brand</code>
        </li>
        <li>
          <strong>Border roles:</strong> <code>border.default</code>,{' '}
          <code>border.focus</code>, <code>border.divider</code>
        </li>
        <li>
          <strong>State roles:</strong> <code>background.hover</code>,{' '}
          <code>background.active</code>, <code>background.disabled</code>
        </li>
      </ul>

      <p>Semantic tokens alias core primitives:</p>
      <pre>
        <code>{`{
  "semantic.color.foreground.primary": {
    "$type": "color",
    "$value": "{core.color.mode.dark}",
    "$extensions": {
      "design.paths.light": "{core.color.mode.dark}",
      "design.paths.dark": "{core.color.mode.light}"
    }
  },
  "semantic.color.background.primary": {
    "$type": "color",
    "$value": "{core.color.mode.white}"
  }
}`}</code>
      </pre>

      <h2>Palette Types and Scales</h2>

      <h3>Brand Palette</h3>
      <p>
        The brand palette establishes your product&apos;s visual identity. It
        typically includes:
      </p>
      <ul>
        <li>
          <strong>Primary brand color:</strong> The main brand color, usually
          used for CTAs, links, and key interactive elements
        </li>
        <li>
          <strong>Brand scale:</strong> Multiple shades (100-800) of the brand
          color for various use cases
        </li>
      </ul>
      <p>
        Brand colors are named by their role (primary, secondary) and intensity
        (100-800), where higher numbers indicate darker shades.
      </p>

      <h3>Neutral Palette</h3>
      <p>
        Neutral colors provide structure and hierarchy without competing with
        brand colors. They&apos;re used for:
      </p>
      <ul>
        <li>Text content at different hierarchy levels</li>
        <li>Background surfaces and elevations</li>
        <li>Borders and dividers</li>
        <li>Subtle UI elements</li>
      </ul>
      <p>
        Neutral palettes should have sufficient contrast steps to support
        accessible text/background combinations in both light and dark modes.
      </p>

      <h3>Semantic Color Palettes</h3>
      <p>
        Status colors (red, orange, yellow, green, blue) communicate meaning
        beyond aesthetic:
      </p>
      <ul>
        <li>
          <strong>Red:</strong> Errors, destructive actions, danger states
        </li>
        <li>
          <strong>Orange:</strong> Warnings, cautionary states
        </li>
        <li>
          <strong>Yellow:</strong> Alerts, attention-grabbing notices
        </li>
        <li>
          <strong>Green:</strong> Success, positive feedback, completed states
        </li>
        <li>
          <strong>Blue:</strong> Informational content, neutral status
        </li>
      </ul>
      <p>
        Each semantic color includes scales (100-800) and often has both
        &quot;strong&quot; and &quot;subtle&quot; variants for different
        contexts (e.g., <code>background.danger-strong</code> vs{' '}
        <code>background.danger-subtle</code>).
      </p>

      <h2>Token Naming Conventions</h2>
      <p>
        Consistent naming makes tokens discoverable and self-documenting. Our
        color tokens follow this structure:
      </p>

      <pre>
        <code>{`{layer}.color.{category}.{role}.{variant?}

Examples:
- core.color.palette.brand.primary.500
- semantic.color.foreground.primary
- semantic.color.background.danger-strong
- semantic.color.border.focus`}</code>
      </pre>

      <p>Naming principles:</p>
      <ul>
        <li>
          <strong>Use purpose, not value:</strong>{' '}
          <code>foreground.primary</code> not <code>gray.900</code>
        </li>
        <li>
          <strong>Be consistent:</strong> Use the same role names across
          foreground, background, and border
        </li>
        <li>
          <strong>Keep hierarchy clear:</strong> Avoid skipping levels or
          mixing naming conventions
        </li>
        <li>
          <strong>Use semantic modifiers:</strong> <code>danger-strong</code>,{' '}
          <code>success-subtle</code> rather than numeric variations
        </li>
      </ul>

      <h2>Light and Dark Theme Support</h2>
      <p>
        Modern design systems must support both light and dark modes. Our token
        system uses <code>$extensions.design.paths</code> to map semantic roles
        to different core values per mode:
      </p>

      <pre>
        <code>{`{
  "semantic.color.foreground.primary": {
    "$type": "color",
    "$value": "{core.color.mode.dark}",
    "$extensions": {
      "design.paths.light": "{core.color.mode.dark}",
      "design.paths.dark": "{core.color.mode.light}"
    }
  },
  "semantic.color.background.primary": {
    "$type": "color",
    "$value": "{core.color.mode.white}",
    "$extensions": {
      "design.paths.light": "{core.color.mode.white}",
      "design.paths.dark": "{core.color.mode.dark}"
    }
  }
}`}</code>
      </pre>

      <p>Benefits of this approach:</p>
      <ul>
        <li>
          <strong>Single source of truth:</strong> One token definition handles
          both modes
        </li>
        <li>
          <strong>Maintainable:</strong> Changing a mode mapping updates
          everywhere automatically
        </li>
        <li>
          <strong>Type-safe:</strong> Components reference the same token
          regardless of active theme
        </li>
        <li>
          <strong>Flexible:</strong> Easy to add additional modes (high contrast,
          brand variations) without breaking existing components
        </li>
      </ul>

      <h2>Contrast Evaluation: WCAG and APCA</h2>
      <p>
        Color contrast is critical for accessibility. Two primary methods are
        used to evaluate contrast:
      </p>

      <h3>WCAG 2.1 Contrast Ratios</h3>
      <p>
        The Web Content Accessibility Guidelines (WCAG) define minimum contrast
        ratios:
      </p>
      <ul>
        <li>
          <strong>Level AA (minimum):</strong> 4.5:1 for normal text, 3:1 for
          large text (18pt+ or 14pt+ bold)
        </li>
        <li>
          <strong>Level AAA (enhanced):</strong> 7:1 for normal text, 4.5:1 for
          large text
        </li>
      </ul>
      <p>
        WCAG uses a simple ratio calculation: (L1 + 0.05) / (L2 + 0.05) where
        L1 is the relative luminance of the lighter color and L2 is the
        relative luminance of the darker color.
      </p>

      <h3>APCA: Advanced Perceptual Contrast Algorithm</h3>
      <p>
        APCA (Advanced Perceptual Contrast Algorithm) is a newer method that
        better accounts for human perception:
      </p>
      <ul>
        <li>
          Considers spatial frequency (text size and weight) more accurately
        </li>
        <li>
          Provides perceptually uniform contrast values (L<sup>c</sup>)
        </li>
        <li>
          Minimum thresholds: 60 L<sup>c</sup> for body text, 75 L<sup>c</sup>{' '}
          for large text
        </li>
      </ul>
      <p>
        Many design systems are migrating to APCA for more accurate contrast
        evaluation, especially for dark mode and non-standard color combinations.
      </p>

      <h3>Contrast in Token Design</h3>
      <p>
        Design tokens should encode contrast requirements:
      </p>
      <ul>
        <li>
          Semantic tokens can document minimum contrast ratios in their
          descriptions
        </li>
        <li>
          Validation tools can check token combinations against WCAG/APCA
          thresholds
        </li>
        <li>
          Pair tokens explicitly (e.g.,{' '}
          <code>foreground.primary</code> + <code>background.primary</code>)
          to ensure accessible combinations
        </li>
      </ul>

      <h2>Accessibility Considerations</h2>
      <p>
        Color accessibility extends beyond contrast ratios:
      </p>

      <h3>Color Independence</h3>
      <p>
        <strong>Never rely on color alone to convey meaning.</strong> Always
        pair color with:
      </p>
      <ul>
        <li>
          <strong>Icons:</strong> Visual symbols that reinforce meaning
        </li>
        <li>
          <strong>Text labels:</strong> Explicit text describing state or
          action
        </li>
        <li>
          <strong>Patterns or textures:</strong> For data visualization and
          charts
        </li>
        <li>
          <strong>Shape or position:</strong> Additional visual cues
        </li>
      </ul>

      <h3>Focus Indicators</h3>
      <p>
        Focus states must be visible and high-contrast:
      </p>
      <ul>
        <li>
          Use dedicated focus color tokens (e.g.,{' '}
          <code>border.focus</code>)
        </li>
        <li>
          Ensure focus indicators meet WCAG 2.1 Non-text Contrast (3:1 minimum)
        </li>
        <li>
          Consider using multiple indicators (outline + background change) for
          clarity
        </li>
      </ul>

      <h3>State Communication</h3>
      <p>
        Interactive states should be clearly distinguishable:
      </p>
      <ul>
        <li>
          <strong>Hover:</strong> Subtle but noticeable color change
        </li>
        <li>
          <strong>Active/Pressed:</strong> More pronounced change to indicate
          interaction
        </li>
        <li>
          <strong>Disabled:</strong> Reduced opacity or distinct color to
          indicate non-interactivity
        </li>
        <li>
          <strong>Focus:</strong> Clear, high-contrast indicator
        </li>
      </ul>

      <h3>Testing Color Accessibility</h3>
      <p>
        Validate color accessibility at multiple stages:
      </p>
      <ul>
        <li>
          <strong>Design phase:</strong> Use tools like Stark, Able, or Contrast
          plugins in Figma
        </li>
        <li>
          <strong>Token validation:</strong> Automated checks during token build
          process
        </li>
        <li>
          <strong>Component testing:</strong> Verify contrast in actual
          component implementations
        </li>
        <li>
          <strong>User testing:</strong> Test with users who have color vision
          deficiencies
        </li>
      </ul>

      <h2>Implementation Patterns</h2>
      <p>
        Color tokens are consumed in different ways depending on context:
      </p>

      <h3>CSS Custom Properties</h3>
      <p>
        Tokens compile to CSS custom properties for runtime theming:
      </p>
      <pre>
        <code>{`/* Generated CSS variables */
:root {
  --semantic-color-foreground-primary: var(--core-color-mode-dark);
  --semantic-color-background-primary: var(--core-color-mode-white);
}

[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--core-color-mode-light);
  --semantic-color-background-primary: var(--core-color-mode-dark);
}`}</code>
      </pre>

      <h3>Component Usage</h3>
      <p>
        Components reference semantic tokens, not core values:
      </p>
      <pre>
        <code>{`.button {
  background-color: var(--semantic-color-background-brand);
  color: var(--semantic-color-foreground-on-brand);
  
  &:hover {
    background-color: var(--semantic-color-background-hover);
  }
  
  &:focus {
    outline: 2px solid var(--semantic-color-border-focus);
  }
}`}</code>
      </pre>

      <h3>TypeScript Integration</h3>
      <p>
        Type-safe token paths ensure correctness at compile time:
      </p>
      <pre>
        <code>{`import type { TokenPath } from '@/types/designTokens';

function getColorToken(path: TokenPath): string {
  // Type-safe token access
  const tokenPath = path.replace(/\\./g, '-');
  return 'var(--' + tokenPath + ')';
}

// Usage
const primaryBg = getColorToken(
  'semantic.color.background.primary'
);`}</code>
      </pre>

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Start with semantics:</strong> Define what colors mean, not
          which colors to use
        </li>
        <li>
          <strong>Test in context:</strong> Validate contrast in actual
          component combinations, not just isolated tokens
        </li>
        <li>
          <strong>Document exceptions:</strong> If a token pair doesn&apos;t
          meet contrast requirements, document why and provide alternatives
        </li>
        <li>
          <strong>Validate early:</strong> Check contrast during palette design,
          not after implementation
        </li>
        <li>
          <strong>Consider color vision:</strong> Test palettes with color
          blindness simulators
        </li>
        <li>
          <strong>Plan for scale:</strong> Design palettes that can expand
          without breaking existing tokens
        </li>
        <li>
          <strong>Maintain aliases:</strong> Always use semantic tokens in
          components; avoid referencing core palette directly
        </li>
      </ul>

      <h2>Related Foundations</h2>
      <p>
        Color intersects with other foundations:
      </p>
      <ul>
        <li>
          <strong>Design Tokens:</strong> Learn about token architecture and
          theming strategies
        </li>
        <li>
          <strong>Accessibility:</strong> Deep dive into accessibility
          standards and token-level accessibility
        </li>
        <li>
          <strong>Typography:</strong> Understand how text color affects
          readability and hierarchy
        </li>
      </ul>
    </section>
  );
};

export default ColorPage;
