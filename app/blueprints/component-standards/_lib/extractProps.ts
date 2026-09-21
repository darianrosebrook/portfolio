import fs from 'fs';
import path from 'path';

export interface ExtractedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ExtractedMethod {
  name: string;
  returnType: string;
  parameters: Array<{ name: string; type: string; required: boolean }>;
  description?: string;
}

/**
 * Extract props from a component's TypeScript source.
 *
 * Documentation-grade extraction by pattern, not a full TypeScript compiler
 * API. Documented limitations, pinned by test/blueprints/extractProps.test.ts:
 * - inline destructured param types (e.g. Field) produce no extractable
 *   declaration and yield []
 * - extends clauses that resolve through non-relative imports (e.g. '@/types/ui',
 *   'react') are skipped, so such inheritance is not documented
 * - a component whose exported Props is a brace-less union alias (e.g. Button)
 *   documents its BaseProps subset
 * - the defaultValue scan is an unanchored whole-file search and can surface a
 *   value from unrelated code using the same identifier
 * A compiler-API rewrite is the follow-up if these limits ever matter more
 * than their simplicity.
 */

export type ImportResolver = (specifier: string) => string | null;

interface DeclarationCandidate {
  name: string;
  header: string;
  body: string;
}

/**
 * Find a props declaration in source text. Preference ladder:
 * 1. a declaration named exactly `{Name}Props` with a brace body
 * 2. a declaration named `{Name}BaseProps` with a brace body
 * 3. the first Props-suffixed declaration with a brace body in file order
 * A brace-less union alias (`type XProps = A | B`) has no body to parse and
 * is skipped by every rung.
 */
function findPropsDeclaration(
  content: string,
  componentName: string
): DeclarationCandidate | null {
  const nameRegex = /(?:export\s+)?(?:interface|type)\s+(\w*Props)\b/g;
  const candidates: DeclarationCandidate[] = [];
  let match: RegExpExecArray | null;
  while ((match = nameRegex.exec(content)) !== null) {
    const name = match[1];
    const declStart = match.index;
    const afterName = match.index + match[0].length;

    // Scan for the first statement delimiter to classify the declaration.
    // A union alias (`= A | B;`) terminates at ';' or '=' before any '{';
    // an interface or object-literal alias reaches its '{' directly.
    let brace = -1;
    for (let i = afterName; i < content.length; i++) {
      const ch = content[i];
      if (ch === '{') {
        brace = i;
        break;
      }
      if (ch === ';') break;
      if (ch === '=') {
        // type alias: a body only exists if '{' precedes ';'
        const semi = content.indexOf(';', i);
        const open = content.indexOf('{', i);
        if (open !== -1 && (semi === -1 || open < semi)) {
          brace = open;
        }
        break;
      }
      if (i - afterName > 500) break; // pathological header guard
    }
    if (brace === -1) continue;
    const header = content.slice(afterName, brace);
    const body = balancedBraces(content, brace);
    if (body === null) continue;
    candidates.push({ name, header, body });
    nameRegex.lastIndex = brace; // resume scanning after this declaration
  }
  if (candidates.length === 0) return null;

  const byName = (n: string) =>
    candidates.find((c) => c.name === n) ?? null;
  return (
    byName(`${componentName}Props`) ??
    byName(`${componentName}BaseProps`) ??
    candidates[0]
  );
}

/** Extract the balanced-brace body starting at `open` (index of '{'). */
function balancedBraces(content: string, open: number): string | null {
  let depth = 0;
  for (let i = open; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return content.slice(open + 1, i);
    }
  }
  return null;
}

/** Parse an `extends ...` clause into type references (top-level comma split). */
function parseExtendsClauses(header: string): string[] {
  const m = header.match(/extends\s+([\s\S]+)$/);
  if (!m) return [];
  const clauses: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of m[1].trim()) {
    if (ch === '<') depth++;
    if (ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      clauses.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) clauses.push(current.trim());
  return clauses;
}

/** Map locally-imported identifier -> relative specifier (alias imports resolve to their original name). */
function buildRelativeImportMap(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const importRegex =
    /import\s+(?:type\s+)?(?:\{([^}]*)\}|(\w+))\s+from\s+['"](\.[^'"]*)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(content)) !== null) {
    const [, namedGroup, defaultGroup, specifier] = m;
    if (namedGroup) {
      for (const part of namedGroup.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const stripped = trimmed.replace(/^type\s+/, '').trim();
        const aliased = stripped.match(/^(\w+)\s+as\s+\w+$/);
        const name = aliased ? aliased[1] : stripped;
        if (name) map.set(name, specifier);
      }
    } else if (defaultGroup) {
      map.set(defaultGroup, specifier);
    }
  }
  return map;
}

/**
 * Parse props from component source text. `resolveImport` maps a relative
 * import specifier to that file's content; when absent (or when it returns
 * null) extends clauses contribute nothing. Inherited files are parsed
 * WITHOUT a resolver: extends resolution is one level deep by design.
 * Own members win over inherited on name collisions; inherited members are
 * appended after own ones.
 */
export function parsePropsFromContent(
  content: string,
  componentName: string,
  resolveImport?: ImportResolver
): ExtractedProp[] {
  const declaration = findPropsDeclaration(content, componentName);
  if (!declaration) return [];

  const props = parseDeclarationBody(declaration.body, content);

  const header = declaration.header;
  const clauses = parseExtendsClauses(header);
  if (clauses.length === 0 || !resolveImport) return props;

  const importMap = buildRelativeImportMap(content);
  const inherited: ExtractedProp[] = [];
  for (const clause of clauses) {
    const omitted = new Set<string>();
    let baseName: string | null = null;

    const omitMatch = clause.match(/^Omit\s*<([\s\S]*)>$/);
    if (omitMatch) {
      baseName = (omitMatch[1].match(/^\s*([A-Z][\w.]*)/) ?? [])[1] ?? null;
      for (const om of omitMatch[1].matchAll(/'([^']+)'/g)) {
        omitted.add(om[1]);
      }
    } else {
      baseName = (clause.match(/^([A-Z][\w.]*)/) ?? [])[1] ?? null;
    }

    if (!baseName || baseName.includes('.')) continue;
    const specifier = importMap.get(baseName);
    if (!specifier) continue;
    const baseContent = resolveImport(specifier);
    if (!baseContent) continue;
    const baseDeclaration = findPropsDeclaration(baseContent, baseName);
    if (!baseDeclaration) continue;
    for (const prop of parseDeclarationBody(
      baseDeclaration.body,
      baseContent
    )) {
      if (!omitted.has(prop.name)) inherited.push(prop);
    }
  }

  const seen = new Set(props.map((p) => p.name));
  for (const prop of inherited) {
    if (!seen.has(prop.name)) {
      seen.add(prop.name);
      props.push(prop);
    }
  }
  return props;
}

/** Parse one declaration body into props (line-oriented, per current docs contract). */
function parseDeclarationBody(
  body: string,
  fullContent: string
): ExtractedProp[] {
  const props: ExtractedProp[] = [];

  // Extract JSDoc comments above the interface
  const interfaceJsdoc = fullContent.match(
    /\/\*\*([\s\S]*?)\*+\/\s*(?:interface|type)\s+\w*Props/
  );

  const propLines = body.split('\n').filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed.length > 0 &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('/**') &&
      !trimmed.startsWith('*/')
    );
  });

  for (const line of propLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '{' || trimmed === '}') continue;

    // Skip extends clauses
    if (trimmed.startsWith('extends')) continue;

    // Match prop pattern: name?: type or name: type
    const propMatch = trimmed.match(/^(\w+)(\?)?\s*:\s*(.+?)(;|,)?$/);
    if (!propMatch) continue;

    const [, name, optional, typeRaw] = propMatch;
    const required = !optional;

    // Extract JSDoc for this prop
    let description: string | undefined;
    if (interfaceJsdoc) {
      const propJsdocRegex = new RegExp(
        `\\*\\s+@param\\s+${name}\\s+([^\\n]+)|\\*\\s+${name}\\s*[:-]\\s*([^\\n]+)`,
        'i'
      );
      const propJsdocMatch = interfaceJsdoc[0].match(propJsdocRegex);
      if (propJsdocMatch) {
        description = (propJsdocMatch[1] || propJsdocMatch[2] || '').trim();
      }
    }

    // Clean up type (remove extra whitespace, handle unions)
    const type = typeRaw.trim().replace(/\s+/g, ' ');

    // Known limitation (unanchored whole-file scan): may surface a default
    // from unrelated code using the same identifier. See the file docblock.
    let defaultValue: string | undefined;
    const defaultValueMatch = fullContent.match(
      new RegExp(`${name}\\s*=\\s*([^,;\\n}]+)`, 'm')
    );
    if (defaultValueMatch) {
      defaultValue = defaultValueMatch[1].trim();
    }

    props.push({
      name,
      type,
      required,
      defaultValue: defaultValue || undefined,
      description,
    });
  }

  return props;
}

/**
 * Extract props from a component's TypeScript file on disk. Reads
 * `{componentPath}/{componentName}.tsx` and resolves relative extends
 * through sibling files, one level deep.
 */
export function extractProps(
  componentPath: string,
  componentName: string
): ExtractedProp[] {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (!fs.existsSync(mainFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8');
    return parsePropsFromContent(
      content,
      componentName,
      createFsImportResolver(path.dirname(mainFile))
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Error extracting props for ${componentName}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
    return [];
  }
}

/**
 * Build an ImportResolver that reads files relative to `fromDir`, resolving
 * relative specifiers only (bare and alias specifiers return null). Handles
 * sibling files (`./X` -> `X.tsx`/`X.ts`), directory modules
 * (`../Input` -> `../Input/Input.tsx`), and index files.
 */
function createFsImportResolver(fromDir: string): ImportResolver {
  return (specifier: string): string | null => {
    if (!specifier.startsWith('.')) return null;
    const absBase = path.resolve(fromDir, specifier);
    const candidates = fs.existsSync(absBase) &&
      fs.statSync(absBase).isDirectory()
      ? [
          path.join(absBase, `${path.basename(absBase)}.tsx`),
          path.join(absBase, `${path.basename(absBase)}.ts`),
          path.join(absBase, 'index.tsx'),
          path.join(absBase, 'index.ts'),
        ]
      : [absBase, `${absBase}.tsx`, `${absBase}.ts`];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        try {
          return fs.readFileSync(candidate, 'utf8');
        } catch {
          return null;
        }
      }
    }
    return null;
  };
}

/**
 * Extract methods from a component's TypeScript file.
 * Looks for exported functions or class methods.
 */
export function extractMethods(
  componentPath: string,
  componentName: string
): ExtractedMethod[] {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (!fs.existsSync(mainFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8');
    const methods: ExtractedMethod[] = [];

    // Look for exported functions that might be methods
    // This is simplified - in a real implementation, use TypeScript compiler API
    const functionRegex =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\{/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const [, name, params, returnType] = match;

      // Skip if it's the main component function
      if (name === componentName) continue;

      const parameters: ExtractedMethod['parameters'] = [];
      if (params && params.trim()) {
        const paramParts = params.split(',');
        for (const param of paramParts) {
          const paramMatch = param.trim().match(/^(\w+)(\?)?\s*:\s*(.+)$/);
          if (paramMatch) {
            const [, paramName, optional, paramType] = paramMatch;
            parameters.push({
              name: paramName,
              type: paramType.trim(),
              required: !optional,
            });
          }
        }
      }

      methods.push({
        name,
        returnType: returnType?.trim() || 'void',
        parameters,
      });
    }

    return methods;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Error extracting methods for ${componentName}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
    return [];
  }
}

/**
 * Get props and methods for a component.
 */
export function getComponentAPI(
  componentName: string,
  componentPath?: string
): {
  props: ExtractedProp[];
  methods: ExtractedMethod[];
} {
  // If no path provided, try to find it
  const resolvedPath =
    componentPath || path.join(process.cwd(), 'ui/components', componentName);

  return {
    props: extractProps(resolvedPath, componentName),
    methods: extractMethods(resolvedPath, componentName),
  };
}
