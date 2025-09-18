/**
 * Examples of improved Details component usage
 * Demonstrating composition over boolean prop explosion
 */

import React from 'react';
import Details from './Details';

export function DetailsExamples() {
  return (
    <div className="examples">
      <h2>Before: Boolean Prop Explosion</h2>
      <pre>{`
// ❌ Old approach - 6 boolean props
<Details 
  summary="Old API"
  inline={true}
  showIcon={false}
  multipleOpen={true}
  defaultOpen={false}
  disabled={false}
  iconPosition="right"
>
  Content here
</Details>
      `}</pre>

      <h2>After: Composition Pattern</h2>

      <h3>1. Data Attributes Replace Boolean Props</h3>
      <Details summary="Standard Details" variant="default" icon="left">
        <p>
          Uses data attributes for styling: data-variant, data-icon, data-state
        </p>
      </Details>

      <h3>2. Composition Components</h3>
      <Details summary="Inline variant">
        <span>Specialized component instead of inline prop</span>
      </Details>

      <Details summary="Compact variant">
        <p>Pre-configured for common patterns</p>
      </Details>

      <h3>3. Group Coordination</h3>
      <div>
        <Details summary="Section 1">
          <p>Each Details manages its own state</p>
        </Details>
        <Details summary="Section 2">
          <p>Simple and predictable behavior</p>
        </Details>
        <Details summary="Section 3">
          <p>No complex group coordination needed</p>
        </Details>
      </div>

      <h3>4. API Comparison</h3>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
      >
        <div>
          <h4>❌ Before (6 boolean props)</h4>
          <ul>
            <li>
              <code>inline?: boolean</code>
            </li>
            <li>
              <code>multipleOpen?: boolean</code>
            </li>
            <li>
              <code>defaultOpen?: boolean</code>
            </li>
            <li>
              <code>showIcon?: boolean</code>
            </li>
            <li>
              <code>disabled?: boolean</code>
            </li>
            <li>
              <code>iconPosition: 'left' | 'right'</code>
            </li>
          </ul>
        </div>
        <div>
          <h4>✅ After (Cleaner API)</h4>
          <ul>
            <li>
              <code>variant: 'default' | 'inline' | 'compact'</code>
            </li>
            <li>
              <code>icon: 'left' | 'right' | 'none'</code>
            </li>
            <li>
              <code>disabled?: boolean</code> (essential only)
            </li>
            <li>
              <code>&lt;DetailsGroup allowMultiple /&gt;</code>
            </li>
            <li>Data attributes for styling</li>
            <li>Composition components for variants</li>
          </ul>
        </div>
      </div>

      <h3>5. Styling Benefits</h3>
      <pre>{`
/* ❌ Before: Class-based boolean props */
.details.inline { /* styles */ }
.details.disabled { /* styles */ }
.details.showIcon { /* styles */ }

/* ✅ After: Data attribute styling */
.details[data-variant="inline"] { /* styles */ }
.details[data-disabled="true"] { /* styles */ }
.details[data-icon="none"] .icon { display: none; }
      `}</pre>
    </div>
  );
}

export default DetailsExamples;
