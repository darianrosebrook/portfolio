/**
 * UX Pattern: Selection & Actions Patterns
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Selection & Actions Patterns',
  description:
    'Selection patterns help users interact with content through actions like selecting, editing, and performing operations. Learn patterns for bulk actions, single-item interactions, and contextual menus.',
  slug: 'selection',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/selection',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'selection, bulk actions, checkboxes, radio buttons, contextual menus, UX patterns',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['accessibility', 'tokens'],
    next_units: [],
    assessment_required: false,
    estimated_reading_time: 16,
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
    expertise: ['Selection Patterns', 'Bulk Actions', 'UX', 'Accessibility'],
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
    title: 'Why Selection Patterns Matter',
    order: 3,
    content: (
      <>
        <p>
          Selection patterns help users interact with content through actions
          like selecting, editing, and performing operations. When properly
          implemented, selection patterns enable efficient bulk operations and
          contextual actions. When poorly implemented, selection patterns create
          confusion and frustration.
        </p>
        <p>Selection patterns serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Bulk Operations:</strong> Selection patterns enable users to
            perform actions on multiple items
          </li>
          <li>
            <strong>Contextual Actions:</strong> Selection patterns provide
            context-aware actions based on selected items
          </li>
          <li>
            <strong>Single Selection:</strong> Radio buttons enable single
            choice selection
          </li>
          <li>
            <strong>Multiple Selection:</strong> Checkboxes enable multiple
            choice selection
          </li>
          <li>
            <strong>Accessibility:</strong> Proper selection patterns enable
            keyboard and screen reader interaction
          </li>
        </ul>
        <p>
          Well-designed selection patterns balance user needs with system
          requirements, creating interfaces that are both functional and
          accessible.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts',
    order: 4,
    content: (
      <>
        <h3>Selection Types</h3>
        <p>Different selection types serve different purposes:</p>
        <ul>
          <li>
            <strong>Single selection:</strong> Radio buttons for mutually
            exclusive choices
          </li>
          <li>
            <strong>Multiple selection:</strong> Checkboxes for independent
            choices
          </li>
          <li>
            <strong>Bulk selection:</strong> Select all for lists and tables
          </li>
          <li>
            <strong>Contextual selection:</strong> Right-click menus for
            context-aware actions
          </li>
        </ul>
        <pre>
          <code>{`// Single selection (radio buttons)
<fieldset>
  <legend>Choose a plan</legend>
  <Radio value="basic" label="Basic Plan" />
  <Radio value="pro" label="Pro Plan" />
  <Radio value="enterprise" label="Enterprise Plan" />
</fieldset>

// Multiple selection (checkboxes)
<fieldset>
  <legend>Select features</legend>
  <Checkbox value="feature1" label="Feature 1" />
  <Checkbox value="feature2" label="Feature 2" />
  <Checkbox value="feature3" label="Feature 3" />
</fieldset>

// Bulk selection
<Checkbox
  checked={allSelected}
  onChange={handleSelectAll}
  label="Select all"
/>`}</code>
        </pre>

        <h3>ARIA Selection</h3>
        <p>
          ARIA attributes communicate selection state to assistive technologies:
        </p>
        <ul>
          <li>
            <strong>aria-checked:</strong> Indicates checked state for
            checkboxes and radio buttons
          </li>
          <li>
            <strong>aria-selected:</strong> Indicates selected state for list
            items
          </li>
          <li>
            <strong>aria-multiselectable:</strong> Indicates multiple selection
            capability
          </li>
          <li>
            <strong>role="menuitemcheckbox":</strong> For checkbox menu items
          </li>
        </ul>
        <pre>
          <code>{`// Accessible checkbox
<input
  type="checkbox"
  id="feature1"
  aria-checked={checked}
  aria-describedby="feature1-desc"
/>
<label htmlFor="feature1">Feature 1</label>
<div id="feature1-desc">Enable advanced features</div>

// Accessible radio button
<input
  type="radio"
  id="plan1"
  name="plan"
  aria-checked={selected === 'plan1'}
/>
<label htmlFor="plan1">Basic Plan</label>

// Accessible list selection
<ul role="listbox" aria-multiselectable="true">
  <li
    role="option"
    aria-selected={selected.includes('item1')}
  >
    Item 1
  </li>
</ul>`}</code>
        </pre>

        <h3>Bulk Actions</h3>
        <p>Bulk actions enable operations on multiple selected items:</p>
        <ul>
          <li>
            <strong>Select all:</strong> Select or deselect all items at once
          </li>
          <li>
            <strong>Selection count:</strong> Show number of selected items
          </li>
          <li>
            <strong>Action toolbar:</strong> Show actions when items selected
          </li>
          <li>
            <strong>Clear selection:</strong> Easy way to deselect all items
          </li>
        </ul>
        <pre>
          <code>{`// Bulk selection pattern
const [selectedItems, setSelectedItems] = useState([]);
const allSelected = selectedItems.length === items.length;

function handleSelectAll() {
  if (allSelected) {
    setSelectedItems([]);
  } else {
    setSelectedItems(items.map(item => item.id));
  }
}

function handleItemSelect(itemId) {
  setSelectedItems(prev =>
    prev.includes(itemId)
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
  );
}

return (
  <div>
    <div className="selection-toolbar">
      <Checkbox
        checked={allSelected}
        onChange={handleSelectAll}
        aria-label="Select all items"
      />
      <span aria-live="polite">
        {selectedItems.length} selected
      </span>
      {selectedItems.length > 0 && (
        <button onClick={handleBulkDelete}>
          Delete Selected
        </button>
      )}
    </div>
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onChange={() => handleItemSelect(item.id)}
            aria-label={\`Select \${item.name}\`}
          />
          {item.name}
        </li>
      ))}
    </ul>
  </div>
);`}</code>
        </pre>

        <h3>Contextual Menus</h3>
        <p>Contextual menus provide context-aware actions:</p>
        <ul>
          <li>
            <strong>Right-click:</strong> Trigger menu on right-click
          </li>
          <li>
            <strong>Keyboard shortcut:</strong> Provide keyboard alternative
            (Menu key)
          </li>
          <li>
            <strong>Menu positioning:</strong> Position menu near cursor or
            selection
          </li>
          <li>
            <strong>Menu dismissal:</strong> Close on selection or click outside
          </li>
        </ul>
        <pre>
          <code>{`// Contextual menu
function ContextMenu({ items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
      e.preventDefault();
      handleContextMenu(e);
    }
  };

  return (
    <div onContextMenu={handleContextMenu} onKeyDown={handleKeyDown}>
      <div>Right-click for menu</div>
      {isOpen && (
        <Menu
          position={position}
          items={items}
          onSelect={onSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Selection Feedback</h3>
        <p>Selection feedback helps users understand selection state:</p>
        <ul>
          <li>
            <strong>Visual indicators:</strong> Highlight selected items
          </li>
          <li>
            <strong>Selection count:</strong> Show number of selected items
          </li>
          <li>
            <strong>Action availability:</strong> Show available actions for
            selected items
          </li>
          <li>
            <strong>Keyboard shortcuts:</strong> Provide shortcuts for common
            actions
          </li>
        </ul>
        <pre>
          <code>{`// Selection feedback
function SelectionFeedback({ selectedCount, totalCount }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {selectedCount === 0 ? (
        <span>No items selected</span>
      ) : (
        <span>
          {selectedCount} of {totalCount} items selected
        </span>
      )}
    </div>
  );
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Selection Patterns Shape System Success',
    order: 5,
    content: (
      <>
        <h3>User Experience Impact</h3>
        <p>Selection patterns improve user experience:</p>
        <ul>
          <li>
            <strong>Efficiency:</strong> Bulk actions enable efficient
            operations on multiple items
          </li>
          <li>
            <strong>Contextual actions:</strong> Contextual menus provide
            relevant actions
          </li>
          <li>
            <strong>Clear feedback:</strong> Selection feedback helps users
            understand state
          </li>
        </ul>
        <p>
          Effective selection patterns enhance user experience by enabling
          efficient interactions with content.
        </p>

        <h3>Accessibility Impact</h3>
        <p>Selection patterns improve accessibility:</p>
        <ul>
          <li>
            <strong>Keyboard navigation:</strong> Proper selection enables
            keyboard-only interaction
          </li>
          <li>
            <strong>Screen reader support:</strong> ARIA attributes enable
            screen reader navigation
          </li>
          <li>
            <strong>Selection feedback:</strong> Clear feedback helps screen
            reader users understand state
          </li>
        </ul>
        <p>
          Accessible selection patterns ensure all users can interact with
          content effectively.
        </p>

        <h3>System Consistency Impact</h3>
        <p>Consistent selection patterns improve system consistency:</p>
        <ul>
          <li>
            <strong>Predictable behavior:</strong> Users understand selection
            patterns across system
          </li>
          <li>
            <strong>Reusable components:</strong> Selection components enable
            consistent implementation
          </li>
          <li>
            <strong>Design system alignment:</strong> Selection aligns with
            design system tokens and patterns
          </li>
        </ul>
        <p>
          Consistent selection patterns ensure predictable, maintainable system
          behavior.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: (
      <>
        <p>
          Selection patterns bridge design intent and code implementation. Let's
          examine how selection requirements translate from design
          specifications to working code.
        </p>

        <h3>Design: Selection Specifications</h3>
        <p>Design specifications define selection requirements:</p>
        <pre>
          <code>{`// Design specifications
Selection Requirements:
  - Checkbox: Square, checkmark when selected
  - Radio button: Circle, filled when selected
  - Selected state: Background color change
  - Hover state: Border color change
  - Bulk selection: Select all checkbox at top
  - Selection count: Show "X selected" text`}</code>
        </pre>

        <h3>Code: Selection Component Implementation</h3>
        <p>Code implements selection with accessibility:</p>
        <pre>
          <code>{`// Checkbox component
export function Checkbox({ id, label, checked, onChange, ...props }) {
  const inputId = useId();
  const resolvedId = id ?? \`checkbox-\${inputId}\`;

  return (
    <div className="checkbox">
      <input
        type="checkbox"
        id={resolvedId}
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
        {...props}
      />
      <label htmlFor={resolvedId}>{label}</label>
    </div>
  );
}

// Radio button component
export function Radio({ id, name, label, value, checked, onChange }) {
  const inputId = useId();
  const resolvedId = id ?? \`radio-\${inputId}\`;

  return (
    <div className="radio">
      <input
        type="radio"
        id={resolvedId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
      />
      <label htmlFor={resolvedId}>{label}</label>
    </div>
  );
}`}</code>
        </pre>

        <h3>Design: Bulk Action Specifications</h3>
        <p>Design defines bulk action requirements:</p>
        <pre>
          <code>{`// Bulk action specifications
Bulk Action Requirements:
  - Select all checkbox at top of list
  - Selection count: "X of Y selected"
  - Action toolbar appears when items selected
  - Actions: Delete, Move, Archive
  - Clear selection button`}</code>
        </pre>

        <h3>Code: Bulk Action Implementation</h3>
        <p>Code implements bulk actions with selection management:</p>
        <pre>
          <code>{`// Bulk selection implementation
function ItemList({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const allSelected = selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  function handleSelectAll() {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  }

  function handleItemSelect(itemId) {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }

  return (
    <div>
      <div className="selection-toolbar" role="toolbar" aria-label="Selection actions">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={handleSelectAll}
          aria-label="Select all items"
        />
        <span role="status" aria-live="polite">
          {selectedItems.length} of {items.length} selected
        </span>
        {selectedItems.length > 0 && (
          <>
            <button onClick={() => handleBulkAction('delete')}>
              Delete Selected
            </button>
            <button onClick={() => handleBulkAction('archive')}>
              Archive Selected
            </button>
          </>
        )}
      </div>
      <ul role="listbox" aria-multiselectable="true">
        {items.map(item => (
          <li
            key={item.id}
            role="option"
            aria-selected={selectedItems.includes(item.id)}
          >
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemSelect(item.id)}
              aria-label={\`Select \${item.name}\`}
            />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented selection pattern ensures users can interact with
          content effectively. ARIA attributes enable screen reader navigation.
          Bulk actions enable efficient operations. Contextual menus provide
          relevant actions. When selection patterns are built with accessibility
          and user experience in mind, they create interfaces that enable
          efficient content interaction.
        </p>
        <p>
          Understanding selection patterns helps practitioners create interfaces
          that balance user needs with system requirements, ensuring both
          functionality and accessibility.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building Accessible Selection System',
    order: 7,
    content: (
      <>
        <p>Let's build an accessible selection system from scratch:</p>

        <h3>Step 1: Create Checkbox Component</h3>
        <p>Create checkbox component with accessibility:</p>
        <pre>
          <code>{`// Checkbox component
export function Checkbox({ id, label, checked, onChange, indeterminate, ...props }) {
  const inputId = useId();
  const resolvedId = id ?? \`checkbox-\${inputId}\`;
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <div className="checkbox">
      <input
        ref={checkboxRef}
        type="checkbox"
        id={resolvedId}
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
        {...props}
      />
      <label htmlFor={resolvedId}>{label}</label>
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 2: Create Bulk Selection System</h3>
        <p>Create bulk selection with select all:</p>
        <pre>
          <code>{`// Bulk selection
function ItemList({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const allSelected = selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  function handleSelectAll() {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  }

  return (
    <div>
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onChange={handleSelectAll}
        label="Select all"
      />
      <span role="status" aria-live="polite">
        {selectedItems.length} selected
      </span>
      {/* Item list */}
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 3: Add Action Toolbar</h3>
        <p>Add action toolbar for selected items:</p>
        <pre>
          <code>{`// Action toolbar
function ActionToolbar({ selectedCount, onAction }) {
  if (selectedCount === 0) return null;

  return (
    <div role="toolbar" aria-label="Bulk actions">
      <span role="status" aria-live="polite">
        {selectedCount} items selected
      </span>
      <button onClick={() => onAction('delete')}>
        Delete Selected
      </button>
      <button onClick={() => onAction('archive')}>
        Archive Selected
      </button>
    </div>
  );
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Accessibility:</strong> Full keyboard and screen reader
            support
          </li>
          <li>
            <strong>User experience:</strong> Efficient bulk operations
          </li>
          <li>
            <strong>Consistency:</strong> Predictable selection patterns
          </li>
          <li>
            <strong>Maintainability:</strong> Reusable selection components
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Tradeoffs',
    order: 8,
    content: (
      <>
        <h3>Common Challenges</h3>
        <p>Selection patterns face several challenges:</p>

        <h4>Selection State Management</h4>
        <p>Managing selection state can be complex:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Large lists require efficient state
            management
          </li>
          <li>
            <strong>Solution:</strong> Use Set for selection, virtualize long
            lists, lazy load selection state
          </li>
          <li>
            <strong>Guideline:</strong> Optimize for performance with large
            datasets
          </li>
        </ul>

        <h4>Indeterminate State</h4>
        <p>Indeterminate state requires careful handling:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Representing "some selected" state
          </li>
          <li>
            <strong>Approach:</strong> Use indeterminate property on checkbox,
            visual indicator
          </li>
          <li>
            <strong>Tradeoff:</strong> Complexity vs. clarity
          </li>
        </ul>

        <h4>Performance with Large Lists</h4>
        <p>Large lists can impact performance:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Rendering many items with selection
            state
          </li>
          <li>
            <strong>Approach:</strong> Use virtualization, lazy loading,
            optimize renders
          </li>
          <li>
            <strong>Tradeoff:</strong> Simplicity vs. performance
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Selection patterns involve several tradeoffs:</p>

        <h4>Select All vs. Individual Selection</h4>
        <ul>
          <li>
            <strong>Select all:</strong> Efficient for bulk operations, but may
            select unwanted items
          </li>
          <li>
            <strong>Individual selection:</strong> Precise control, but slower
            for bulk operations
          </li>
          <li>
            <strong>Best practice:</strong> Provide both options with clear
            feedback
          </li>
        </ul>

        <h4>Checkbox vs. Row Selection</h4>
        <ul>
          <li>
            <strong>Checkbox:</strong> Explicit selection, but takes space
          </li>
          <li>
            <strong>Row selection:</strong> Cleaner UI, but less obvious
          </li>
          <li>
            <strong>Best practice:</strong> Checkbox for clarity, row selection
            for space efficiency
          </li>
        </ul>

        <h4>Immediate vs. Deferred Actions</h4>
        <ul>
          <li>
            <strong>Immediate:</strong> Faster feedback, but may cause
            accidental actions
          </li>
          <li>
            <strong>Deferred:</strong> Safer, but requires confirmation step
          </li>
          <li>
            <strong>Best practice:</strong> Immediate for safe actions, deferred
            for destructive actions
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9,
    content: (
      <>
        <p>Continue learning about selection patterns:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Foundation of accessible design
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/assistive-tech">
              Assistive Technology Support
            </Link>
            : ARIA and keyboard navigation
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/navigation">
              Navigation Patterns
            </Link>
            : Related navigation patterns
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/forms">Forms Patterns</Link>:
            Form selection patterns
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#selection">Selection</Link>,{' '}
          <Link href="/blueprints/glossary#checkbox">Checkbox</Link>,{' '}
          <Link href="/blueprints/glossary#radio">Radio Button</Link>
        </p>
      </>
    ),
  },
];

const content = createFoundationContent(pageMetadata, sections);

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Accessibility Philosophy',
      description: 'Foundation of accessible design',
      type: 'foundation',
    },
    {
      slug: 'assistive-tech',
      title: 'Assistive Technology Support',
      description: 'ARIA and keyboard navigation',
      type: 'foundation',
    },
    {
      slug: 'navigation',
      title: 'Navigation Patterns',
      description: 'Related navigation patterns',
      type: 'pattern',
    },
  ],
  components: [],
  glossary: ['selection', 'checkbox', 'radio'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'aria-selection',
    label: 'ARIA selection',
    description:
      'Selection uses proper ARIA attributes (aria-checked, aria-selected)',
    required: true,
  },
  {
    id: 'keyboard-selection',
    label: 'Keyboard selection',
    description: 'Selection supports keyboard navigation (Space, Arrow keys)',
    required: true,
  },
  {
    id: 'bulk-actions',
    label: 'Bulk actions',
    description: 'Bulk actions available for multiple selections',
    required: false,
  },
  {
    id: 'selection-feedback',
    label: 'Selection feedback',
    description: 'Selection count and state clearly communicated',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use checkboxes vs. radio buttons? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how ARIA attributes ensure accessibility in selection. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between immediate and deferred actions for bulk operations? How do you decide?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function SelectionPage() {
  return <FoundationPage content={content} />;
}
