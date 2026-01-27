import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Accessibility by Default | Darian Rosebrook',
  description:
    'How tokens encode accessibility decisions—contrast ratios, reduced motion, minimum targets, focus indicators—so inclusivity is a default, not an afterthought.',
  openGraph: {
    title: 'Accessibility by Default | Darian Rosebrook',
    description:
      'How tokens encode accessibility decisions—contrast ratios, reduced motion, minimum targets, focus indicators—so inclusivity is a default, not an afterthought.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility by Default | Darian Rosebrook',
    description:
      'How tokens encode accessibility decisions—contrast ratios, reduced motion, minimum targets, focus indicators—so inclusivity is a default, not an afterthought.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function AccessibilityTokensPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Accessibility by Default</h1>

        <h2>Why Accessibility Belongs in Tokens</h2>
        <p>
          Accessibility is often treated as an afterthought&mdash;something to
          audit and fix before launch. But when accessibility decisions are
          encoded at the token level, they become defaults that every component
          inherits automatically. Teams don&apos;t have to remember to check
          contrast ratios or respect motion preferences; the system handles it.
        </p>

        <p>
          This isn&apos;t just about compliance. It&apos;s about building
          inclusive experiences from the foundation up. When a designer picks{' '}
          <code>semantic.color.foreground.primary</code>, they&apos;re not just
          getting a color&mdash;they&apos;re getting a color that&apos;s been
          vetted for contrast against its intended background.
        </p>

        <h2>Contrast-Aware Color Tokens</h2>
        <p>
          The most common accessibility failure is insufficient color contrast.
          WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text
          and 3:1 for large text. Our token system encodes these requirements
          directly into the semantic layer.
        </p>

        <h3>Foreground/Background Pairings</h3>
        <p>
          Semantic color tokens are designed as pairs. Each foreground token has
          a corresponding background it&apos;s designed to work with:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Foreground Token</th>
              <th>Designed For</th>
              <th>Min Contrast</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>foreground.primary</code>
              </td>
              <td>
                <code>background.primary</code>
              </td>
              <td>7:1 (AAA)</td>
            </tr>
            <tr>
              <td>
                <code>foreground.secondary</code>
              </td>
              <td>
                <code>background.primary</code>
              </td>
              <td>4.5:1 (AA)</td>
            </tr>
            <tr>
              <td>
                <code>foreground.tertiary</code>
              </td>
              <td>
                <code>background.primary</code>
              </td>
              <td>4.5:1 (AA)</td>
            </tr>
            <tr>
              <td>
                <code>foreground.inverse</code>
              </td>
              <td>
                <code>background.brand</code>
              </td>
              <td>4.5:1 (AA)</td>
            </tr>
            <tr>
              <td>
                <code>status.danger</code>
              </td>
              <td>
                <code>background.primary</code>
              </td>
              <td>4.5:1 (AA)</td>
            </tr>
          </tbody>
        </table>

        <h3>Mode-Aware Contrast</h3>
        <p>
          Light and dark modes require different color choices to maintain
          contrast. The <code>$extensions.design.paths</code> system handles
          this automatically:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "foreground": {
    "secondary": {
      "$type": "color",
      "$value": "{core.color.palette.neutral.600}",
      "$extensions": {
        "design.paths.light": "{core.color.palette.neutral.600}",
        "design.paths.dark": "{core.color.palette.neutral.300}"
      },
      "$description": "Secondary text - 4.5:1 contrast in both modes"
    }
  }
}`}</code>
        </pre>

        <p>
          In light mode, <code>neutral.600</code> (#555555) against white
          provides 7.5:1 contrast. In dark mode, <code>neutral.300</code>{' '}
          (#b0b0b0) against near-black provides 8.6:1 contrast. Both exceed the
          4.5:1 AA requirement.
        </p>

        <h3>Status Colors and Accessibility</h3>
        <p>
          Status colors (info, success, warning, danger) must be accessible
          while remaining visually distinct. This often means using darker
          shades than designers initially expect:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Vibrant but inaccessible
"status": {
  "success": { "$value": "#00ff00" }  // 1.4:1 contrast on white
}

// ✅ GOOD: Accessible and still recognizable
"status": {
  "success": { "$value": "{core.color.palette.green.700}" }  // 4.5:1 contrast
}`}</code>
        </pre>

        <h2>Motion and Animation Tokens</h2>
        <p>
          Some users experience vestibular disorders, motion sickness, or
          cognitive difficulties with animations. The{' '}
          <code>prefers-reduced-motion</code> media query lets users request
          minimal motion, and our tokens respect this preference.
        </p>

        <h3>Duration Tokens with Reduced Motion</h3>
        <p>
          Motion duration tokens include reduced-motion variants that
          dramatically shorten or eliminate animations:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "motion": {
    "duration": {
      "short": {
        "$type": "duration",
        "$value": "150ms",
        "$extensions": {
          "design.paths.default": "150ms",
          "design.paths.reduced": "0ms"
        },
        "$description": "Quick transitions, instant when reduced motion"
      },
      "medium": {
        "$type": "duration",
        "$value": "250ms",
        "$extensions": {
          "design.paths.default": "250ms",
          "design.paths.reduced": "50ms"
        },
        "$description": "Standard transitions, minimal when reduced motion"
      },
      "long": {
        "$type": "duration",
        "$value": "400ms",
        "$extensions": {
          "design.paths.default": "400ms",
          "design.paths.reduced": "100ms"
        },
        "$description": "Elaborate transitions, shortened when reduced motion"
      }
    }
  }
}`}</code>
        </pre>

        <h3>CSS Implementation</h3>
        <p>The generated CSS respects the user&apos;s motion preference:</p>

        <pre className={styles.codeBlock}>
          <code>{`/* Generated CSS */
:root {
  --motion-duration-short: 150ms;
  --motion-duration-medium: 250ms;
  --motion-duration-long: 400ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-short: 0ms;
    --motion-duration-medium: 50ms;
    --motion-duration-long: 100ms;
  }
}`}</code>
        </pre>

        <h3>Easing Tokens</h3>
        <p>
          Easing curves also adapt for reduced motion. Aggressive easings become
          linear to reduce perceived motion:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "easing": {
    "bounce": {
      "$type": "cubicBezier",
      "$value": [0.68, -0.55, 0.265, 1.55],
      "$extensions": {
        "design.paths.default": [0.68, -0.55, 0.265, 1.55],
        "design.paths.reduced": [0, 0, 1, 1]
      },
      "$description": "Bouncy easing, linear when reduced motion"
    }
  }
}`}</code>
        </pre>

        <h2>Minimum Target Sizes</h2>
        <p>
          WCAG 2.2 requires interactive targets to be at least 24x24 CSS pixels,
          with a recommendation of 44x44 for touch interfaces. Our spacing and
          dimension tokens encode these minimums.
        </p>

        <h3>Touch Target Tokens</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "interaction": {
    "target": {
      "minimum": {
        "$type": "dimension",
        "$value": "24px",
        "$description": "WCAG 2.2 minimum target size"
      },
      "comfortable": {
        "$type": "dimension",
        "$value": "44px",
        "$description": "Recommended touch target size"
      },
      "large": {
        "$type": "dimension",
        "$value": "48px",
        "$description": "Large touch target for primary actions"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Component Application</h3>
        <p>
          Components use these tokens to ensure interactive elements meet
          minimum size requirements:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Button component tokens
{
  "button": {
    "minHeight": {
      "$type": "dimension",
      "$value": "{semantic.interaction.target.comfortable}",
      "$description": "Ensures buttons meet touch target requirements"
    },
    "paddingY": {
      "$type": "dimension",
      "$value": "{core.spacing.size.03}",
      "$description": "Vertical padding contributing to target size"
    }
  }
}`}</code>
        </pre>

        <h2>Focus Indicators</h2>
        <p>
          Keyboard users rely on visible focus indicators to navigate
          interfaces. Our tokens define consistent, accessible focus styles that
          work across all components.
        </p>

        <h3>Focus Ring Tokens</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "focus": {
    "ring": {
      "width": {
        "$type": "dimension",
        "$value": "2px",
        "$description": "Focus ring thickness - visible at all sizes"
      },
      "offset": {
        "$type": "dimension",
        "$value": "2px",
        "$description": "Gap between element and focus ring"
      },
      "color": {
        "$type": "color",
        "$value": "{core.color.palette.blue.500}",
        "$extensions": {
          "design.paths.light": "{core.color.palette.blue.500}",
          "design.paths.dark": "{core.color.palette.blue.400}"
        },
        "$description": "Focus ring color - high contrast in both modes"
      }
    },
    "outline": {
      "style": {
        "$type": "string",
        "$value": "solid",
        "$description": "Focus outline style"
      }
    }
  }
}`}</code>
        </pre>

        <h3>CSS Focus Styles</h3>
        <p>
          The generated CSS creates consistent focus indicators across all
          interactive elements:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`/* Generated focus styles */
:focus-visible {
  outline: var(--focus-ring-width) var(--focus-outline-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* High contrast mode enhancement */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}`}</code>
        </pre>

        <h2>Typography and Readability</h2>
        <p>
          Readable text is accessible text. Our typography tokens encode
          line-height, letter-spacing, and size relationships that ensure
          comfortable reading.
        </p>

        <h3>Line Height for Readability</h3>
        <p>
          WCAG recommends line-height of at least 1.5 for body text. Our tokens
          enforce this:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "typography": {
    "lineHeight": {
      "tight": {
        "$type": "number",
        "$value": 1.25,
        "$description": "For headings only - not body text"
      },
      "normal": {
        "$type": "number",
        "$value": 1.5,
        "$description": "WCAG-compliant body text line height"
      },
      "relaxed": {
        "$type": "number",
        "$value": 1.75,
        "$description": "Enhanced readability for long-form content"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Minimum Font Sizes</h3>
        <p>
          While users can zoom, we set sensible minimums to ensure text is
          readable at default zoom:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "typography": {
    "size": {
      "minimum": {
        "$type": "dimension",
        "$value": "12px",
        "$description": "Absolute minimum - use sparingly (captions, labels)"
      },
      "body": {
        "$type": "dimension",
        "$value": "16px",
        "$description": "Default body text - comfortable reading size"
      },
      "large": {
        "$type": "dimension",
        "$value": "18px",
        "$description": "Large body text for enhanced readability"
      }
    }
  }
}`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Relying on Color Alone</h3>
        <p>
          Color should never be the only indicator of state or meaning. Always
          pair color with text, icons, or patterns.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Color-only error indication
.input--error {
  border-color: var(--status-danger);
}

// ✅ GOOD: Color + icon + text
.input--error {
  border-color: var(--status-danger);
}
.input__error-icon {
  /* Visible error icon */
}
.input__error-message {
  color: var(--status-danger);
  /* "This field is required" */
}`}</code>
        </pre>

        <h3>2. Disabling Focus Indicators</h3>
        <p>
          Never remove focus indicators without providing an alternative.
          It&apos;s tempting to hide the &ldquo;ugly&rdquo; focus ring, but this
          makes the interface unusable for keyboard users.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`/* ❌ BAD: Removing focus indicators */
:focus {
  outline: none;
}

/* ✅ GOOD: Custom focus indicator */
:focus {
  outline: none;
}
:focus-visible {
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}`}</code>
        </pre>

        <h3>3. Ignoring Reduced Motion</h3>
        <p>
          Animations that ignore <code>prefers-reduced-motion</code> can cause
          physical discomfort for some users. Always provide reduced-motion
          alternatives.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`/* ❌ BAD: Animation ignores preference */
.modal {
  animation: slideIn 300ms ease-out;
}

/* ✅ GOOD: Respects reduced motion */
.modal {
  animation: slideIn var(--motion-duration-medium) var(--motion-easing-standard);
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: fadeIn var(--motion-duration-short) linear;
  }
}`}</code>
        </pre>

        <h3>4. Assuming Contrast is Enough</h3>
        <p>
          Meeting contrast ratios is necessary but not sufficient. Text must
          also be appropriately sized, spaced, and styled for readability.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`/* ❌ BAD: Meets contrast but hard to read */
.caption {
  color: var(--foreground-secondary); /* 4.5:1 contrast */
  font-size: 10px;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

/* ✅ GOOD: Accessible and readable */
.caption {
  color: var(--foreground-secondary);
  font-size: var(--typography-size-minimum); /* 12px */
  line-height: var(--typography-lineHeight-normal); /* 1.5 */
  letter-spacing: var(--typography-letterSpacing-normal);
}`}</code>
        </pre>

        <h2>Testing Accessibility Tokens</h2>
        <p>
          Accessibility decisions encoded in tokens should be validated
          automatically:
        </p>

        <h3>Contrast Validation</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Token validation script
function validateContrast(foreground, background, minRatio = 4.5) {
  const ratio = calculateContrastRatio(foreground, background);
  if (ratio < minRatio) {
    throw new Error(
      \`Contrast ratio \${ratio.toFixed(2)}:1 is below minimum \${minRatio}:1\`
    );
  }
}

// Run during build
validateContrast(
  tokens.semantic.color.foreground.primary,
  tokens.semantic.color.background.primary,
  7 // AAA requirement
);`}</code>
        </pre>

        <h3>Target Size Validation</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Ensure interactive elements meet minimum size
function validateTargetSize(token, minSize = 24) {
  const value = parseFloat(token.$value);
  if (value < minSize) {
    throw new Error(
      \`Target size \${value}px is below WCAG minimum \${minSize}px\`
    );
  }
}`}</code>
        </pre>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Contrast-aware colors</strong> &mdash; Foreground/background
            pairings meet WCAG AA (4.5:1) or AAA (7:1) requirements
          </li>
          <li>
            <strong>Motion tokens</strong> &mdash; Duration and easing adapt for{' '}
            <code>prefers-reduced-motion</code>
          </li>
          <li>
            <strong>Target sizes</strong> &mdash; Interactive elements meet
            24x24px minimum, 44x44px recommended
          </li>
          <li>
            <strong>Focus indicators</strong> &mdash; Consistent, visible focus
            rings across all components
          </li>
          <li>
            <strong>Typography</strong> &mdash; Line-height, sizing, and spacing
            for comfortable reading
          </li>
          <li>
            <strong>Never rely on color alone</strong> &mdash; Always pair with
            text, icons, or patterns
          </li>
        </ul>

        <p>
          By encoding accessibility decisions at the token level, we shift from
          &ldquo;audit and fix&rdquo; to &ldquo;accessible by default.&rdquo;
          Teams can focus on building features, confident that the foundation
          supports all users.
        </p>

        <h2>Next Steps</h2>
        <p>
          Accessibility tokens work alongside the broader token architecture.
          Review the{' '}
          <Link href="/blueprints/foundations/tokens/core-vs-semantic">
            core vs semantic model
          </Link>{' '}
          to understand how these decisions are structured, and explore{' '}
          <Link href="/blueprints/foundations/tokens/theming">
            multi-brand theming
          </Link>{' '}
          to see how accessibility is maintained across different visual
          identities.
        </p>
      </article>

      <Link href="/blueprints/foundations/tokens">
        &larr; Back to Design Tokens
      </Link>
    </section>
  );
}
