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
      `/** Headless logic hook for ${Name} */\nimport * as React from 'react';\n\nexport function use${Name}() {\n  // TODO: implement logic state\n  const [state, setState] = React.useState(null);\n  return { state, setState };\n}\n`,
    ]);
  }

  // README
  files.push([
    path.join(baseDir, 'README.md'),
    `# ${Name} (${layer.charAt(0).toUpperCase() + layer.slice(1)})\n\nScaffolded component following system standards.\n\n## Usage\n\n\`\`\`tsx\nimport ${Name} from '@/ui/components/${Name}';\n\n<${Name}>\n  {/* content */}\n</${Name}>;\n\n// Tokens live in ${Name}.tokens.json and are bootstrapped in ${Name}.tokens.generated.scss\n\`\`\`\n\n## Props\n\n- ${Name}\n  - ...div props\n\n## Examples\n\n- Add usage examples and states here.\n\n## Accessibility\n\n- Include focus styles, ARIA guidance, and keyboard behavior where applicable.\n\n## Design Tokens\n\n- Consumes ${Name}.tokens.json → ${Name}.tokens.generated.scss\n- Background, radius, padding, elevation map to semantic tokens\n`,
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
