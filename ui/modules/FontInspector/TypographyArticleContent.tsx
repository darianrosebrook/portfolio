import styles from './FontInspector.module.scss';

export const TypographyArticleContent = (
  <article className={styles.articleContent}>
    <>
      <h2>Exploring the Anatomy of a Typeface</h2>
      <h2> Foundational Structure: Setting the Stage for Readability</h2>
      <p>
        Before diving into fine details, orient yourself with the big‑picture
        metrics that govern overall legibility, rhythm, and UI density.
      </p>
      <dl>
        <dt>
          <strong>X‑Height: The Core of Legibility</strong>
        </dt>

        <dd>
          The lowercase &ldquo;body&rdquo; height—letters like &ldquo;x,&rdquo;
          &ldquo;a,&rdquo; &ldquo;e.&rdquo;
          <strong>Why it matters:</strong> A generous x‑height boosts clarity at
          small sizes by enlarging the lowercase core.
          <strong>When to choose it:</strong> Dashboards, form labels, mobile
          captions.
          <em>Selection criterion:</em> Aim for fonts with an x‑height ratio
          around 0.50–0.55 of cap height for optimal UI legibility.
        </dd>

        <dt>
          <strong>Ascenders & Descenders: Rhythm and Density</strong>
        </dt>

        <dd>
          <em>Ascenders</em> rise above the x‑height (&ldquo;h,&rdquo;
          &ldquo;b&rdquo;), <em>descenders</em> fall below the baseline
          (&ldquo;p,&rdquo; &ldquo;g&rdquo;).
          <strong>Why it matters:</strong> They create vertical rhythm and
          spacing needs. Shorter spans allow tighter leading and denser layouts;
          longer spans feel airy and refined but demand more space.
          <strong>Design tip:</strong> For compact table rows or micro‑copy,
          pick a face with shorter descenders and set leading at least 120% of
          font‑size.
          <p>
            <strong>Token example:</strong>
            <code>--type-leading-tight: 1.2;</code>
          </p>
        </dd>

        <dt>
          <strong>Serif vs. Sans‑Serif: More Than Aesthetic</strong>
        </dt>

        <dd>
          <em>Serifs</em> carry small finishing strokes;
          <em>sans‑serifs</em> do not.
          <strong>Why it matters:</strong> Serifs can guide the eye in long‑form
          text (print or rich articles), while sans‑serifs often render more
          crisply on pixel grids.
          <strong>Design decision:</strong> Match brand voice (formal vs.
          minimal), reading context (articles vs. UI), and device constraints
          (low‑res screens favor simpler shapes).
          <p>
            <strong>Token examples:</strong>
            <br />

            <code>--type-family-body: &apos;Merriweather&apos;, serif;</code>
            <br />

            <code>--type-family-ui: &apos;Inter&apos;, sans-serif;</code>
          </p>
        </dd>
      </dl>
      <p>
        With the overall framework in place, let’s zoom into the
        <em>micro‑anatomy</em>—the details that give a typeface its voice and
        resolve technical challenges.
      </p>
      <h2>Micro‑Anatomy: The Details That Define Voice & Function</h2>
      <p>
        These smaller features can make or break readability, brand recognition,
        and rendering performance—especially under tight constraints.
      </p>
      <dl>
        <dt>
          <strong>Counters & Apertures: Breathing Room</strong>
        </dt>

        <dd>
          <em>Counters</em> are the enclosed spaces (“o,” “p”);
          <em>apertures</em> are the openings (&ldquo;c,&rdquo; &ldquo;e,&rdquo;
          &ldquo;s&rdquo;).
          <strong>Why it matters:</strong> Open counters and wide apertures
          prevent characters from visually “filling in” or blurring—avoiding
          &ldquo;c&rdquo;/&ldquo;e&rdquo; confusion with &ldquo;o&rdquo; at a
          distance or small size.
          <strong>Design tip:</strong> Inspect &ldquo;c/e,&rdquo;
          &ldquo;a/o,&rdquo; and &ldquo;s&rdquo; at your UI’s minimum font size.
          <em>Variable‑font note:</em> The <code>opsz</code> axis often tweaks
          these holistically—adjusting contrast, spacing, and detail together.
          <p>
            <strong>Token example:</strong>
            <code>--type-opsz-ui: 12;</code>
          </p>
        </dd>

        <dt>
          <strong>Stems & Stroke Contrast: Weight and Hierarchy</strong>
        </dt>

        <dd>
          The <em>stem</em> is a primary stroke; <em>stroke contrast</em>
          is the variation between thick and thin.
          <strong>Why it matters:</strong> Contrast shapes perceived
          &ldquo;color&rdquo; or texture on the page. High contrast
          (Didone‑style) feels elegant but thin strokes may become less than a
          pixel wide—leading to inconsistent rendering or disappearing details
          on low‑res screens.
          <strong>Design tip:</strong> For body text, favor moderate or low
          contrast; reserve high‑contrast faces for large headings.
          <em>Axis control:</em> Adjust via <code>wght</code> or, if available,
          a dedicated <code>CNTR</code> axis.
          <p>
            <strong>Token example:</strong>
            <code>--type-weight-body: 400;</code>
          </p>
        </dd>

        <dt>
          <strong>Terminals & Finials: The Typographic Fingerprint</strong>
        </dt>

        <dd>
          Non‑serif stroke endings—ball terminals, flares, shears—plus tails,
          ears, spurs, and beaks.
          <strong>Why it matters:</strong> These micro‑ornaments define
          personality (humanist vs. geometric) and affect hinting complexity.
          Consistency of terminal shapes across all weights/styles is a hallmark
          of a well‑crafted family.
          <strong>Design tip:</strong> Examine terminal shapes in italic/oblique
          styles and ensure they remain legible at small sizes.
          <em>Conceptual token:</em>
          <code>--type-terminal-style: &apos;bracketed&apos;;</code>
          (often inherent in your font‑family choice)
        </dd>
      </dl>
      <h2>Variable Fonts: Precision, Performance & Tokenization</h2>
      <p>
        Variable fonts let you pack every axis into one file—then expose them as
        design tokens for true system control.
      </p>
      <ul>
        <li>
          <strong>
            Weight (<code>wght</code>) & Width (<code>wdth</code>):
          </strong>
          Dial in exact hierarchy and responsive layouts without swapping files.
          <code style={{ display: 'block', margin: '0.5em 0' }}>
            {`font-variation-settings: 'wght' var(--component-test-type-wght-heading), 'wdth' var(--component-test-type-wdth-responsive);`}
          </code>
        </li>

        <li>
          <strong>
            Optical Size (<code>opsz</code>):
          </strong>
          Holistically auto‑tunes contrast, spacing, and detail for captions vs.
          hero banners—reducing manual overrides.
          <p>
            <strong>Token example:</strong>
            <code>--type-opsz-caption: 10;</code>
          </p>
        </li>

        <li>
          <strong>
            Slant (<code>slnt</code>) vs. Italic (<code>ital</code>):
          </strong>
          <code>slnt</code> shears the Roman form; <code>ital: 1</code>
          often swaps in true italic glyphs with distinct strokes and
          terminals—impacting rhythm and readability.
          <p>
            <strong>Token examples:</strong>
            <br />
            <code>--type-slnt-voice: 12;</code> <em>degree of shear</em>
            <br />
            <code>--type-ital-on: 1;</code>
            <em>activates true italic glyphs</em>
          </p>
        </li>

        <li>
          <strong>
            Grade (<code>GRAD</code>):
          </strong>
          Subtle weight shifts (e.g. for dark mode) without layout
          changes—perfect for dynamic UI states.
          <p>
            <strong>Token example:</strong>
            <code>--type-grad-darkmode: 10;</code>
          </p>
        </li>

        <li>
          <strong>Custom Axes:</strong>
          Fine‑tune serif thickness, terminal style, or contrast to match brand
          nuance.
        </li>
      </ul>
      <p>
        <strong>System integration:</strong> Publish each axis as a
        token—developers adjust typography via CSS vars or runtime props,
        keeping design and code in lockstep.
      </p>
      <h2>Creating a Practical Workflow for System Typography</h2>
      <ol>
        <li>
          <strong>Deep Context Mapping:</strong>
          Map every scenario—information density, reading distance,
          environmental factors (glare, motion), and accessibility needs.
        </li>

        <li>
          <strong>Specimen Builds with Real Content:</strong>
          Replace lorem ipsum with actual UI copy, edge cases, and localized
          strings. Test on target devices, browsers, themes, and network speeds.
        </li>

        <li>
          <strong>Critical Anatomy & Axis Review:</strong>

          <ul>
            <li>Check x‑height and apertures at smallest sizes.</li>

            <li>
              Verify contrast and stroke rendering on non‑Retina displays.
            </li>

            <li>
              Test key letter pairs for kerning issues (&ldquo;AV,&rdquo;
              &ldquo;To&rdquo;).
            </li>

            <li>Verify diacritic/accent placement and clarity.</li>

            <li>
              Probe each variable axis’s extremes for legibility and style
              integrity.
            </li>
          </ul>
        </li>

        <li>
          <strong>Accessibility & Performance Audits:</strong>
          Run WCAG/APCA contrast checks, user‑tests if possible, and performance
          audits (Lighthouse, WebPageTest). Subset or lazy‑load axes as needed.
        </li>

        <li>
          <strong>Tokenize, Document & Collaborate:</strong>
          Define tokens for families, sizes, leading, and every axis
          setting—using either semantic roles (<code>--type-weight-body</code>)
          or explicit values. Plan fallback strategies for variable‑font loading
          failures (e.g., default to <code>font-weight: 400</code> or a static
          font‑family). In your docs, include <em>why</em> each token exists and
          when to use it (e.g., &ldquo;Use Optical Size ≥14 for subhead
          labels&rdquo;). Sync tokens with your component library and Storybook
          specimens.
        </li>
      </ol>
      <h2>Mastering the Craft: Continuous Exploration</h2>
      <p>Typography runs deep. To keep growing, explore:</p>
      <ul>
        <li>
          Historical classification (Garalde ↔ Didone) for tonal pairings.
        </li>

        <li>Advanced hinting & anti‑aliasing across OS/browsers.</li>

        <li>Font loading strategies (FOIT/FOUT, preload, subsetting).</li>

        <li>Licensing nuances for variable vs. static families.</li>

        <li>
          Tools like <code>fontTools</code>, Axis‑Praxis, and Figma’s variable
          font plugin.
        </li>
      </ul>
      <p>
        Theory lays the groundwork, but nothing cements understanding like
        direct experimentation. Below, you’ll see in real‑time how tightening an
        aperture transforms legibility in a sans‑serif, or how dialing up
        optical size brings dramatic contrast and clarity to a headline. Toggle
        between serif, sans‑serif, and monospaced families; adjust stems,
        terminals, weight and width; even play with true italics versus sheared
        slants.
      </p>
      <p>
        As you explore, notice how small changes ripple through your design: a
        narrow aperture might trip up &ldquo;c/e&rdquo; recognition at 12px,
        while a higher x‑height can unlock surprising readability in micro‑copy.
        Export your favorite axis settings as tokens, preview them across
        light/dark modes and device resolutions, then save and share presets
        directly into your design system.
      </p>
      <p>
        Ready to turn theory into practice? Jump in, experiment boldly, and let
        every tweak inform your next typographic decision—because true mastery
        comes from seeing anatomy in action.
      </p>
    </>
  </article>
);
