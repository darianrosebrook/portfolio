import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/dtcg-formats page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
  description:
    'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
  openGraph: {
    title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
    description:
      'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
    description:
      'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function DTCGFormatsPage() {
  return (
    <section className="content">
      <h1>DTCG 1.0 Structured Formats</h1>

      <p>
        Our design tokens follow the{' '}
        <strong>
          W3C Design Tokens Community Group (DTCG) 1.0 specification
        </strong>
        , which mandates structured object formats instead of simple strings.
        This enables type safety, platform flexibility, and scalable theming
        while maintaining interoperability with DTCG-compliant tools.
      </p>

      <h2>Why Structured Values Matter</h2>
      <p>
        Traditional approaches store token values as strings like{' '}
        <code>"#ff0000"</code> or <code>"16px"</code>. DTCG 1.0 requires
        structured objects that explicitly declare their components, enabling:
      </p>
      <ul>
        <li>
          <strong>Validation</strong> against expected value structures
        </li>
        <li>
          <strong>Transform flexibility</strong> for different output formats
        </li>
        <li>
          <strong>Type safety</strong> through explicit property definitions
        </li>
        <li>
          <strong>Platform adaptability</strong> with format-aware processing
        </li>
      </ul>

      <h2>Color Values</h2>
      <p>
        Colors use structured objects with <code>colorSpace</code> and{' '}
        <code>components</code> arrays, supporting modern color spaces beyond
        just sRGB.
      </p>

      <h3>Basic sRGB Color</h3>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0.8, 0.2, 0.2]
  }
}`}</code>
      </pre>
      <p>
        This represents an sRGB color with 80% red, 20% green, and 20% blue
        components. The build system converts this to CSS formats like{' '}
        <code>rgb(204, 51, 51)</code> or <code>#cc3333</code>.
      </p>

      <h3>Color with Alpha</h3>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0, 0.5, 1, 0.8],
    "alpha": 0.8
  }
}`}</code>
      </pre>
      <p>
        Four-component arrays include alpha, or it can be specified separately
        as shown. This enables precise control over transparency in the color
        space.
      </p>

      <h3>Modern Color Spaces</h3>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "oklch",
    "components": [0.65, 0.25, 240]
  }
}`}</code>
      </pre>
      <p>
        DTCG supports advanced color spaces like OKLCH for better perceptual
        uniformity and broader color gamuts (Display P3, Rec.2020, etc.).
      </p>

      <h2>Dimension Values</h2>
      <p>
        Dimensions explicitly declare both numeric value and unit, limited to
        DTCG 1.0 standard units: <code>px</code> and <code>rem</code>.
      </p>

      <h3>Pixel Dimensions</h3>
      <pre>
        <code>{`{
  "$type": "dimension",
  "$value": {
    "value": 16,
    "unit": "px"
  }
}`}</code>
      </pre>

      <h3>Relative Dimensions</h3>
      <pre>
        <code>{`{
  "$type": "dimension",
  "$value": {
    "value": 1,
    "unit": "rem"
  }
}`}</code>
      </pre>
      <p>
        The build system generates appropriate CSS output (<code>16px</code>,{' '}
        <code>1rem</code>) while validation ensures only compliant units are
        used.
      </p>

      <h2>Composite Tokens</h2>
      <p>
        Complex tokens like typography and shadows reference structured
        primitives, creating type-safe relationships between token values.
      </p>

      <h3>Typography Composite</h3>
      <pre>
        <code>{`{
  "$type": "typography",
  "$value": {
    "fontFamily": "{typography.fontFamily.inter}",
    "fontSize": {
      "value": 16,
      "unit": "px"
    },
    "fontWeight": "{typography.weight.regular}",
    "lineHeight": 1.5,
    "letterSpacing": {
      "value": 0,
      "unit": "em"
    }
  }
}`}</code>
      </pre>
      <p>
        Typography tokens reference font family and weight tokens, use
        structured dimensions for sizing and spacing, and specify line height as
        a unitless number (multiplier).
      </p>

      <h3>Shadow Composite</h3>
      <pre>
        <code>{`{
  "$type": "shadow",
  "$value": {
    "offsetX": { "value": 0, "unit": "px" },
    "offsetY": { "value": 4, "unit": "px" },
    "blur": { "value": 8, "unit": "px" },
    "spread": { "value": 0, "unit": "px" },
    "color": {
      "colorSpace": "srgb",
      "components": [0, 0, 0, 0.1]
    }
  }
}`}</code>
      </pre>
      <p>
        Shadows use structured dimensions for all spatial properties and
        structured colors for the shadow color, enabling precise control and
        validation.
      </p>

      <h3>Border Composite</h3>
      <pre>
        <code>{`{
  "$type": "border",
  "$value": {
    "color": "{semantic.color.border.default}",
    "width": { "value": 1, "unit": "px" },
    "style": "solid"
  }
}`}</code>
      </pre>
      <p>
        Borders combine color references, structured dimensions, and standard
        CSS border styles for complete border definitions.
      </p>

      <h2>Token References</h2>
      <p>
        Tokens can reference other tokens using the{' '}
        <code>{'{token.path}'}</code> syntax, creating a graph of dependencies
        that the build system resolves.
      </p>

      <pre>
        <code>{`{
  "$type": "color",
  "$value": "{color.palette.primary.500}"
}`}</code>
      </pre>
      <p>
        References enable semantic aliasing where{' '}
        <code>semantic.color.background.primary</code>
        might reference <code>color.palette.neutral.50</code> for light themes
        and
        <code>color.palette.neutral.900</code> for dark themes.
      </p>

      <h2>Extensions for Advanced Features</h2>
      <p>
        The <code>$extensions</code> property provides additional metadata for
        advanced token behaviors like theming and conditional values.
      </p>

      <h3>Theme-Specific Overrides</h3>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": "{color.palette.neutral.600}",
  "$extensions": {
    "design": {
      "paths": {
        "light": "{color.palette.neutral.600}",
        "dark": "{color.palette.neutral.300}"
      }
    }
  }
}`}</code>
      </pre>
      <p>
        The <code>design.paths</code> extension enables theme-specific token
        resolution, allowing the same semantic token to reference different core
        values based on theme.
      </p>

      <h3>CSS Calculations</h3>
      <pre>
        <code>{`{
  "$type": "dimension",
  "$value": { "value": 16, "unit": "px" },
  "$extensions": {
    "design": {
      "calc": "calc({spacing.size.04} + 2px)"
    }
  }
}`}</code>
      </pre>
      <p>
        The <code>design.calc</code> extension enables CSS <code>calc()</code>{' '}
        expressions with token interpolation for complex dimensional
        relationships.
      </p>

      <h2>Build System Integration</h2>
      <p>
        Our build pipeline automatically converts DTCG structured values to
        appropriate output formats for different platforms and use cases.
      </p>

      <div className={styles.placeholder}>
        <p>
          <strong>Structured → CSS:</strong> Color objects become{' '}
          <code>rgb()</code> or <code>hex</code>
          <br />
          <strong>Structured → SCSS:</strong> Dimensions become{' '}
          <code>16px</code>, <code>1rem</code>
          <br />
          <strong>Structured → TypeScript:</strong> Type-safe value access with
          IntelliSense
          <br />
          <strong>Structured → Platform:</strong> Format-aware transforms for
          iOS, Android, etc.
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/core-vs-semantic">
          Core vs Semantic →
        </Link>
      </p>
    </section>
  );
}
