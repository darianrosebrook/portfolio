# DocLayout Component

An interactive documentation layout component that provides synchronized scrolling between documentation content and code examples.

## Features

- **Three-column layout**: Navigation, content, and code editor
- **Scroll synchronization**: Code highlighting follows documentation sections
- **Intersection Observer**: Automatic section detection and highlighting
- **Interactive code editor**: Full Sandpack integration with syntax highlighting
- **Responsive design**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import {
  DocLayout,
  DocLayoutProvider,
  DocSection,
  DocNavigation,
  useDocLayout,
} from '@/ui/components/DocLayout';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    codeHighlight: {
      file: '/Component.tsx',
      lines: [1, 20],
    },
  },
  // ... more sections
];

const codeFiles = {
  '/Component.tsx': `// Your component code here`,
  '/App.tsx': `// Usage examples here`,
};

export default function DocumentationPage() {
  return (
    <DocLayoutProvider sections={sections}>
      <DocLayout
        codeFiles={codeFiles}
        sandpackOptions={{
          template: 'react-ts',
          options: {
            showLineNumbers: true,
            editorHeight: '100vh',
          },
        }}
      >
        <DocSection id="overview">
          <h1>Component Overview</h1>
          <p>Your documentation content...</p>
        </DocSection>

        <DocSection id="usage">
          <h2>Usage</h2>
          <p>How to use the component...</p>
        </DocSection>
      </DocLayout>
    </DocLayoutProvider>
  );
}
```

## Components

### DocLayoutProvider

Provides context for managing active sections and scroll synchronization.

**Props:**

- `sections`: Array of section definitions with IDs, titles, and code highlighting info
- `children`: React nodes to render

### DocLayout

Main layout component that renders the three-column structure.

**Props:**

- `children`: Documentation content with DocSection components
- `codeFiles`: Object mapping file paths to code content
- `sandpackOptions`: Configuration for the Sandpack code editor

### DocSection

Wrapper for individual documentation sections.

**Props:**

- `id`: Unique identifier for the section
- `children`: Section content
- `className`: Optional CSS class

### DocNavigation

Navigation component that shows section links.

**Props:**

- `sections`: Array of section definitions
- `activeSection`: Currently active section ID
- `onSectionClick`: Handler for section navigation

## How It Works

1. **Intersection Observer**: Monitors which documentation sections are visible
2. **Context Management**: Tracks active section and updates code highlighting
3. **Code Synchronization**: Highlights specific lines in the code editor based on the active section
4. **Smooth Scrolling**: Navigation clicks smoothly scroll to sections

## Styling

The component uses CSS modules with design tokens for consistent styling:

- Responsive grid layout
- Sticky code panel
- Smooth transitions
- Design system color tokens
- Mobile-first responsive design

## Accessibility

- Proper semantic HTML structure
- ARIA labels for navigation
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Integration with Design System

This component follows the design system's compound component pattern:

- Uses design tokens for styling
- Implements proper TypeScript interfaces
- Follows accessibility best practices
- Includes comprehensive documentation
- Supports responsive design patterns
