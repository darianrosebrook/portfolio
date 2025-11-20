import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/theming page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Multi-Brand Theming | Darian Rosebrook',
  description:
    'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
  openGraph: {
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function ThemingPage() {
  return (
    <section className="content">
      <h1>Multi-Brand Theming</h1>

      <p>
        DTCG 1.0 structured tokens enable powerful multi-brand theming through
        semantic aliasing. Core tokens define brand-agnostic primitives, while
        semantic tokens create brand-specific aliases. This architecture
        supports unlimited brands while maintaining consistent structure and
        validation.
      </p>

      <h2>Brand-Agnostic Core Layer</h2>
      <p>
        The core layer contains structured primitives that rarely change across
        brands: color palettes, spacing scales, typography ramps, and motion
        durations. These use DTCG structured formats for type safety and
        platform flexibility.
      </p>

      <h3>Universal Color Palette</h3>
      <pre>
        <code>{`{
  "color": {
    "palette": {
      "neutral": {
        "50": {
          "$type": "color",
          "$value": {
            "colorSpace": "srgb",
            "components": [0.98, 0.98, 0.98]
          }
        },
        "900": {
          "$type": "color",
          "$value": {
            "colorSpace": "srgb",
            "components": [0.12, 0.12, 0.12]
          }
        }
      },
      "brand": {
        "primary": {
          "$type": "color",
          "$value": {
            "colorSpace": "srgb",
            "components": [0.2, 0.6, 1]
          }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h3>Structured Spacing Scale</h3>
      <pre>
        <code>{`{
  "spacing": {
    "size": {
      "02": {
        "$type": "dimension",
        "$value": { "value": 4, "unit": "px" }
      },
      "04": {
        "$type": "dimension",
        "$value": { "value": 16, "unit": "px" }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Brand-Specific Semantic Layer</h2>
      <p>
        Semantic tokens create brand identity by aliasing core primitives to
        meaningful roles. Each brand maintains its own semantic layer while
        sharing the same core foundation, enabling consistent structure across
        brands.
      </p>

      <h3>Brand A Semantic Colors</h3>
      <pre>
        <code>{`{
  "semantic": {
    "color": {
      "background": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.neutral.50}"
        }
      },
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.brand.primary}"
        }
      }
    }
  }
}`}</code>
      </pre>

      <h3>Brand B Semantic Colors</h3>
      <pre>
        <code>{`{
  "semantic": {
    "color": {
      "background": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.neutral.900}"
        }
      },
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.neutral.100}"
        }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Theme Variants with Extensions</h2>
      <p>
        The <code>$extensions.design.paths</code> property enables
        theme-specific overrides within the same semantic token, supporting
        light/dark modes and other variant dimensions.
      </p>

      <h3>Light/Dark Mode Support</h3>
      <pre>
        <code>{`{
  "semantic": {
    "color": {
      "background": {
        "secondary": {
          "$type": "color",
          "$value": "{color.palette.neutral.100}",
          "$extensions": {
            "design": {
              "paths": {
                "light": "{color.palette.neutral.100}",
                "dark": "{color.palette.neutral.800}"
              }
            }
          }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h3>Brand + Theme Combinations</h3>
      <p>
        Extensions can handle complex theming scenarios where brands have
        different theme requirements or variant dimensions.
      </p>

      <pre>
        <code>{`{
  "semantic": {
    "color": {
      "accent": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.brand.primary}",
          "$extensions": {
            "design": {
              "paths": {
                "brandA.light": "{color.palette.brand.primary}",
                "brandA.dark": "{color.palette.brand.primary.light}",
                "brandB.light": "{color.palette.accent.secondary}",
                "brandB.dark": "{color.palette.accent.secondary.light}"
              }
            }
          }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Platform-Specific Variants</h2>
      <p>
        DTCG structured tokens support platform-specific theming through
        different resolution strategies, enabling consistent semantics across
        iOS, Android, web, and desktop platforms.
      </p>

      <h3>Platform-Aware Spacing</h3>
      <pre>
        <code>{`{
  "semantic": {
    "spacing": {
      "component": {
        "small": {
          "$type": "dimension",
          "$value": { "value": 8, "unit": "px" },
          "$extensions": {
            "design": {
              "paths": {
                "mobile": { "value": 8, "unit": "px" },
                "tablet": { "value": 12, "unit": "px" },
                "desktop": { "value": 16, "unit": "px" }
              }
            }
          }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Resolver Module Integration</h2>
      <p>
        For complex multi-brand scenarios, our DTCG 1.0 Resolver Module enables
        context-aware token resolution with sets, modifiers, and resolution
        orders. This supports sophisticated theming requirements across brands,
        platforms, and themes.
      </p>

      <div className={styles.placeholder}>
        <p>
          See <code>ui/designTokens/resolver.example.json</code> for resolver
          document structure and{' '}
          <code>utils/designTokens/utils/resolver-module.ts</code> for
          implementation details.
        </p>
      </div>

      <h2>Build System Brand Switching</h2>
      <p>
        Our build pipeline supports brand switching through configuration,
        generating brand-specific CSS variables and TypeScript types on-demand.
      </p>

      <ul>
        <li>
          <strong>Global CSS</strong>: Brand-specific CSS custom properties
        </li>
        <li>
          <strong>Component SCSS</strong>: Scoped variables per component
        </li>
        <li>
          <strong>TypeScript</strong>: Type-safe token access with brand context
        </li>
        <li>
          <strong>Platform exports</strong>: Format-aware outputs for native
          platforms
        </li>
      </ul>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/resolver-module">
          Resolver Module →
        </Link>
      </p>
    </section>
  );
}
