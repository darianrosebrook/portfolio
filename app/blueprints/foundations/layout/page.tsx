/**
 * Metadata for the /blueprints/foundations/layout page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Layout Foundations | Darian Rosebrook',
  description:
    'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
  openGraph: {
    title: 'Layout Foundations | Darian Rosebrook',
    description:
      'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Layout Foundations | Darian Rosebrook',
    description:
      'Master responsive design, grid systems, and container strategies for consistent, scalable layouts in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const LayoutPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Layout Foundations</h1>
      <p>
        Layout is the structural foundation of your interface, determining how
        content is organized and presented across different screen sizes. This
        section covers responsive design principles, grid systems, and container
        strategies that ensure consistent and usable layouts.
      </p>

      <h2>The Role of Layout in Design Systems</h2>
      <p>
        Layout provides the structural framework that organizes content and
        interactions:
      </p>
      <ul>
        <li>
          <strong>Structure:</strong> Defines how content is organized and
          hierarchically arranged
        </li>
        <li>
          <strong>Responsiveness:</strong> Adapts to different screen sizes and
          device capabilities
        </li>
        <li>
          <strong>Alignment:</strong> Ensures consistent visual alignment across
          components
        </li>
        <li>
          <strong>Flow:</strong> Guides users through content in a logical order
        </li>
        <li>
          <strong>Consistency:</strong> Creates predictable patterns that users
          can learn and rely on
        </li>
      </ul>

      <p>
        A well-designed layout system treats structure as a design constraint
        that enables rather than restricts creativity.
      </p>

      <h2>Responsive Design Principles</h2>

      <h3>Mobile-First Approach</h3>
      <p>
        Mobile-first design starts with the smallest screen size and
        progressively enhances for larger screens:
      </p>
      <ul>
        <li>
          <strong>Start small:</strong> Design for mobile constraints first
        </li>
        <li>
          <strong>Progressive enhancement:</strong> Add complexity and features
          as screen size increases
        </li>
        <li>
          <strong>Content priority:</strong> Focus on essential content and
          functionality on mobile
        </li>
        <li>
          <strong>Performance:</strong> Smaller screens often have slower
          connections—optimize accordingly
        </li>
      </ul>

      <h3>Content-Driven Breakpoints</h3>
      <p>
        Breakpoints should be determined by content needs, not arbitrary device
        sizes:
      </p>
      <ul>
        <li>
          <strong>Content breaks:</strong> Add breakpoints where content
          naturally needs to reflow
        </li>
        <li>
          <strong>Avoid device-specific:</strong> Don&apos;t target specific
          devices (e.g., &quot;iPhone 12&quot;)
        </li>
        <li>
          <strong>Test across devices:</strong> Verify layouts work across a
          range of screen sizes
        </li>
        <li>
          <strong>Use ranges:</strong> Consider min-width and max-width queries
          for precise control
        </li>
      </ul>

      <h2>Breakpoint System</h2>
      <p>
        Breakpoints define the screen widths at which layouts change. Our system
        uses semantic breakpoint names:
      </p>

      <pre>
        <code>{`{
  "core.dimension.breakpoint.sm": "640px",   // Small devices
  "core.dimension.breakpoint.md": "768px",  // Tablets
  "core.dimension.breakpoint.lg": "1024px", // Laptops
  "core.dimension.breakpoint.xl": "1280px", // Desktops
  "core.dimension.breakpoint.xxl": "1440px", // Large desktops
  "core.dimension.breakpoint.xxxl": "1920px" // Extra large screens
}`}</code>
      </pre>

      <h3>Breakpoint Usage</h3>
      <p>Use breakpoints consistently across the system:</p>
      <pre>
        <code>{`/* Mobile-first: styles apply from mobile up */
.component {
  padding: var(--semantic-spacing-padding-container-mobile);
  
  @media (min-width: 768px) {
    padding: var(--semantic-spacing-padding-container-tablet);
  }
  
  @media (min-width: 1024px) {
    padding: var(--semantic-spacing-padding-container-desktop);
  }
}`}</code>
      </pre>

      <h2>Container Sizes</h2>
      <p>
        Containers constrain content width for optimal readability and
        alignment. Container tokens define maximum widths:
      </p>

      <pre>
        <code>{`{
  "core.layout.container.sm": "640px",
  "core.layout.container.md": "768px",
  "core.layout.container.lg": "1024px",
  "core.layout.container.xl": "1280px",
  "core.layout.container.xxl": "1440px"
}`}</code>
      </pre>

      <h3>Container Patterns</h3>
      <p>Containers center content and provide consistent max-widths:</p>
      <pre>
        <code>{`.container {
  width: 100%;
  max-width: var(--core-layout-container-lg);
  margin-inline: auto;
  padding-inline: var(--semantic-spacing-padding-container);
}`}</code>
      </pre>

      <h3>Content Width Guidelines</h3>
      <p>Optimal reading width is 45–75 characters (approximately 60ch):</p>
      <ul>
        <li>
          <strong>Narrow content:</strong> 45ch for dense information or code
        </li>
        <li>
          <strong>Comfortable reading:</strong> 60ch for body text and articles
        </li>
        <li>
          <strong>Wide content:</strong> 75ch for display content or wide
          layouts
        </li>
      </ul>

      <h2>Grid Systems</h2>
      <p>
        Grid systems provide structure and alignment for layouts. Modern CSS
        Grid and Flexbox offer powerful layout capabilities:
      </p>

      <h3>CSS Grid</h3>
      <p>CSS Grid is ideal for two-dimensional layouts:</p>
      <pre>
        <code>{`.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--semantic-spacing-gap-grid);
}

.grid-item {
  grid-column: span 12; /* Full width on mobile */
  
  @media (min-width: 768px) {
    grid-column: span 6; /* Half width on tablet */
  }
  
  @media (min-width: 1024px) {
    grid-column: span 4; /* Third width on desktop */
  }
}`}</code>
      </pre>

      <h3>Flexbox</h3>
      <p>
        Flexbox is ideal for one-dimensional layouts and component internals:
      </p>
      <pre>
        <code>{`.flex-container {
  display: flex;
  flex-direction: column;
  gap: var(--semantic-spacing-gap-stack);
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: var(--semantic-spacing-gap-inline);
  }
}`}</code>
      </pre>

      <h3>12-Column Grid</h3>
      <p>
        The 12-column grid is widely used because 12 is divisible by 2, 3, 4,
        and 6, providing flexible layout options:
      </p>
      <ul>
        <li>1 column = 8.33% width</li>
        <li>2 columns = 16.66% width</li>
        <li>3 columns = 25% width</li>
        <li>4 columns = 33.33% width</li>
        <li>6 columns = 50% width</li>
        <li>12 columns = 100% width</li>
      </ul>

      <h2>Layout Patterns</h2>

      <h3>Single Column</h3>
      <p>Best for focused content, articles, and forms:</p>
      <pre>
        <code>{`.single-column {
  max-width: var(--core-content-max-width-prose);
  margin-inline: auto;
  padding-inline: var(--semantic-spacing-padding-container);
}`}</code>
      </pre>

      <h3>Two Column</h3>
      <p>
        Useful for content with sidebar navigation or complementary content:
      </p>
      <pre>
        <code>{`.two-column {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--semantic-spacing-gap-grid-large);
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 300px;
  }
}`}</code>
      </pre>

      <h3>Card Grid</h3>
      <p>Responsive grid of cards that adapts to screen size:</p>
      <pre>
        <code>{`.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--semantic-spacing-gap-grid-medium);
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}`}</code>
      </pre>

      <h3>Masonry Layout</h3>
      <p>
        For content of varying heights (consider using CSS Grid with
        auto-placement):
      </p>
      <pre>
        <code>{`.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--semantic-spacing-gap-grid);
  grid-auto-rows: 10px;
}`}</code>
      </pre>

      <h2>Fluid Typography and Spacing</h2>
      <p>Use fluid values that scale smoothly between breakpoints:</p>

      <h3>Fluid Typography</h3>
      <pre>
        <code>{`h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}`}</code>
      </pre>

      <h3>Fluid Spacing</h3>
      <pre>
        <code>{`.component {
  padding: clamp(16px, 4vw + 8px, 32px);
}`}</code>
      </pre>

      <h2>Accessibility Considerations</h2>

      <h3>Logical Content Order</h3>
      <p>Maintain consistent content order across breakpoints:</p>
      <ul>
        <li>
          <strong>Source order:</strong> HTML order should match visual order on
          mobile
        </li>
        <li>
          <strong>Screen readers:</strong> Content is read in source order,
          regardless of visual layout
        </li>
        <li>
          <strong>CSS reordering:</strong> Use CSS Grid or Flexbox order
          sparingly, and test with screen readers
        </li>
      </ul>

      <h3>Focus Management</h3>
      <p>Ensure keyboard navigation works across all layouts:</p>
      <ul>
        <li>Focus order should follow logical reading flow</li>
        <li>Skip links help users navigate past repeated navigation</li>
        <li>Modal dialogs should trap focus within the dialog</li>
        <li>Off-screen content should be hidden from focus order</li>
      </ul>

      <h3>Prevent Overflow</h3>
      <p>Prevent content from causing horizontal scrolling:</p>
      <ul>
        <li>
          Use <code>overflow-x: hidden</code> sparingly—prefer fixing root
          causes
        </li>
        <li>Ensure images and media are responsive</li>
        <li>Test with long words and URLs</li>
        <li>
          Use <code>word-break</code> or <code>overflow-wrap</code> for long
          strings
        </li>
      </ul>

      <h3>Viewport Considerations</h3>
      <p>Ensure layouts work across different viewport sizes:</p>
      <ul>
        <li>
          Test on very small screens (320px+) and very large screens (2560px+)
        </li>
        <li>Consider landscape orientation on mobile devices</li>
        <li>
          Account for browser chrome and UI elements that reduce available space
        </li>
        <li>Test with browser zoom up to 200%</li>
      </ul>

      <h2>Layout Token Naming</h2>
      <p>Consistent naming makes layout tokens discoverable:</p>

      <pre>
        <code>{`{layer}.layout.{category}.{size}

Examples:
- core.layout.container.lg
- core.dimension.breakpoint.md
- semantic.layout.max-width.content`}</code>
      </pre>

      <h2>Implementation Patterns</h2>

      <h3>Container Component</h3>
      <pre>
        <code>{`.container {
  width: 100%;
  max-width: var(--core-layout-container-lg);
  margin-inline: auto;
  padding-inline: var(--semantic-spacing-padding-container);
}`}</code>
      </pre>

      <h3>Responsive Grid</h3>
      <pre>
        <code>{`.responsive-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns-mobile), 1fr);
  gap: var(--semantic-spacing-gap-grid);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(var(--grid-columns-tablet), 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(var(--grid-columns-desktop), 1fr);
  }
}`}</code>
      </pre>

      <h3>Sticky Header</h3>
      <pre>
        <code>{`.sticky-header {
  position: sticky;
  top: 0;
  z-index: var(--core-layer-dropdown);
  background-color: var(--semantic-color-background-primary);
}`}</code>
      </pre>

      <h2>Common Layout Mistakes</h2>
      <ul>
        <li>
          <strong>Too many breakpoints:</strong> Adding breakpoints for every
          possible screen size creates maintenance burden
        </li>
        <li>
          <strong>Arbitrary breakpoints:</strong> Using device-specific sizes
          instead of content-driven breakpoints
        </li>
        <li>
          <strong>Fixed widths:</strong> Using fixed pixel widths instead of
          fluid or container-based widths
        </li>
        <li>
          <strong>Horizontal overflow:</strong> Not preventing content from
          causing horizontal scrolling
        </li>
        <li>
          <strong>Source order issues:</strong> Visual reordering that breaks
          logical reading order
        </li>
        <li>
          <strong>Missing containers:</strong> Content stretching full-width on
          large screens, reducing readability
        </li>
      </ul>

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Start mobile-first:</strong> Design for smallest screens first
        </li>
        <li>
          <strong>Use semantic tokens:</strong> Reference layout tokens, not
          hardcoded values
        </li>
        <li>
          <strong>Test across devices:</strong> Verify layouts work across a
          range of screen sizes
        </li>
        <li>
          <strong>Maintain source order:</strong> Keep HTML order logical for
          screen readers
        </li>
        <li>
          <strong>Use modern CSS:</strong> Leverage CSS Grid and Flexbox for
          flexible layouts
        </li>
        <li>
          <strong>Consider content:</strong> Let content needs drive breakpoint
          decisions
        </li>
        <li>
          <strong>Plan for growth:</strong> Design layouts that can accommodate
          varying content lengths
        </li>
        <li>
          <strong>Test accessibility:</strong> Verify keyboard navigation and
          screen reader compatibility
        </li>
      </ul>

      <h2>Related Foundations</h2>
      <p>Layout intersects with other foundations:</p>
      <ul>
        <li>
          <strong>Grid Systems:</strong> Deep dive into column structures and
          responsive grids
        </li>
        <li>
          <strong>Spacing:</strong> Layout relies on spacing tokens for gaps and
          padding
        </li>
        <li>
          <strong>Typography:</strong> Content width and line length affect
          readability
        </li>
        <li>
          <strong>Components:</strong> Components need consistent layout
          patterns
        </li>
      </ul>
    </section>
  );
};

export default LayoutPage;
