'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { wrapWithGooeyHighlight } from '@/utils/gooeyHighlight';
import { AnimationErrorBoundary } from '@/components/ErrorBoundary';
import { useReducedMotion } from '@/context/ReducedMotionContext';

// Dynamically import GooeyHighlight for better performance
const GooeyHighlight = dynamic(() => import('@/components/GooeyHighlight'), {
  loading: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        color: 'var(--color-foreground-secondary)',
      }}
    >
      <div>Loading gooey highlight component...</div>
    </div>
  ),
  ssr: false, // GooeyHighlight uses CSS Custom Highlight API
});

/**
 * Demo page showcasing gooey text highlighting functionality
 */
export default function GooeyHighlightDemo() {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <div className="content">
      <h1>Gooey Text Highlighting Demo</h1>

      <section>
        <h2>Interactive Highlighting</h2>
        <p>
          This demo showcases the gooey highlighting effect using the CSS Custom
          Highlight API. Try selecting text or clicking on words to see the
          gooey effect in action. The text remains crisp while the background
          has the organic gooey effect.
        </p>

        <AnimationErrorBoundary
          animationName="GooeyHighlight"
          disableAnimations={prefersReducedMotion}
          fallbackContent={
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: '0.5rem',
                color: 'var(--color-foreground-primary)',
              }}
            >
              This is a demonstration of text highlighting. The gooey animation
              effect is disabled based on your motion preferences.
            </div>
          }
        >
          <GooeyHighlight>
            This is a demonstration of the gooey highlight effect. You can
            select any text in this paragraph and it will apply a beautiful
            gooey background with inverse border radius. The effect works
            particularly well with highlighted text that spans multiple lines or
            has complex shapes.
          </GooeyHighlight>
        </AnimationErrorBoundary>
      </section>

      <section>
        <h2>Manual Highlighting Examples</h2>
        <p>
          Here are some examples using mark elements with the gooey effect.
          Notice how the text remains crisp while the background has the organic
          gooey shape.
        </p>

        <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
          <p>
            This sentence contains <mark>highlighted text</mark> that
            demonstrates the gooey effect with inverse border radius. The{' '}
            <mark>gooey filter</mark> creates a beautiful organic shape around
            the highlighted content.
          </p>

          <p>
            You can also use the{' '}
            <span className="text-highlighted">
              <span>text-highlighted</span>
            </span>{' '}
            class to achieve the same effect programmatically. This approach
            works well for dynamic content that needs highlighting.
          </p>
        </div>
      </section>

      <section>
        <h2>Wrapped Text Highlighting</h2>
        <p>
          This approach uses wrapper elements to keep text crisp while applying
          the gooey effect to the background only.
        </p>

        <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
          <p>
            This text uses the wrapper approach:{' '}
            {wrapWithGooeyHighlight(
              'highlighted with gooey effect',
              'var(--color-core-green-200)',
              'var(--color-core-green-800)'
            )}{' '}
            to demonstrate how the text stays crisp while the background has the
            organic gooey shape.
          </p>
        </div>
      </section>

      <section>
        <h2>Selection Styling</h2>
        <p>
          Try selecting text in this paragraph to see the gooey selection
          styling. The ::selection pseudo-element is styled with the gooey
          filter to create a consistent experience across all text selections.
        </p>

        <div
          style={{
            fontSize: 'var(--text-lg)',
            lineHeight: 1.6,
            padding: 'var(--size-04)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-01)',
            background: 'var(--color-background-secondary)',
          }}
        >
          This is selectable text that will show the gooey highlighting effect
          when you click and drag to select it. The effect creates a beautiful
          organic shape that follows the text boundaries and creates an inverse
          border radius effect that&apos;s impossible to achieve with standard
          CSS.
        </div>
      </section>

      <section>
        <h2>Technical Details</h2>
        <div
          style={{
            background: 'var(--color-background-secondary)',
            padding: 'var(--size-04)',
            borderRadius: 'var(--radius-01)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <h3>How it works:</h3>
          <ul>
            <li>
              <strong>Pseudo-element Backgrounds:</strong> Uses ::before
              pseudo-elements to apply gooey filters to backgrounds only
            </li>
            <li>
              <strong>Crisp Text:</strong> Text content remains sharp while
              backgrounds get the organic gooey effect
            </li>
            <li>
              <strong>CSS Custom Highlight API:</strong> Uses the modern CSS
              Custom Highlight API for programmatic text highlighting
            </li>
            <li>
              <strong>Multiple Filters:</strong> Different blur levels for
              different use cases (goo-text, goo-text-subtle)
            </li>
            <li>
              <strong>Fallback Support:</strong> Graceful degradation for
              browsers that don&apos;t support the API
            </li>
            <li>
              <strong>Multiple Approaches:</strong> Works with ::selection, mark
              elements, and custom classes
            </li>
          </ul>

          <h3>Browser Support:</h3>
          <p>
            The CSS Custom Highlight API is currently supported in Chrome 105+
            and Edge 105+. For unsupported browsers, the component provides a
            fallback experience with standard highlighting.
          </p>
        </div>
      </section>

      <section>
        <h2>Usage Examples</h2>
        <div
          style={{
            display: 'grid',
            gap: 'var(--size-04)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >
          <div>
            <h4>Basic Usage</h4>
            <AnimationErrorBoundary
              animationName="GooeyHighlight Basic"
              disableAnimations={prefersReducedMotion}
            >
              <GooeyHighlight>
                Simple text highlighting with gooey effect.
              </GooeyHighlight>
            </AnimationErrorBoundary>
          </div>

          <div>
            <h4>Custom Colors</h4>
            <AnimationErrorBoundary
              animationName="GooeyHighlight Custom"
              disableAnimations={prefersReducedMotion}
            >
              <GooeyHighlight
                highlightColor="var(--color-core-green-200)"
                textColor="var(--color-core-green-800)"
              >
                Custom colored highlighting with green theme.
              </GooeyHighlight>
            </AnimationErrorBoundary>
          </div>

          <div>
            <h4>Non-Interactive</h4>
            <AnimationErrorBoundary
              animationName="GooeyHighlight Non-Interactive"
              disableAnimations={prefersReducedMotion}
            >
              <GooeyHighlight interactive={false}>
                This text cannot be highlighted interactively.
              </GooeyHighlight>
            </AnimationErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
}
