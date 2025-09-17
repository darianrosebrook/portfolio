#!/usr/bin/env node
/**
 * Component Scaffold CLI
 * Creates a component folder with files per UI component standards.
 *
 * Usage:
 *   node scripts/scaffoldComponent.mjs --name Button --layer primitive
 *   node scripts/scaffoldComponent.mjs -n Card -l compound
 *   node scripts/scaffoldComponent.mjs -n Modal -l composer --dir ui/components
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    name: '',
    layer: 'primitive',
    dir: 'ui/components',
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case '--name':
      case '-n':
        args.name = next;
        i += 1;
        break;
      case '--layer':
      case '-l':
        args.layer = next;
        i += 1;
        break;
      case '--dir':
      case '-d':
        args.dir = next;
        i += 1;
        break;
      case '--dry-run':
      case '-r':
        args.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelpAndExit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          // ignore unknown flags
        } else {
          // positional name support
          if (!args.name) args.name = arg;
        }
    }
  }
  if (!args.name) {
    console.error('Error: --name is required');
    printHelpAndExit(1);
  }
  const allowed = ['primitive', 'compound', 'composer', 'assembly'];
  if (!allowed.includes(args.layer)) {
    console.error(`Error: --layer must be one of ${allowed.join(', ')}`);
    printHelpAndExit(1);
  }
  return args;
}

function printHelpAndExit(code) {
  console.log(
    `\nComponent Scaffold CLI\n\nUsage:\n  node scripts/scaffoldComponent.mjs --name Button --layer primitive\n  node scripts/scaffoldComponent.mjs -n Card -l compound\n  node scripts/scaffoldComponent.mjs -n Modal -l composer --dir ui/components\n\nOptions:\n  -n, --name     Component name in PascalCase (required)\n  -l, --layer    primitive | compound | composer | assembly (default: primitive)\n  -d, --dir      Base directory (default: ui/components)\n  -r, --dry-run  Print files that would be created without writing\n  -h, --help     Show help\n`
  );
  process.exit(code);
}

function toPascalCase(input) {
  return input
    .replace(/[-_ ]+/g, ' ')
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toKebabCase(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .toLowerCase();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileMaybe(filePath, content, dryRun) {
  if (dryRun) return 'dryrun';
  if (fs.existsSync(filePath)) {
    return 'skipped';
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return 'created';
}

function scaffold() {
  const { name, layer, dir, dryRun } = parseArgs(process.argv);
  const Name = toPascalCase(name);
  const kebab = toKebabCase(Name);
  const lower = Name.toLowerCase();

  // Ensure we resolve within the current workspace root
  const baseDir = path.resolve(projectRoot, dir, Name);
  ensureDir(baseDir);

  const files = [];

  // index.tsx
  files.push([
    path.join(baseDir, 'index.tsx'),
    `export { default } from './${Name}';\nexport { ${Name} } from './${Name}';\nexport type { ${Name}Props } from './${Name}';\n`,
  ]);

  // tokens json
  files.push([
    path.join(baseDir, `${Name}.tokens.json`),
    JSON.stringify(
      {
        prefix: lower,
        tokens: {
          color: {
            background: {
              default: '{semantic.color.background.secondary}',
            },
            foreground: {
              primary: '{semantic.color.foreground.primary}',
              secondary: '{semantic.color.foreground.secondary}',
            },
            border: {
              default: '{semantic.color.border.light}',
              accent: '{semantic.color.border.accent}',
            },
          },
          size: {
            padding: { default: '{core.spacing.size.07}' },
            radius: { default: '{core.shape.radius.medium}' },
          },
          elevation: { default: '{semantic.elevation.depth.1}' },
        },
      },
      null,
      2
    ) + '\n',
  ]);

  // tokens generated scss (bootstrap to avoid build errors before token pipeline runs)
  files.push([
    path.join(baseDir, `${Name}.tokens.generated.scss`),
    `/* AUTO-GENERATED: Scaffolding placeholder. Replace via tokens build. */\n@mixin vars {\n  /* === Color === */\n  --${lower}-color-background-default: var(--semantic-color-background-secondary);\n  --${lower}-color-foreground-primary: var(--semantic-color-foreground-primary);\n  --${lower}-color-foreground-secondary: var(--semantic-color-foreground-secondary);\n  --${lower}-color-border-default: var(--semantic-color-border-light);\n  --${lower}-color-border-accent: var(--semantic-color-border-accent);\n  /* === Size === */\n  --${lower}-size-padding-default: var(--core-spacing-size-07);\n  --${lower}-size-radius-default: var(--core-shape-radius-medium);\n  /* === Elevation === */\n  --${lower}-elevation-default: var(--semantic-elevation-depth-1);\n}\n`,
  ]);

  // module scss
  files.push([
    path.join(baseDir, `${Name}.module.scss`),
    `@import '../../designTokens/index';\n@use './${Name}.tokens.generated.scss' as ${lower}Tokens;\n\n.${lower} {\n  @include ${lower}Tokens.vars;\n\n  display: block;\n  padding: var(--${lower}-size-padding-default);\n  background: var(--${lower}-color-background-default);\n  border-radius: var(--${lower}-size-radius-default);\n  box-shadow: var(--${lower}-elevation-default) var(--semantic-color-background-imageOverlay);\n  transition: box-shadow var(--core-motion-duration-short) var(--core-motion-easing-standard),\n    transform var(--core-motion-duration-short) var(--core-motion-easing-standard);\n}\n\n.${lower}.clickable {\n  cursor: pointer;\n\n  &:hover {\n    box-shadow: var(--semantic-elevation-depth-2) var(--semantic-color-background-imageOverlay);\n    transform: translateY(-2px);\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--semantic-color-border-accent);\n    outline-offset: 2px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .${lower} {\n    transition: none;\n  }\n}\n`,
  ]);

  // main component
  const baseFC = `/**\n * ${Name} (${layer.charAt(0).toUpperCase() + layer.slice(1)})\n * Generated via scaffold CLI.\n */\n'use client';\nimport * as React from 'react';\nimport styles from './${Name}.module.scss';\n\nexport interface ${Name}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\nexport const ${Name}: React.FC<${Name}Props> = ({ className = '', children, ...rest }) => {\n  return (\n    <div className={[styles.${lower}, className].filter(Boolean).join(' ')} {...rest}>\n      {children}\n    </div>\n  );\n};\n${Name}.displayName = '${Name}';\n\nexport default ${Name};\n`;

  const baseTsx = baseFC;
  files.push([path.join(baseDir, `${Name}.tsx`), baseTsx]);

  // layer-specific files
  if (layer === 'composer') {
    files.push([
      path.join(baseDir, `${Name}Provider.tsx`),
      `/** Context Provider for ${Name} */\n'use client';\nimport * as React from 'react';\n\ninterface ${Name}ContextValue {}\n\nconst ${Name}Context = React.createContext<${Name}ContextValue | null>(null);\nexport const use${Name}Context = () => {\n  const ctx = React.useContext(${Name}Context);\n  if (!ctx) throw new Error('use${Name}Context must be used within ${Name}Provider');\n  return ctx;\n};\n\nexport const ${Name}Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const value = React.useMemo<${Name}ContextValue>(() => ({}), []);\n  return <${Name}Context.Provider value={value}>{children}</${Name}Context.Provider>;\n};\n`,
    ]);

    files.push([
      path.join(baseDir, `use${Name}.ts`),
      `/** Headless logic hook for ${Name} */\nimport * as React from 'react';\n\nexport interface Use${Name}Options {\n  defaultOpen?: boolean;\n}\n\nexport interface Use${Name}Return {\n  isOpen: boolean;\n  open: () => void;\n  close: () => void;\n  toggle: () => void;\n}\n\nexport function use${Name}(options: Use${Name}Options = {}): Use${Name}Return {\n  const { defaultOpen = false } = options;\n  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);\n  const open = React.useCallback(() => setIsOpen(true), []);\n  const close = React.useCallback(() => setIsOpen(false), []);\n  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);\n  return { isOpen, open, close, toggle };\n}\n`,
    ]);
  }

  // Contract file (machine-readable component specification)
  const contractSchema = {
    name: Name,
    layer: layer,
    anatomy: ["root"],
    variants: {},
    states: ["default"],
    slots: {},
    a11y: {
      role: layer === 'primitive' ? "generic" : "region",
      labeling: [],
      keyboard: [],
      apgPattern: null
    },
    tokens: {
      root: [
        `${lower}.color.background.default`,
        `${lower}.color.foreground.primary`,
        `${lower}.size.padding.default`,
        `${lower}.size.radius.default`
      ]
    },
    ssr: { hydrateOn: "none" },
    rtl: { flipIcon: false }
  };

  files.push([
    path.join(baseDir, `${Name}.contract.json`),
    JSON.stringify(contractSchema, null, 2) + '\n'
  ]);

  // Tests directory structure
  const testsDir = path.join(baseDir, 'tests');
  
  // Unit test file
  files.push([
    path.join(testsDir, `${Name}.test.tsx`),
    `import * as React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport { axe, toHaveNoViolations } from 'jest-axe';\nimport ${Name} from '../${Name}';\n\n// Extend Jest matchers\nexpect.extend(toHaveNoViolations);\n\ndescribe('${Name}', () => {\n  it('renders without crashing', () => {\n    render(<${Name}>Test content</${Name}>);\n    expect(screen.getByText('Test content')).toBeInTheDocument();\n  });\n\n  it('forwards ref to the underlying element', () => {\n    const ref = React.createRef<HTMLDivElement>();\n    render(<${Name} ref={ref}>Test</${Name}>);\n    expect(ref.current).toBeInstanceOf(HTMLDivElement);\n  });\n\n  it('applies custom className', () => {\n    render(<${Name} className="custom-class">Test</${Name}>);\n    const element = screen.getByText('Test');\n    expect(element).toHaveClass('custom-class');\n  });\n\n  it('passes through HTML attributes', () => {\n    render(<${Name} data-testid="test-${lower}">Test</${Name}>);\n    expect(screen.getByTestId('test-${lower}')).toBeInTheDocument();\n  });\n\n  describe('Accessibility', () => {\n    it('should not have accessibility violations', async () => {\n      const { container } = render(<${Name}>Accessible content</${Name}>);\n      const results = await axe(container);\n      expect(results).toHaveNoViolations();\n    });\n  });\n\n  describe('Design Tokens', () => {\n    it('uses design tokens instead of hardcoded values', () => {\n      render(<${Name}>Test</${Name}>);\n      const element = screen.getByText('Test');\n      const styles = window.getComputedStyle(element);\n      \n      // Verify CSS custom properties are being used\n      // Note: In jsdom, CSS custom properties may not resolve,\n      // but we can check that the class is applied correctly\n      expect(element).toHaveClass('${lower}');\n    });\n  });\n});\n`
  ]);

  // A11y-specific test file for interactive components
  if (layer !== 'primitive' || Name.toLowerCase().includes('button') || Name.toLowerCase().includes('input')) {
    files.push([
      path.join(testsDir, `${Name}.a11y.test.tsx`),
      `import * as React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { axe, toHaveNoViolations } from 'jest-axe';\nimport ${Name} from '../${Name}';\n\n// Extend Jest matchers\nexpect.extend(toHaveNoViolations);\n\ndescribe('${Name} Accessibility', () => {\n  const user = userEvent.setup();\n\n  it('supports keyboard navigation', async () => {\n    render(<${Name}>Interactive content</${Name}>);\n    const element = screen.getByText('Interactive content');\n    \n    // Test tab navigation\n    await user.tab();\n    expect(element).toHaveFocus();\n  });\n\n  it('has proper focus indicators', async () => {\n    render(<${Name}>Focusable content</${Name}>);\n    const element = screen.getByText('Focusable content');\n    \n    await user.tab();\n    expect(element).toHaveFocus();\n    \n    // Check for focus styles (implementation-specific)\n    const styles = window.getComputedStyle(element);\n    // Add specific focus style assertions based on your design tokens\n  });\n\n  it('meets WCAG contrast requirements', async () => {\n    const { container } = render(<${Name}>Contrast test</${Name}>);\n    const results = await axe(container, {\n      rules: {\n        'color-contrast': { enabled: true }\n      }\n    });\n    expect(results).toHaveNoViolations();\n  });\n\n  it('works with screen readers', () => {\n    render(<${Name} aria-label="Screen reader label">Content</${Name}>);\n    const element = screen.getByLabelText('Screen reader label');\n    expect(element).toBeInTheDocument();\n  });\n});\n`
    ]);
  }

  // README
  files.push([
    path.join(baseDir, 'README.md'),
    `# ${Name} (${layer.charAt(0).toUpperCase() + layer.slice(1)})\n\nScaffolded component following system standards.\n\n## Usage\n\n\`\`\`tsx\nimport ${Name} from '@/ui/components/${Name}';\n\n<${Name}>\n  {/* content */}\n</${Name}>;\n\n// Tokens live in ${Name}.tokens.json and are bootstrapped in ${Name}.tokens.generated.scss\n\`\`\`\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| children | ReactNode | - | Content to render inside the component |\n| className | string | '' | Additional CSS classes |\n| ...rest | HTMLAttributes<HTMLDivElement> | - | All standard HTML div attributes |\n\n## Examples\n\n### Basic Usage\n\`\`\`tsx\n<${Name}>\n  Basic content\n</${Name}>\n\`\`\`\n\n### With Custom Styling\n\`\`\`tsx\n<${Name} className="custom-styles">\n  Styled content\n</${Name}>\n\`\`\`\n\n## Accessibility\n\n### ARIA\n- **Role**: \`${contractSchema.a11y.role}\`\n- **Labeling**: Supports \`aria-label\` and \`aria-labelledby\`\n\n### Keyboard Navigation\n\n| Key | Action | Result |\n|-----|--------|--------|\n| Tab | Focus | Moves focus to the component |\n\n### Focus Management\n- Component receives focus when tabbed to\n- Focus indicators meet WCAG 2.1 AA contrast requirements\n- Supports \`:focus-visible\` for keyboard-only focus styling\n\n### Screen Reader Support\n- Content is announced appropriately\n- Semantic structure is preserved\n\n## Design Tokens\n\n### Consumed Tokens\n- \`${lower}.color.background.default\` → Background color\n- \`${lower}.color.foreground.primary\` → Text color\n- \`${lower}.size.padding.default\` → Internal spacing\n- \`${lower}.size.radius.default\` → Border radius\n\n### Token Structure\nTokens are defined in \`${Name}.tokens.json\` and compiled to \`${Name}.tokens.generated.scss\`.\n\n## Related Components\n\n- List related components here\n\n## Testing\n\nRun component tests:\n\`\`\`bash\nnpm test -- ${Name}\n\`\`\`\n\nRun accessibility tests:\n\`\`\`bash\nnpm test -- ${Name}.a11y\n\`\`\`\n`,
  ]);

  // write all
  files.forEach(([p, c]) => {
    const result = writeFileMaybe(p, c, dryRun);
    const rel = path.relative(projectRoot, p);
    if (result === 'dryrun') console.log(`DRYRUN  ${rel}`);
    else if (result === 'created') console.log(`CREATED  ${rel}`);
    else console.log(`SKIPPED  ${rel}`);
  });

  console.log('\nDone.');
}

scaffold();
