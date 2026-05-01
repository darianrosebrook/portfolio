#!/usr/bin/env node
/**
 * Generate or refresh component contract files.
 *
 * Contracts are derived from implementation, SCSS module classes, slot markers,
 * accessibility attributes, and component token files. Existing contracts are
 * updated by default so they do not drift into boilerplate.
 *
 * Props are extracted via the TypeScript Compiler API (ts-morph) when available.
 * Hand-authored sections (channels, focus, dismissal, stateMachine, motion,
 * portal, relationships) are preserved from the existing contract file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hand-authored contract sections — regenerate never overwrites these if present
const PRESERVED_KEYS = [
  'channels',
  'types',
  'stateMachine',
  'focus',
  'dismissal',
  'motion',
  'portal',
  'relationships',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPONENTS_DIR = path.join(__dirname, '../ui/components');

const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has('--check');
const DRY_RUN = args.has('--dry-run') || CHECK_ONLY;
const CREATE_MISSING_ONLY = args.has('--missing-only');

const STATE_NAMES = [
  'default',
  'hover',
  'focus',
  'focusVisible',
  'active',
  'disabled',
  'loading',
  'open',
  'closed',
  'checked',
  'unchecked',
  'selected',
  'expanded',
  'collapsed',
  'entering',
  'visible',
  'leaving',
  'invalid',
  'valid',
  'error',
  'success',
];

const NON_ANATOMY_CLASS_NAMES = new Set([
  'tokens',
  'generated',
  'scss',
  'vars',
  'module',
  'as',
  'from',
]);

const VARIANT_PROP_NAMES = [
  'variant',
  'size',
  'intent',
  'status',
  'level',
  'type',
  'orientation',
  'placement',
  'side',
  'align',
  'position',
  'tone',
  'mode',
  'politeness',
  'as',
];

const A11Y_PATTERNS = new Map([
  ['button', 'button'],
  ['dialog', 'dialog-modal'],
  ['alert', 'alert'],
  ['status', 'status'],
  ['progressbar', 'progressbar'],
  ['tab', 'tabs'],
  ['tabpanel', 'tabs'],
  ['listbox', 'listbox'],
  ['option', 'listbox'],
  ['combobox', 'combobox'],
  ['switch', 'switch'],
  ['checkbox', 'checkbox'],
  ['separator', 'separator'],
  ['img', 'image'],
  ['tooltip', 'tooltip'],
]);

const SHARED_TYPE_ALIASES = new Map([
  ['Intent', ['info', 'success', 'warning', 'danger']],
  ['ErrorIntent', ['error']],
  ['StatusIntent', ['info', 'success', 'warning', 'danger', 'error']],
  ['ControlSize', ['sm', 'md', 'lg']],
  ['EmphasisVariant', ['primary', 'secondary', 'tertiary']],
  ['Placement', ['top', 'bottom', 'left', 'right', 'auto']],
  ['TriggerStrategy', ['click', 'hover']],
  ['AriaPoliteness', ['polite', 'assertive']],
]);

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sortUnique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function orderedUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePart(value) {
  return value
    .replace(/^__+/, '')
    .replace(/^[-_]+/, '')
    .replace(/["'`]/g, '')
    .trim();
}

function camelFromDataSlot(slot) {
  return slot
    .split(/[-_]/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

function stripComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function componentFiles(componentPath) {
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'tests' || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(tsx|ts|scss)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(componentPath);
  return files;
}

function sourceFiles(componentPath) {
  return componentFiles(componentPath).filter((file) =>
    /\.(tsx|ts)$/.test(file)
  );
}

function allSource(componentPath) {
  return sourceFiles(componentPath)
    .map((file) => stripComments(read(file)))
    .join('\n');
}

function classifyComponent(componentName, componentPath, source) {
  const providerFile = path.join(componentPath, `${componentName}Provider.tsx`);
  const hasProvider = fs.existsSync(providerFile);
  const hasContext =
    /\b(createContext|useContext|Provider)\b/.test(source) || hasProvider;
  const hasCompound =
    /Object\.assign\s*\(/.test(source) ||
    new RegExp(`${componentName}\\.[A-Z]`).test(source) ||
    fs.existsSync(path.join(componentPath, 'slots'));

  if (hasContext) return 'composer';
  if (hasCompound) return 'compound';
  return 'primitive';
}

function extractTypeAliases(source) {
  const aliases = new Map(SHARED_TYPE_ALIASES);
  const aliasPattern =
    /(?:export\s+)?type\s+([A-Z][A-Za-z0-9_]*)\s*=\s*([^;\n]+(?:\n\s*\|[^;\n]+)*)/g;

  for (const match of source.matchAll(aliasPattern)) {
    const values = [...match[2].matchAll(/['"`]([^'"`]+)['"`]/g)].map(
      (value) => value[1]
    );
    if (values.length > 0) aliases.set(match[1], values);
  }

  return aliases;
}

function extractPropBlocks(source) {
  const blocks = [];
  const interfacePattern =
    /(?:export\s+)?interface\s+[A-Z][A-Za-z0-9_]*(?:Props|Options|Config)?[^{]*\{([\s\S]*?)\n\}/g;
  const typePattern =
    /(?:export\s+)?type\s+[A-Z][A-Za-z0-9_]*(?:Props|Options|Config)?\s*=\s*\{([\s\S]*?)\n\}/g;

  for (const match of source.matchAll(interfacePattern)) {
    blocks.push(match[1]);
  }

  for (const match of source.matchAll(typePattern)) {
    blocks.push(match[1]);
  }

  return blocks.join('\n');
}

function extractObjectLiteralKeys(source, objectName) {
  const objectPattern = new RegExp(
    `(?:const|let|var)\\s+${objectName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*(?:as\\s+const)?\\s*;`,
    'm'
  );
  const match = source.match(objectPattern);
  if (!match) return [];

  return [...match[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9_-]*)\s*:/gm)].map(
    (key) => key[1]
  );
}

function extractVariants(source) {
  const variants = {};
  const aliases = extractTypeAliases(source);
  const propsSource = extractPropBlocks(source) || source;
  const propPattern = /([A-Za-z][A-Za-z0-9_]*)\??\s*:\s*([^;\n]+)/g;

  for (const match of propsSource.matchAll(propPattern)) {
    const propName = match[1];
    if (!VARIANT_PROP_NAMES.includes(propName)) continue;

    const rawType = match[2].trim();
    let values = [...rawType.matchAll(/['"`]([^'"`]+)['"`]/g)].map(
      (value) => value[1]
    );

    if (values.length === 0 && aliases.has(rawType)) {
      values = aliases.get(rawType);
    }

    if (
      values.length > 0 &&
      values.length <= 20 &&
      (!variants[propName] || values.length > variants[propName].length)
    ) {
      variants[propName] = orderedUnique(values);
    }
  }

  return variants;
}

function extractSlots(source, componentName) {
  const slots = {};

  for (const match of source.matchAll(/data-slot=["'`]([^"'`]+)["'`]/g)) {
    const rawSlot = match[1];
    const localName = rawSlot
      .replace(new RegExp(`^${componentName.toLowerCase()}-?`), '')
      .replace(/^root$/, '');
    const name = localName ? camelFromDataSlot(localName) : 'root';
    slots[name] = {
      required: name === 'root',
      selector: `[data-slot="${rawSlot}"]`,
    };
  }

  for (const match of source.matchAll(
    /\.displayName\s*=\s*['"`]([^'"`]+)['"`]/g
  )) {
    const displayName = match[1];
    if (!displayName.includes('.')) continue;
    const slotName = displayName.split('.').pop();
    const name = slotName.charAt(0).toLowerCase() + slotName.slice(1);
    slots[name] ||= { required: false };
  }

  return Object.fromEntries(
    Object.entries(slots).sort(([a], [b]) => a.localeCompare(b))
  );
}

function extractStyleReferences(source) {
  const refs = [];
  const patterns = [
    /\bstyles\.([A-Za-z][A-Za-z0-9_]*)/g,
    /\bStyles\.([A-Za-z][A-Za-z0-9_]*)/g,
    /\bstyles\[['"`]([^'"`]+)['"`]\]/g,
    /\bStyles\[['"`]([^'"`]+)['"`]\]/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern))
      refs.push(normalizePart(match[1]));
  }

  return refs;
}

function extractScssClasses(componentName, componentPath) {
  const scssFile = path.join(componentPath, `${componentName}.module.scss`);
  const content = stripComments(read(scssFile));
  const classes = [];

  for (const match of content.matchAll(
    /(^|[\s{,&>+~])\.([A-Za-z_][A-Za-z0-9_-]*)/gm
  )) {
    const cls = normalizePart(match[2]);
    if (!cls) continue;
    classes.push(cls);
  }

  return classes;
}

function extractAnatomy(componentName, componentPath, source, variants, slots) {
  const lower = componentName.toLowerCase();
  const variantValues = new Set(Object.values(variants).flat());
  const slotNames = Object.keys(slots);
  const classes = [
    ...extractScssClasses(componentName, componentPath),
    ...extractStyleReferences(source),
  ];
  const anatomy = ['root', ...slotNames.filter((slot) => slot !== 'root')];

  for (const cls of classes) {
    if (!cls || cls === lower || cls === componentName) continue;
    if (NON_ANATOMY_CLASS_NAMES.has(cls)) continue;
    if (cls.includes('$') || cls.includes('{') || cls.includes('}')) continue;
    if (cls.startsWith('variant-')) continue;
    if (variantValues.has(cls)) continue;
    if (STATE_NAMES.includes(cls)) continue;
    if (/^(is|has)[A-Z]/.test(cls)) continue;
    if (/^(sm|md|lg|xl|small|medium|large)$/.test(cls)) continue;
    anatomy.push(cls);
  }

  return orderedUnique(anatomy).slice(0, 24);
}

function extractStates(source, scssSource, variants) {
  const found = ['default'];
  const combined = `${source}\n${scssSource}`;
  const variantValues = new Set(Object.values(variants).flat());

  for (const state of STATE_NAMES) {
    if (state === 'default') continue;
    if (variantValues.has(state)) continue;
    const kebab = state.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
    const patterns = [
      new RegExp(`styles\\.${state}\\b`),
      new RegExp(`styles\\[['"\`]${state}['"\`]\\]`),
      new RegExp(`\\.(${state}|${kebab})(?=[\\s{,.#:[>+~])`),
      new RegExp(`['"\`]${state}['"\`]`),
      new RegExp(`['"\`]${kebab}['"\`]`),
      new RegExp(`data-state=\\{[^}]*['"\`]${state}['"\`]`),
      new RegExp(`data-state=["'\`]${state}["'\`]`),
    ];

    if (['hover', 'focus', 'active', 'disabled'].includes(state)) {
      patterns.push(new RegExp(`:${kebab}\\b`));
    }

    if (patterns.some((pattern) => pattern.test(combined))) found.push(state);
  }

  return orderedUnique(found);
}

function extractRoles(source) {
  const roles = [];

  for (const match of source.matchAll(/role=["'`]([^"'`]+)["'`]/g)) {
    roles.push(match[1]);
  }

  if (
    /role=\{[^}]*\?[^}]*['"`]alert['"`][^}]*:[^}]*['"`]status['"`][^}]*\}/.test(
      source
    )
  ) {
    roles.push('alert', 'status');
  }

  return orderedUnique(roles);
}

function extractLabeling(source) {
  const labeling = [];
  for (const match of source.matchAll(/\b(aria-[a-zA-Z-]+)=/g)) {
    const attr = match[1];
    if (
      attr === 'aria-hidden' ||
      attr === 'aria-expanded' ||
      attr === 'aria-pressed' ||
      attr === 'aria-modal' ||
      attr === 'aria-live' ||
      attr === 'aria-current' ||
      attr === 'aria-invalid' ||
      attr === 'aria-selected' ||
      attr === 'aria-disabled'
    ) {
      continue;
    }
    labeling.push(attr);
  }

  for (const match of source.matchAll(/['"`](aria-[a-zA-Z-]+)['"`]\s*:/g)) {
    const attr = match[1];
    if (
      attr === 'aria-label' ||
      attr === 'aria-labelledby' ||
      attr === 'aria-describedby'
    ) {
      labeling.push(attr);
    }
  }

  if (source.includes('title=')) labeling.push('title');
  return orderedUnique(labeling);
}

function keyboardFor(componentName, roles, source) {
  const name = componentName.toLowerCase();
  const keys = [];

  if (
    !name.includes('accordion') &&
    (roles.includes('button') ||
      /<button\b/.test(source) ||
      name.includes('button'))
  ) {
    keys.push({ key: 'Enter|Space', when: 'trigger', then: 'activate' });
  }

  if (
    roles.includes('dialog') ||
    name.includes('dialog') ||
    name.includes('sheet')
  ) {
    keys.push({ key: 'Escape', when: 'open', then: 'close' });
    keys.push({ key: 'Tab', when: 'open', then: 'cycle focus within' });
  }

  if (name.includes('accordion')) {
    keys.push({ key: 'Enter|Space', when: 'trigger', then: 'toggle item' });
  }

  if (name.includes('tabs') || roles.includes('tab')) {
    keys.push({
      key: 'ArrowLeft|ArrowRight',
      when: 'tablist',
      then: 'move focus',
    });
    keys.push({ key: 'Enter|Space', when: 'tab', then: 'activate tab' });
  }

  if (name.includes('select') || roles.includes('combobox')) {
    keys.push({
      key: 'ArrowDown|ArrowUp',
      when: 'trigger',
      then: 'navigate options',
    });
    keys.push({ key: 'Enter|Space', when: 'option', then: 'select option' });
    keys.push({ key: 'Escape', when: 'listbox', then: 'close' });
  }

  if (/onKeyDown|onKeyUp|onKeyPress/.test(source) && keys.length === 0) {
    keys.push({
      key: 'KeyboardEvent',
      when: 'root',
      then: 'handled by component',
    });
  }

  return keys;
}

function generateA11yInfo(componentName, layer, source) {
  const roles = extractRoles(source);
  const primaryRole =
    roles[0] ||
    (componentName.toLowerCase().includes('button') ? 'button' : null) ||
    (layer === 'composer' ? 'region' : 'generic');
  const labeling = extractLabeling(source);
  const keyboard = keyboardFor(componentName, roles, source);

  return {
    role: primaryRole,
    ...(roles.length > 1 ? { roles } : {}),
    labeling,
    keyboard,
    apgPattern: A11Y_PATTERNS.get(primaryRole) ?? null,
  };
}

function flattenTokenPaths(node, prefix = []) {
  if (!node || typeof node !== 'object') return [];
  const paths = [];

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) {
      paths.push([...prefix, key].join('.'));
      continue;
    }
    if (value && typeof value === 'object') {
      const childPaths = flattenTokenPaths(value, [...prefix, key]);
      if (childPaths.length === 0 && typeof value !== 'string') continue;
      paths.push(...childPaths);
    } else {
      paths.push([...prefix, key].join('.'));
    }
  }

  return paths;
}

// ── ts-morph prop extraction ─────────────────────────────────────────────────

// Prop names excluded from the agent-facing descriptor (infrastructure, not API)
const EXCLUDED_PROP_NAMES = new Set([
  'className', 'style', 'id', 'key', 'ref', 'children',
  'data-testid', 'tabIndex',
]);
const EXCLUDED_PROP_PATTERNS = [/^aria-/, /^data-/, /^on[A-Z]/, /Ref$/];

function isExcludedProp(name) {
  if (EXCLUDED_PROP_NAMES.has(name)) return true;
  return EXCLUDED_PROP_PATTERNS.some((re) => re.test(name));
}

function simplifyType(typeStr) {
  return typeStr
    .replace(/React\.(ReactNode|ReactElement|FC[^,)>]*)/g, 'ReactNode')
    .replace(/React\.CSSProperties/g, 'CSSProperties')
    .replace(/React\.(MouseEvent|KeyboardEvent|FocusEvent|ChangeEvent)<[^>]+>/g, (_, e) => e)
    .replace(/import\([^)]+\)\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Shared ts-morph Project — created once, reused across all components.
let _tsProject = null;
let _tsMorphUnavailable = false;

async function getOrCreateProject() {
  if (_tsMorphUnavailable) return null;
  if (_tsProject) return _tsProject;

  let Project;
  try {
    ({ Project } = await import('ts-morph'));
  } catch {
    _tsMorphUnavailable = true;
    return null;
  }

  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
  _tsProject = new Project({
    tsConfigFilePath: tsconfigPath,
    skipAddingFilesFromTsConfig: true,
  });
  return _tsProject;
}

async function extractPropsViaTs(componentName, componentPath) {
  const project = await getOrCreateProject();
  if (!project) return null;

  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  const hookFile = path.join(componentPath, `use${componentName}.ts`);
  if (!fs.existsSync(mainFile)) return null;

  project.addSourceFileAtPath(mainFile);
  const hasHook = fs.existsSync(hookFile);
  if (hasHook) project.addSourceFileAtPath(hookFile);

  const result = {};

  function extractMembers(sourceFile, declName) {
    const propsDecl =
      sourceFile.getTypeAlias(declName) ||
      sourceFile.getInterface(declName);
    if (!propsDecl) return [];

    // Build defaults map from the component's destructuring signature.
    // Using ts-morph's ObjectBindingPattern avoids false matches from
    // assignments elsewhere in the function body.
    const defaults = new Map();
    const funcVar = sourceFile.getVariableDeclaration(componentName);
    if (funcVar) {
      const initNode = funcVar.getInitializer();
      const params = initNode?.getParameters?.() ?? [];
      const nameNode = params[0]?.getNameNode?.();
      if (nameNode?.getKindName?.() === 'ObjectBindingPattern') {
        for (const element of nameNode.getElements()) {
          const initializer = element.getInitializer();
          if (initializer) {
            const raw = initializer.getText().replace(/^['"`]|['"`]$/g, '');
            const asNum = Number(raw);
            defaults.set(element.getName(), isNaN(asNum) ? raw : asNum);
          }
        }
      }
    }

    // getType().getProperties() works for both interfaces and union type aliases
    const type = propsDecl.getType();
    const members = [];

    for (const sym of type.getProperties()) {
      const name = sym.getName();
      if (isExcludedProp(name)) continue;

      const decls = sym.getDeclarations();
      const firstDecl = decls[0];

      const propType = firstDecl ? firstDecl.getType() : sym.getDeclaredType();
      const typeStr = simplifyType(propType ? propType.getText(firstDecl) : 'unknown');

      const required = firstDecl?.hasQuestionToken
        ? !firstDecl.hasQuestionToken()
        : false;

      let description = '';
      if (firstDecl?.getJsDocs) {
        description = firstDecl
          .getJsDocs()
          .map((j) => j.getDescription().trim())
          .join(' ')
          .trim();
      }

      const member = { name, type: typeStr, description, required };
      if (defaults.has(name)) member.default = defaults.get(name);
      members.push(member);
    }

    return members;
  }

  const sourceFile = project.getSourceFile(mainFile);
  if (sourceFile) {
    const members = extractMembers(sourceFile, `${componentName}Props`);
    if (members.length > 0) result.styled = { members };
  }

  const hookSource = hasHook ? project.getSourceFile(hookFile) : null;
  if (hookSource) {
    const members = extractMembers(hookSource, `Use${componentName}Options`);
    if (members.length > 0) result.hook = { members };
  }

  return Object.keys(result).length > 0 ? result : null;
}

function generateTokenReferences(componentName, componentPath, anatomy) {
  const tokenPath = path.join(componentPath, `${componentName}.tokens.json`);
  const tokenDoc = readJson(tokenPath);
  const prefix = tokenDoc?.prefix || componentName.toLowerCase();
  const tokenPaths = tokenDoc?.tokens
    ? flattenTokenPaths(tokenDoc.tokens).map((token) => `${prefix}.${token}`)
    : [];

  if (tokenPaths.length === 0) {
    return {};
  }

  const tokens = { root: tokenPaths };

  for (const part of anatomy) {
    if (part === 'root') continue;
    const related = tokenPaths.filter((token) => token.includes(`.${part}.`));
    if (related.length > 0) tokens[part] = related;
  }

  return tokens;
}

async function generateContract(componentName, componentPath) {
  const source = allSource(componentPath);
  const scssSource = componentFiles(componentPath)
    .filter((file) => file.endsWith('.module.scss'))
    .map((file) => read(file))
    .join('\n');
  const layer = classifyComponent(componentName, componentPath, source);
  const variants = extractVariants(source);
  const slots = extractSlots(source, componentName);
  const anatomy = extractAnatomy(
    componentName,
    componentPath,
    source,
    variants,
    slots
  );
  const states = extractStates(source, scssSource, variants);
  const a11y = generateA11yInfo(componentName, layer, source);
  const tokens = generateTokenReferences(componentName, componentPath, anatomy);
  const props = await extractPropsViaTs(componentName, componentPath);

  const generated = {
    name: componentName,
    layer,
    anatomy,
    variants,
    states,
    slots,
    a11y,
    tokens,
    ...(props ? { props } : {}),
    ssr: {
      hydrateOn:
        source.includes("'use client'") || source.includes('"use client"')
          ? 'interaction'
          : 'none',
    },
    rtl: {
      flipIcon: anatomy.includes('icon') || anatomy.includes('chevron'),
    },
  };

  // Preserve hand-authored sections from the existing contract
  const contractPath = path.join(componentPath, `${componentName}.contract.json`);
  const existing = readJson(contractPath);
  if (existing) {
    for (const key of PRESERVED_KEYS) {
      if (existing[key] !== undefined && generated[key] === undefined) {
        generated[key] = existing[key];
      }
    }
  }

  return generated;
}

function writeIfChanged(filePath, contract) {
  const next = `${JSON.stringify(contract, null, 2)}\n`;
  const current = read(filePath);

  if (current === next) return false;
  if (!DRY_RUN) fs.writeFileSync(filePath, next);
  return true;
}

function components() {
  return fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((componentName) =>
      fs.existsSync(
        path.join(COMPONENTS_DIR, componentName, `${componentName}.tsx`)
      )
    )
    .sort((a, b) => a.localeCompare(b));
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    console.log(`
Generate or refresh component contract files.

Usage:
  node scripts/generateContracts.mjs [--check] [--dry-run] [--missing-only]

Options:
  --check         Exit non-zero if any contract would change.
  --dry-run       Print changes without writing files.
  --missing-only  Preserve old behavior: only create missing contracts.
`);
    return;
  }

  let changed = 0;
  let unchanged = 0;
  let skipped = 0;
  let created = 0;

  for (const componentName of components()) {
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const contractPath = path.join(
      componentPath,
      `${componentName}.contract.json`
    );
    const exists = fs.existsSync(contractPath);

    if (CREATE_MISSING_ONLY && exists) {
      skipped++;
      continue;
    }

    const contract = await generateContract(componentName, componentPath);
    const didChange = writeIfChanged(contractPath, contract);

    if (didChange) {
      if (exists) changed++;
      else created++;
      console.log(`${DRY_RUN ? 'Would update' : 'Updated'} ${componentName}`);
    } else {
      unchanged++;
    }
  }

  console.log(
    `\nContracts: ${changed} updated, ${created} created, ${unchanged} unchanged, ${skipped} skipped.`
  );

  if (CHECK_ONLY && (changed > 0 || created > 0)) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
