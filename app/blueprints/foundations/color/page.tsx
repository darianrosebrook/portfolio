/**
 * Foundation: Color
 * How a tokenized color system turns brand, hierarchy, contrast, and theming
 * into a single source of truth shared by design and code.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Color Foundations',
  description:
    'Build a color system that survives theming, rebranding, and accessibility audits: core palettes, semantic roles, WCAG contrast as a computed property, and mode-aware tokens that ship to CSS cascade layers.',
  slug: 'color',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/color',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'color tokens, contrast, WCAG, dark mode, theming, design systems',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['typography', 'spacing'],
    assessment_required: false,
    estimated_reading_time: 20,
  },
  governance: {
    canonical_version: 'System v1',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Design Systems', 'Color Theory', 'Accessibility'],
    profileUrl: 'https://darianrosebrook.com',
    imageUrl: 'https://darianrosebrook.com/darianrosebrook.jpg',
  },
};

const sections: FoundationSection[] = [
  {
    type: 'meta-header',
    id: 'meta-header',
    order: 1,
    content: null,
  },
  {
    type: 'alignment-notice',
    id: 'alignment-notice',
    order: 2,
    content: null,
  },
  {
    type: 'why-matters',
    id: 'why-matters',
    title: 'Why This Matters',
    order: 3,
    content: (
      <>
        <p>
          Color is the foundation most likely to be treated as decoration, and
          the one where that mistake is most expensive. Every hardcoded hex
          value in a component is a decision that must be re-made by hand for
          dark mode, for each brand, and for every future accessibility audit. A
          tokenized color system converts those one-off decisions into a small
          set of named, versioned contracts.
        </p>
        <p>
          Done well, the color layer is what makes everything else cheap:
          theming becomes data instead of a rewrite, contrast becomes a computed
          property you can validate in CI rather than a claim you re-verify by
          eye, and a brand change becomes a mapping change instead of a
          find-and-replace across the codebase.
        </p>
        <p>
          This page walks through the color system as it is actually built in
          this repository—core palettes, semantic roles, component-level tokens,
          and the generated CSS that ties them together—so the concepts stay
          attached to working code you can inspect.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Three Layers of a Color System',
    order: 4,
    content: (
      <>
        <p>
          A production color system is not one palette. It is three layers, each
          with a different job and a different rate of change:
        </p>
        <ul>
          <li>
            <strong>Core primitives</strong> — the raw material: ramped
            palettes, mode constants, and data-visualization scales. Values live
            here; meaning does not.
          </li>
          <li>
            <strong>Semantic roles</strong> — intent-bearing aliases like{' '}
            <code>foreground.primary</code> and{' '}
            <code>action.background.primary</code>. This is where meaning lives,
            and the only layer product code should reference.
          </li>
          <li>
            <strong>Component tokens</strong> — scoped consumption contracts
            like <code>--ds-card-color-background-default</code> that give each
            component a narrow, stable interface to the layers below.
          </li>
        </ul>

        <h3>Primitives: Ramps, Not Swatches</h3>
        <p>
          The core layer in <code>ui/designTokens/core/color.tokens.json</code>{' '}
          defines nine ramped families—<code>brand.primary</code>,{' '}
          <code>neutral</code>, <code>red</code>, <code>orange</code>,{' '}
          <code>yellow</code>, <code>green</code>, <code>blue</code>,{' '}
          <code>teal</code>, and <code>violet</code>—each in eight steps from{' '}
          <code>100</code> (lightest) to <code>800</code> (darkest). A ramp is a
          calibrated ladder, not a pile of favorite swatches: the point of steps
          is that <code>500</code> and <code>600</code> relate to each other the
          same way in every family, so a hover state can be expressed as
          &quot;one step darker&quot; as a system rule.
        </p>
        <p>
          Two things about this file surprise people coming from tool-palette
          exports. First, values are stored in the W3C Design Tokens (DTCG)
          format with structured color values, not hex strings:
        </p>
        <pre>
          <code>{`// ui/designTokens/core/color.tokens.json (excerpt)
"blue": {
  "600": {
    "$value": {
      "colorSpace": "srgb",
      "components": [0.0, 0.2588, 0.8627]
    },
    "$description": "Level 600 of the blue color scale.",
    "$type": "color"
  }
}`}</code>
        </pre>
        <p>
          Hex is an output encoding, produced during generation—the same source
          can emit SCSS, CSS custom properties, or type definitions without a
          second source of truth. Second, the families overlap on purpose:{' '}
          <code>blue</code> mirrors <code>brand.primary</code>. The brand ramp
          is what semantics reference; the named hue ramps exist so semantic
          decisions can be described and swapped in human terms (&quot;make the
          accent teal&quot;) without touching consumers.
        </p>
        <p>
          The ramps are not curated swatches; they are <em>generated</em>, and
          the generation is the most important provenance fact in the color
          system. Each ramp is produced with the Adaptive-DS-Colors generator:
          the first step is keyed at <strong>1.15:1</strong> contrast against
          the background, steps are interpolated{' '}
          <strong>uniformly in luminance</strong> up to a bounded top end near
          18:1, and the same per-level contrast targets apply to every family.
          Verify it against the shipped hexes: neutral and blue land within
          ±0.07 of each other at every level—1.15, 1.57, 2.22, 3.23, 4.88, 7.46,
          11.4, 16.1:1 against white.
        </p>
        <p>
          Read that progression as a ladder of thresholds, because the anchors
          put each level next to a job: <code>400</code> (≈3.2:1) brackets the
          WCAG UI-graphics floor, <code>500</code> (≈4.9:1) sits just above the
          4.5:1 body-text floor, <code>600</code> (≈7.5:1) clears AAA.
          &quot;Which step for text?&quot; is therefore not a taste question—the
          ramp answers it. What remains chosen is the family hue, the step
          count, and the anchors themselves; everything between them is derived,
          which is why a brand ramp can be regenerated under new anchors without
          re-curating eight colors by hand.
        </p>
        <p>
          Alongside the ramps sit two smaller groups. <code>color.mode</code>{' '}
          holds the constants every theme needs—<code>black</code>,{' '}
          <code>white</code>, <code>light</code> (<code>#fafafa</code>),{' '}
          <code>dark</code> (<code>#141414</code>), <code>transparent</code>.
          And <code>color.datavis</code> ships perceptually uniform colormap
          ramps—<code>viridis</code>, <code>magma</code>, <code>plasma</code>,{' '}
          <code>inferno</code>, <code>cividis</code>—plus categorical and
          divergent scales, because charts have different constraints than UI
          chrome: magnitude must map to perceived magnitude, not to raw channel
          values.
        </p>

        <h3>Semantic Roles: Name the Job, Not the Hue</h3>
        <p>
          The semantic layer in{' '}
          <code>ui/designTokens/semantic/color.tokens.json</code> contains no
          new colors. Every entry is a reference into the core layer, grouped by
          the job the color does: <code>foreground</code>,{' '}
          <code>background</code>, <code>border</code>, <code>action</code>,{' '}
          <code>feedback</code>, <code>status</code>, <code>syntax</code>,{' '}
          <code>data</code>, <code>navigation</code>, <code>gradient</code>,{' '}
          <code>overlay</code>, and <code>selection</code>. The naming rule is
          the contract: <strong>role, then property, then state</strong>.{' '}
          <code>action.background.primary.hover</code> reads as a sentence;
          <code>blue-600</code> does not.
        </p>
        <p>Here is the primary text color as it is actually defined:</p>
        <pre>
          <code>{`// ui/designTokens/semantic/color.tokens.json (excerpt)
"foreground": {
  "primary": {
    "$type": "color",
    "$value": "{color.mode.dark}",
    "$extensions": {
      "design.paths.light": "{color.mode.dark}",
      "design.paths.dark":  "{color.mode.light}"
    },
    "$description": "Primary foreground color"
  }
}`}</code>
        </pre>
        <p>
          Read the inversion carefully, because it is the whole trick:{' '}
          <em>light mode uses the constant named dark</em>, and vice versa. The
          base <code>$value</code> says what this token is; the{' '}
          <code>design.paths</code> extensions say which core reference resolves
          in each mode. Text stays near-black on light surfaces and near-white
          on dark surfaces without the consumer knowing anything about modes.
          Action states work the same way by walking a ramp:
        </p>
        <pre>
          <code>{`// Semantic action tokens ride the brand ramp
"action": {
  "background": {
    "primary": {
      "default": { "$value": "{color.palette.brand.primary.500}" },
      "hover":   { "$value": "{color.palette.brand.primary.600}" },
      "active":  { "$value": "{color.palette.brand.primary.700}" },
      "disabled": {
        "$value": "{color.palette.neutral.200}",
        "$extensions": {
          "design.paths.light": "{color.palette.neutral.200}",
          "design.paths.dark":  "{color.palette.neutral.700}"
        }
      }
    }
  }
}`}</code>
        </pre>
        <p>
          In the default brand, <code>brand.primary</code> resolves to the red
          family, so the emitted default for{' '}
          <code>--semantic-color-action-background-primary-default</code> is{' '}
          <code>#d9292b</code> (red.500), hover is <code>#ae0001</code>
          (red.600), active is <code>#7b0000</code> (red.700). The semantic
          layer never names a hue—it names a position on a ramp, and the brand
          layer decides which ramp that is.
        </p>

        <h3>Component Tokens: The Consumption Contract</h3>
        <p>
          The third layer lives next to each component:{' '}
          <code>ui/components/Card/Card.tokens.css</code> and its siblings. Each
          file is scoped with <code>[data-ds-component=&quot;Card&quot;]</code>{' '}
          and prefixed <code>--ds-card-*</code>, and each variable resolves a
          semantic token with a literal fallback:
        </p>
        <pre>
          <code>{`/* ui/components/Card/Card.tokens.css (excerpt) */
[data-ds-component='Card'] {
  --ds-card-color-background-default:
    var(--semantic-color-background-primary, #ffffff);
  --ds-card-size-radius-medium:
    var(--semantic-shape-card-radius, 16px);
}`}</code>
        </pre>
        <p>
          The fallback is a resilience contract, not decoration: components stay
          renderable even if the global token stylesheet fails to load, and the
          fallback value makes the component&apos;s assumption about the
          semantic layer observable at runtime. Component styles may only
          reference these scoped variables—reaching past them to{' '}
          <code>--semantic-*</code> or <code>--core-*</code> directly is the
          boundary the linters (<code>npm run tokens:lint</code>) exist to
          catch.
        </p>

        <h3>Contrast Is a Computed Property</h3>
        <p>
          Contrast is where color systems earn their keep, because contrast
          between two colors is a function, not an opinion. WCAG 2.1 defines it
          from relative luminance: <code>(L1 + 0.05) / (L2 + 0.05)</code>. The
          thresholds this system validates against live in{' '}
          <code>utils/accessibility/tokenValidator.ts</code>:
        </p>
        <ul>
          <li>
            <strong>AA normal text:</strong> 4.5:1 — the floor for body copy
          </li>
          <li>
            <strong>AA large text and UI:</strong> 3.0:1 — headings, icons,
            borders that must be seen
          </li>
          <li>
            <strong>AAA normal text:</strong> 7.0:1 — long-form reading
          </li>
          <li>
            <strong>AAA large text:</strong> 4.5:1
          </li>
        </ul>
        <p>
          Applying the formula to the semantic pairs this system actually ships
          (rounded to one decimal):
        </p>
        <ul>
          <li>
            <code>foreground.primary</code> on <code>background.primary</code>:
            ≈18.4:1 in light ( <code>#141414</code> on <code>#ffffff</code>),
            ≈20.1:1 in dark (<code>#fafafa</code> on <code>#000000</code>) —
            clears every threshold with room to spare.
          </li>
          <li>
            <code>foreground.secondary</code> on <code>background.primary</code>
            : ≈7.5:1 light ( <code>#555555</code>), ≈9.5:1 dark (
            <code>#aeaeae</code>) — AAA, because secondary does not mean barely
            legible.
          </li>
          <li>
            The accent as text (<code>red.500</code> light, <code>red.400</code>{' '}
            dark) on primary backgrounds: ≈4.9:1 and ≈6.5:1 — passes AA, fails
            AAA. Accent-colored body text is therefore a deliberate, bounded
            choice, not a default.
          </li>
        </ul>
        <p>
          Notice what that last bullet implies: the same accent that is{' '}
          <em>fine</em> for a large call-to-action label is not acceptable for a
          paragraph. Systems encode this by pairing roles—if you want red prose,
          you need a <code>foreground.action</code> role whose ramp position was
          chosen for text, not a borrowed button background.
        </p>
        <p>
          One honest note on where the industry is heading: APCA (Accessible
          Perceptual Contrast Algorithm) models perceptual contrast better than
          WCAG 2.1&apos;s relative luminance, especially for dark surfaces. This
          repository&apos;s validators compute WCAG 2.1 ratios; treat APCA as
          the direction the math is moving, not something this system currently
          enforces.
        </p>

        <h3>Modes and Brands Are Data, Not Forks</h3>
        <p>
          Everything above—the <code>design.paths</code> extensions, the ramp
          references—exists so that themes can be data. The build composes the
          token JSON into <code>app/designTokens.scss</code> with an explicit
          layer order:
        </p>
        <pre>
          <code>{`/* app/designTokens.scss — generated, do not edit */
@layer core, semantic, theme, brand, density;

@layer core {
  :root {
    --core-color-mode-black: #000000;
    --core-color-mode-white: #ffffff;
    --core-color-mode-light: #fafafa;
    --core-color-mode-dark: #141414;
    --core-color-palette-brand-primary-500: #0a65fe;
    /* ...316 core custom properties... */
  }
}`}</code>
        </pre>
        <p>
          The <code>theme</code> layer emits <code>.light</code> and{' '}
          <code>.dark</code> class scopes plus an{' '}
          <code>@media (prefers-color-scheme: dark)</code> block, so a page can
          follow the system setting or be pinned explicitly. The{' '}
          <code>brand</code> layer emits <code>[data-brand]</code> scopes—ten of
          them ship today (canary, corporate, default, forest, midnight,
          monochrome, ocean, rose, slate, sunset). A brand file is tiny because
          it only decides three things: its name, which family{' '}
          <code>brand.primary</code> points at, and a density. Ocean is{' '}
          <code>{`{ name: "ocean", accent: "teal", density: "spacious" }`}</code>
          —its accent resolves to <code>teal.500</code> in light and{' '}
          <code>teal.400</code> in dark. Midnight swaps in violet with a tight
          density. No component file changes; the cascade does the work.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Color Decisions Land',
    order: 5,
    content: (
      <>
        <p>
          The three layers only stay healthy if each discipline makes decisions
          in its own layer and hands the next layer a contract:
        </p>

        <h3>Design Impact</h3>
        <p>
          Designers own the ramps and the semantic intent. The ramp is where
          craft lives: even spacing in perceptual (not channel) space, a{' '}
          <code>500</code> that passes AA on white across families, a{' '}
          <code>600</code> that is one honest step darker. The semantic layer is
          where judgment lives: is this border decorative or structural? Should
          this state be <code>feedback.warning</code> or{' '}
          <code>status.caution</code>? In Figma, the same structure appears as
          variable collections with modes—collections mirror core ramps, modes
          mirror light/dark—so the file a designer paints with is
          shape-compatible with the JSON the build consumes.
        </p>

        <h3>Engineering Impact</h3>
        <p>
          Engineers own the pipeline: DTCG sources compose into semantic and
          brand layers, generate the cascade-layered stylesheet, and ship typed
          outputs. The rule that keeps the system refactorable: product code
          touches only scoped component tokens. When a component reads{' '}
          <code>var(--ds-card-color-background-default)</code>, the card does
          not know what theme is active, and theme work never requires touching
          the card.
        </p>

        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the pass/fail lines and gets automation for them:{' '}
          <code>validateColorPair</code> in{' '}
          <code>utils/accessibility/tokenValidator.ts</code> computes real
          ratios against the WCAG thresholds, so &quot;this pair passes AA
          normal&quot; is a checkable claim, not a vibe. The accessibility
          posture of the whole system reduces to one rule: pair roles, not
          colors—if a foreground role exists, its backgrounds are enumerated,
          and the validator walks those pairs.
        </p>

        <h3>Governance Impact</h3>
        <p>
          Governance owns the rate of change. Core ramps change rarely and carry
          visual review; semantic roles change more often and carry intent
          review; component tokens change freely within their scope. The linters
          make the boundary observable:{' '}
          <code>scripts/check-token-references.mjs</code> flags references that
          skip layers, and <code>scripts/check-kebab-token-vars.mjs</code> keeps
          naming mechanical. A color system without those tripwires regresses to
          swatches by attrition.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: null,
    designContent: (
      <>
        <p>
          On the design side, the token system shows up as structure you can
          paint with. A Figma library that mirrors the three layers has:
        </p>
        <ul>
          <li>
            <strong>One variable collection per core ramp</strong> — nine
            collections of eight steps each, named to match the token paths (
            <code>brand.primary/100…800</code>), so a designer saying{' '}
            &quot;600&quot; and a token file saying{' '}
            <code>brand.primary.600</code> are the same statement.
          </li>
          <li>
            <strong>Modes, not duplicates</strong> — semantic colors are Figma
            variables with light and dark <em>modes</em> bound to the ramp
            steps, exactly like <code>design.paths.light</code> and{' '}
            <code>design.paths.dark</code>. Switching the file to dark mode must
            never be a re-paint.
          </li>
          <li>
            <strong>Intent names in styles</strong> — component styles reference
            semantic variables (&quot;background/primary&quot;), so a file audit
            can spot off-system color instantly: any raw swatch in a layer is a
            defect by definition.
          </li>
        </ul>
        <p>
          The contrast tooling lives here too. Plugins that compute WCAG ratios
          against the thresholds (AA 4.5:1, large 3.0:1) let designers check
          pairs like <code>foreground.secondary</code> on{' '}
          <code>background.primary</code> (≈7.5:1 light) while choosing colors,
          not after. The numbers designers see in the tool are the same numbers{' '}
          <code>tokenValidator.ts</code> enforces in CI, because both implement
          the same formula on the same source values.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          On the code side, the same decisions travel a deterministic pipeline.
          Sources are DTCG JSON; the build composes core, semantic, and brand
          layers; generation emits CSS custom properties with mechanical names.
        </p>
        <p>The naming transform is worth internalizing:</p>
        <pre>
          <code>{`// utils/designTokens/generators/generateCSSTokens.mjs (behavior)
// 1. Namespace by path: color.(mode|palette|datavis) → "core."
//    everything else                      → "semantic."
// 2. Dots → hyphens, camelCase → kebab-case
// 3. Emit as CSS custom properties

color.palette.blue.600        → --core-color-palette-blue-600:     #0042dc
color.foreground.primary      → --semantic-color-foreground-primary
motion.duration.extraLong1    → --core-motion-duration-extra-long1: 1500ms
effect.backdropBlur.sm        → --core-effect-backdrop-blur-sm:     4px`}</code>
        </pre>
        <p>
          Consumers should recognize every variable&apos;s layer instantly from
          its prefix, and the kebab rule means a token&apos;s JSON path and its
          CSS name are never a mystery to each other. The composed output then
          lands in cascade layers with an explicit precedence:
        </p>
        <pre>
          <code>{`/* Order defines precedence: later layers win */
@layer core, semantic, theme, brand, density;

@layer semantic {
  :root {
    --semantic-color-foreground-primary: var(--core-color-mode-dark);
    --semantic-color-action-background-primary-default:
      var(--core-color-palette-brand-primary-500);
  }
}

@layer theme {
  .dark {
    --semantic-color-foreground-primary: var(--core-color-mode-light);
  }
  @media (prefers-color-scheme: dark) {
    :root { --semantic-color-foreground-primary: var(--core-color-mode-light); }
  }
}`}</code>
        </pre>
        <p>
          Layer order is the whole theming architecture in one line:{' '}
          <code>core</code> can never override <code>semantic</code>, themes
          override semantics, brands override themes, and density sits on top.
          Because precedence is declared rather than emergent from selector
          specificity, adding the ocean brand or a dark mode is additive—you
          emit another scoped block, you never edit existing rules or bump
          specificity in components.
        </p>
        <p>
          Finally, components consume through their scoped contract with a
          literal fallback, which doubles as a runtime observability point:
        </p>
        <pre>
          <code>{`/* A component style never reaches past its own scope */
[data-ds-component='Card'] {
  --ds-card-color-background-default:
    var(--semantic-color-background-primary, #ffffff);
}

.card {
  background: var(--ds-card-color-background-default);
  /* If the global sheet fails, the card still renders; if you inspect
     and see #ffffff instead of a var(), you know the sheet is missing. */
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Shipping a Warning Border Pair',
    order: 7,
    content: (
      <>
        <p>
          Let&apos;s ship one real decision end to end: teams need a warning
          border for destructive-adjacent form states, and the current{' '}
          <code>feedback.border.warning</code> resolves to <code>#824500</code>{' '}
          in light mode. Walk the full path—ramp, alias, generation, validation,
          consumption—because every color decision in this system is these five
          steps.
        </p>

        <h3>Step 1: Check the ramp before touching it</h3>
        <p>
          The need is &quot;a warning border that reads on both light and dark
          surfaces.&quot; Orange is the conventional warning hue, and the core
          orange ramp already has eight calibrated steps. Resist adding a new
          color: if the ramp lacks a usable step, the fix is usually re-spacing
          the ramp, not bolting on an outlier that will haunt every future
          &quot;one step lighter&quot; rule.
        </p>

        <h3>Step 2: Alias with both paths</h3>
        <p>
          The semantic entry references positions, and declares how it resolves
          per mode:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/color.tokens.json
"feedback": {
  "border": {
    "warning": {
      "$type": "color",
      "$value": "{color.palette.orange.700}",
      "$extensions": {
        "design.paths.light": "{color.palette.orange.700}",
        "design.paths.dark":  "{color.palette.orange.300}"
      },
      "$description": "Border for warning states; AA against both surfaces"
    }
  }
}`}</code>
        </pre>
        <p>
          The dark path jumps four steps, not one—on near-black surfaces a{' '}
          <code>700</code>-step orange disappears. Mode pairs are chosen for
          contrast parity, not for symmetry, and that asymmetry is exactly the
          knowledge the token now carries forever.
        </p>

        <h3>Step 3: Generate and read the diff</h3>
        <pre>
          <code>{`npm run tokens:build

/* app/designTokens.scss (generated diff) */
 @layer semantic {
   :root {
+    --semantic-color-feedback-border-warning: #a86a00;
   }
 }
 @layer theme {
   .dark {
+    --semantic-color-feedback-border-warning: #ffc458;
   }
 }`}</code>
        </pre>
        <p>
          The build is the only writer of this file. Reviewing generated output
          is not busywork—it is where a wrong reference (say, aliasing{' '}
          <code>orange.100</code> by typo) becomes visible as a value that could
          never pass contrast.
        </p>

        <h3>Step 4: Validate contrast in CI</h3>
        <p>
          The claim &quot;AA against both surfaces&quot; is checkable with the
          repo&apos;s own validator vocabulary:
        </p>
        <pre>
          <code>{`// utils/accessibility/tokenValidator.ts (excerpt)
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
};

// contrastRatioHex(fg, bg) → (L1 + 0.05) / (L2 + 0.05)
// A border is UI: it must clear AA_LARGE (3.0:1) against
// background.primary in BOTH modes — light #ffffff and dark #000000.`}</code>
        </pre>
        <p>
          A three-to-one bar sounds low until you check both modes: a border
          that clears 3:1 on white can fail on black. That is the recurring
          lesson of token-level accessibility—every pair is a per-mode claim.
        </p>

        <h3>Step 5: Consume through the component contract</h3>
        <pre>
          <code>{`/* ui/components/TextField/TextField.tokens.css */
[data-ds-component='TextField'] {
  --ds-text-field-border-warning:
    var(--semantic-color-feedback-border-warning, #824500);
}

/* The component knows a warning border exists; nothing else. */
.textFieldWarning {
  border-color: var(--ds-text-field-border-warning);
}`}</code>
        </pre>
        <p>
          Notice what never happened: nobody wrote a hex in a component, nobody
          branched on dark mode in a component, and when the brand switches to
          ocean—teal accent—the warning border stays orange, because{' '}
          <code>feedback</code> semantics reference the orange ramp, not the
          brand ramp. Five steps, and the decision is now durable infrastructure
          instead of a style line.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Trade-offs',
    order: 8,
    content: (
      <>
        <p>
          Every choice below was made to keep the system cheap to change in the
          directions it actually changes. Naming the tradeoff is the point—if
          you cannot say what a rule costs, you cannot tell when the rule is
          wrong.
        </p>
        <ul>
          <li>
            <strong>Ramp width (8 steps):</strong> wide enough that states can
            be &quot;one step away,&quot; narrow enough that choosing is still a
            decision. More steps would push selection cost onto every usage;
            fewer would force semantic roles to share steps, which is how two
            intents end up visually identical.
          </li>
          <li>
            <strong>Semantic granularity:</strong> a role per intent (
            <code>feedback.warning</code> vs <code>status.caution</code>) makes
            theming precise but multiplies the matrix that must be validated.
            The working rule: split roles when the intents theme differently or
            fail differently; merge them when they do not.
          </li>
          <li>
            <strong>Two themes, enforced:</strong> shipping exactly light and
            dark keeps every pair checkable in CI. A third high-contrast theme
            is additive (one more paths layer) but grows every pair&apos;s
            validation from two claims to three—budget for the audit, not just
            the values.
          </li>
          <li>
            <strong>Perceptual ramps vs brand fidelity:</strong> the ramps are
            contrast-anchored derivations, not hand-picked colors, but a brand
            guideline can still mandate a specific flagship hex. The escape
            hatch honors both: pin <code>brand.primary.500</code> to the
            brand&apos;s value and re-derive the neighbors with the generator
            under the same anchors—never a hex in a component.
          </li>
          <li>
            <strong>Fallbacks in component tokens:</strong> the literal in{' '}
            <code>var(--semantic-…, #ffffff)</code> buys resilience when the
            global sheet fails and costs drift risk—the literal can silently age
            away from the token. Treat fallback updates as part of the token
            change, checked in the same review.
          </li>
          <li>
            <strong>sRGB as the working space:</strong> stored components are
            srgb because every target (CSS, Figma) consumes it without
            conversion. Wide-gamut display targets would add a color-space
            decision at generation time—the DTCG structure already supports it;
            nothing in the semantic layer would change.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'color-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <p>
          These are the failure modes that recur in every color system&apos;s
          first two years, each with the repair that fits this architecture:
        </p>

        <h3>1. Hex values in component styles</h3>
        <pre>
          <code>{`// Bad: The component now owns a theming decision
.card { border-color: #824500; }

// Good: The component owns an interface; the system owns the value
.card { border-color: var(--ds-card-border-warning, #824500); }`}</code>
        </pre>
        <p>
          One hex looks harmless; the tenth makes dark mode a re-audit of the
          codebase. The linter exists because review cannot catch these reliably
          at scale.
        </p>

        <h3>2. Validating only the light theme</h3>
        <pre>
          <code>{`// Bad: A pair checked once, shipped twice
validateColorPair(fg.secondary, bg.primary);        // light: 7.5:1 ✓

// Good: Every pair is a per-mode claim
validateColorPair(fg.secondary, bg.primary, 'light'); // 7.5:1 ✓
validateColorPair(fg.secondary, bg.primary, 'dark');  // 9.5:1 ✓`}</code>
        </pre>
        <p>
          Dark mode failures cluster exactly where light mode is strongest:
          mid-ramp colors that pass easily on white and vanish on black.
        </p>

        <h3>3. Components reaching past their contract</h3>
        <pre>
          <code>{`// Bad: The card is now coupled to global structure
.card { background: var(--semantic-color-background-primary); }

// Good: Scoped indirection keeps the system refactorable
.card { background: var(--ds-card-color-background-default); }`}</code>
        </pre>
        <p>
          The scoped variable is two lines of insurance: it is the only thing
          that lets semantic tokens be renamed or re-layered without a
          component-by-component hunt.
        </p>

        <h3>4. Borrowing a background ramp for text</h3>
        <pre>
          <code>{`// Bad: red.500 passes AA on white (≈4.9:1) — as a BUTTON fill —
//    and fails as body text the day someone reads a paragraph
.bodyAccent { color: var(--core-color-palette-red-500); }

// Good: Text needs a ramp position chosen for text
.bodyAccent { color: var(--semantic-color-foreground-action); }`}</code>
        </pre>
        <p>
          The numbers make it concrete: the accent clears 4.5:1 on white but not
          7:1, and dips further on tinted surfaces. Roles exist so the system,
          not each author, remembers which threshold applies.
        </p>

        <h3>5. Alpha layered on tokens</h3>
        <pre>
          <code>{`// Bad — Opacity over a resolved color: contrast is now
//    a function of whatever happens to be underneath
.scrim {
  background: var(--semantic-color-overlay-scrim);
  opacity: 0.5;
}

// Good: Bake alpha where it can be tracked — the core layer has
//    explicit alpha-carrying colors (color.mode.transparent,
//    color.opacity.50) so the composited value is the token`}</code>
        </pre>
        <p>
          Once alpha composites at usage time, the same token renders
          differently over every surface and no validator can speak to the
          result. Alpha is a value decision; make it in the value layer.
        </p>

        <h3>6. Treating the generated file as editable</h3>
        <pre>
          <code>{`/* Bad: app/designTokens.scss says AUTO-GENERATED for a reason:
   a hand edit is a change with no source, no diff review,
   and no survival of the next build */`}</code>
        </pre>
        <p>
          The generated stylesheet is an artifact with a source of truth
          upstream. If something is wrong in the output, the fix lands in the
          JSON or the generator—anything else is shadow state.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'color-health-metrics',
    title: 'Color System Health Metrics',
    order: 8.75,
    content: (
      <>
        <p>
          A color system&apos;s health is measurable, and the measurements are
          cheap enough to run continuously. Three signals cover most of the
          risk:
        </p>

        <h3>Signal 1: Contrast debt</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every declared semantic pair validates
            against its target level in every shipped mode; validator output is
            empty and stays empty in CI.
          </li>
          <li>
            <strong>Warning:</strong> pairs pass AA but sit between 4.5:1 and
            7:1 where a guideline (or a customer contract) expects AAA—the
            accent-as-text case is the canonical example, fine until someone
            sets long-form copy in it.
          </li>
          <li>
            <strong>Critical:</strong> any pair below 4.5:1 for body text or 3:1
            for UI in any mode. This is a shipping defect, not technical
            debt—the fix outranks feature work.
          </li>
        </ul>

        <h3>Signal 2: Off-system color</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> zero raw hex or rgb literals in component
            styles; <code>tokens:lint</code> and a grep for hex patterns in{' '}
            <code>ui/components/**/*.css</code> both come back clean.
          </li>
          <li>
            <strong>Warning:</strong> literals appear only inside component
            token <em>fallbacks</em>, where they are tracked drift risk, not
            decisions.
          </li>
          <li>
            <strong>Critical:</strong> literals in component rules or inline
            styles—the migration has stalled, and every new screen adds to the
            re-audit surface.
          </li>
        </ul>

        <h3>Signal 3: Theme parity</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every semantic token resolves in every
            shipped mode and brand; a missing <code>paths.dark</code> entry
            fails the schema and validators at build time, not in a screenshot
            review.
          </li>
          <li>
            <strong>Warning:</strong> parity exists but is manual—brands were
            checked when added and not since; the next brand is where this
            becomes critical.
          </li>
          <li>
            <strong>Critical:</strong> a mode or brand where tokens fall back to
            light values—users see it as &quot;the dark theme is broken,&quot;
            and it is usually one missing <code>design.paths</code> extension
            away.
          </li>
        </ul>
        <p>
          The pattern across all three: healthy is when the claims are
          machine-checkable and checked. The moment a color claim can only be
          verified by opening a file and squinting, the system has started
          becoming a palette.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'color-migration',
    title: 'Migration Strategy: From Hard-Coded Hex to Tokens',
    order: 8.9,
    content: (
      <>
        <p>
          Legacy surfaces are mostly hex soup, and the migration that works is
          mechanical, staged, and boring on purpose:
        </p>
        <ol>
          <li>
            <strong>Inventory before editing.</strong> Extract every literal
            (hex, rgb, named colors) from component styles with their file and
            line. The list is the project plan; dedupe it and most systems
            discover they use far fewer distinct colors than anyone feared.
          </li>
          <li>
            <strong>Map each literal to ramp position.</strong> For each
            distinct color, decide: which family, which step, which semantic
            role should own it? Colors with no defensible role are the
            migration&apos;s actual payoff—delete or absorb them now.
          </li>
          <li>
            <strong>Add missing semantic tokens first.</strong> Land every new
            alias and its <code>paths</code> extensions in the token sources and
            rebuild, so the generated sheet carries the full target vocabulary
            before any component changes.
          </li>
          <li>
            <strong>Migrate by component, highest-traffic first.</strong> Swap
            literals for scoped component tokens one component at a time; each
            component merge is independently revertible, and visual diffs stay
            reviewable.
          </li>
          <li>
            <strong>Turn the linters on as you go.</strong> Enable the
            layer-boundary and naming checks per directory as it migrates, so
            regression is blocked where cleanup has happened rather than where
            it has not.
          </li>
        </ol>
        <p>A codemod sketch for the mechanical core of step 4:</p>
        <pre>
          <code>{`// Map of literal → scoped component token, built in step 2
const literalToToken = {
  '#824500': '--ds-text-field-border-warning',
  '#d9292b': '--ds-action-background-primary-default',
  // ...
};

// Mechanical pass: replace literals that have a mapping,
// and ONLY literals that have a mapping
for (const file of componentCssFiles) {
  let css = read(file);
  for (const [literal, token] of Object.entries(literalToToken)) {
    css = css.replaceAll(literal, \`var(\${token}, \${literal})\`);
  }
  write(file, css);
  // Unmapped literals are left in place — they are step 2's
  // remaining work, not noise to silence mechanically.
}`}</code>
        </pre>
        <p>
          Note the shape of the replacement: the literal survives as the
          fallback, so behavior cannot change in the same commit that structure
          does. Boring, staged, revertible—that is the whole strategy.
        </p>
      </>
    ),
  },
  {
    type: 'verification-checklist',
    id: 'verification-checklist',
    title: 'Verification Checklist',
    order: 9,
    content: null,
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9.5,
    content: (
      <>
        <p>Where to go next, inside and outside this system:</p>
        <ul>
          <li>
            <strong>Design Tokens</strong> — the token architecture this
            page&apos;s color layer sits inside: formats, resolution, and
            validation (<code>/blueprints/foundations/tokens</code>).
          </li>
          <li>
            <strong>Core vs Semantic layers</strong> — a worked deep-dive on the
            layer boundary this page applies to color (
            <code>/blueprints/foundations/tokens/core-vs-semantic</code>).
          </li>
          <li>
            <strong>WCAG 2.1 contrast requirements</strong> — the normative
            definitions behind the 4.5:1 / 3:1 / 7:1 thresholds (
            <code>
              https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
            </code>
            ).
          </li>
          <li>
            <strong>DTCG design tokens format</strong> — the W3C community group
            format the token sources follow (
            <code>https://tr.designtokens.org/format/</code>).
          </li>
          <li>
            <strong>Adaptive-DS-Colors</strong> — the generator behind the
            ramps: contrast-keyed at 1.15:1, uniformly distributed in luminance,
            shared per-level targets across families.
          </li>
          <li>
            <strong>The sources themselves</strong> —{' '}
            <code>ui/designTokens/core/color.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/color.tokens.json</code>, and the
            generated <code>app/designTokens.scss</code> are the runnable truth
            of everything above.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'cross-references',
    id: 'cross-references',
    title: 'Related Concepts',
    order: 10,
    content: null,
  },
  {
    type: 'assessment-prompt',
    id: 'assessment-prompt',
    title: 'Reflection Questions',
    order: 11,
    content: null,
  },
];

const content = createFoundationContent(pageMetadata, sections);

content.verificationChecklist = [
  {
    id: 'token-resolved',
    label: 'Every color in the product resolves to a token',
    description:
      'No raw literals in component rules; fallbacks only in scoped token contracts',
    required: true,
  },
  {
    id: 'contrast-per-mode',
    label: 'Text pairs meet WCAG AA in every shipped mode',
    description: '4.5:1 normal text, 3:1 large text and UI, per mode',
    required: true,
  },
  {
    id: 'semantic-only',
    label: 'Components reference only their scoped component tokens',
    description: 'No --semantic-* or --core-* reach-ins from product code',
    required: true,
  },
  {
    id: 'theme-parity',
    label: 'Light and dark themes are validated, not assumed',
    description: 'Every semantic pair is checked in both modes',
    required: false,
  },
  {
    id: 'brand-swap',
    label: 'A brand accent swap requires zero component edits',
    description: 'Accent changes land in brand data and the cascade',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Your team wants a "celebration" color for success banners. Walk through the five steps of shipping it: which ramp, which semantic group, what the paths extensions declare, what the validator must check, and how a banner component consumes it.',
    type: 'application',
  },
  {
    question:
      'A designer argues for hardcoding the flagship brand hex in the hero component because "the ramp is close enough." What does the system lose, and which escape hatch preserves both the brand value and the architecture?',
    type: 'reflection',
  },
  {
    question:
      'The accent passes 4.9:1 on white but a review wants accent-colored body text. What threshold applies, what is the risk, and what does a system-correct resolution look like?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description:
        'The token architecture that carries these color layers: formats, resolution, validation',
      type: 'foundation',
    },
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description:
        'The systems-thinking frame that treats color as infrastructure, not decoration',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description:
        'Why scoped component tokens are the boundary that keeps theming out of components',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['10', '22', '18', '02', '01'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ColorPage() {
  return <FoundationPage content={content} />;
}
