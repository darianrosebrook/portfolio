/**
 * Runtime deriver for agent-facing component descriptors.
 *
 * Given a component contract object, produces a descriptor that is safe for
 * consumption by AI agents and design tools — pruned to the intentional API
 * surface, with type information resolved from the contract's own type aliases.
 *
 * Key design decision (mirroring component-converter's refactor):
 * Agent-facing `accepts`/`enum` values are DERIVED from existing contract fields
 * (TS type strings + contract.types) rather than hand-authored per-prop.
 * Only `nodeKind` remains as a manual disambiguation escape hatch.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type A2UIValueKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'node-ref'
  | 'icon-ref'
  | 'function'
  | 'object'
  | 'unknown';

export interface A2UIPropDescriptor {
  name: string;
  description: string;
  required: boolean;
  accepts: A2UIValueKind[];
  enum?: string[];
  default?: string | number | boolean;
}

export interface A2UIEventDescriptor {
  source: 'channel' | 'event';
  valueType?: string;
  notes?: string;
}

export interface A2UIChildrenDescriptor {
  allowed?: string[];
  slot?: string;
  accepts?: string[];
  min?: number;
  max?: number;
}

export interface A2UIDescriptor {
  name: string;
  layer: string;
  props: A2UIPropDescriptor[];
  events: Record<string, A2UIEventDescriptor>;
  children?: A2UIChildrenDescriptor;
}

// ── Contract type (minimal, matching component.contract.schema.json) ────────

interface PropMember {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: string | number | boolean;
  nodeKind?: 'node-ref' | 'icon-ref';
}

interface TypeDef {
  kind: 'union' | 'enum' | 'alias';
  values?: string[];
  alias?: string;
}

interface ControlledChannel {
  value: string;
  onChange: string;
  defaultValue?: string;
  enabledBy?: string;
  valueType?: string;
  notes?: string;
}

export interface ComponentContract {
  name: string;
  layer: string;
  props?: Record<string, { members: PropMember[] }>;
  types?: Record<string, TypeDef>;
  channels?: Record<string, ControlledChannel>;
  a11y?: {
    role?: string;
    labeling?: string[];
    keyboard?: Array<string | { key: string; when: string; then: string }>;
  };
  [key: string]: unknown;
}

// ── Prop exclusion rules ────────────────────────────────────────────────────

const EXCLUDED_PROP_NAMES = new Set([
  'className', 'style', 'id', 'key', 'ref', 'children',
  'data-testid', 'tabIndex',
]);
const EXCLUDED_PROP_PATTERNS = [/^aria-/, /^data-/, /^on[A-Z]/, /Ref$/];

function isExcluded(name: string): boolean {
  if (EXCLUDED_PROP_NAMES.has(name)) return true;
  return EXCLUDED_PROP_PATTERNS.some((re) => re.test(name));
}

// ── Type string → A2UIValueKind[] ──────────────────────────────────────────

function parseTypeString(
  typeStr: string,
  typeAliases: Record<string, TypeDef>,
  nodeKind?: 'node-ref' | 'icon-ref',
): { accepts: A2UIValueKind[]; enumValues?: string[] } {
  if (nodeKind === 'node-ref') return { accepts: ['node-ref'] };
  if (nodeKind === 'icon-ref') return { accepts: ['icon-ref'] };

  // Strip undefined from optional types for analysis
  const base = typeStr
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s !== 'undefined' && s !== 'null');

  const accepts = new Set<A2UIValueKind>();
  const enumValues: string[] = [];

  for (const part of base) {
    // String literal
    if (/^['"`]/.test(part)) {
      accepts.add('enum');
      enumValues.push(part.replace(/^['"`]|['"`]$/g, ''));
      continue;
    }
    // Primitive keywords
    if (part === 'string') { accepts.add('string'); continue; }
    if (part === 'number') { accepts.add('number'); continue; }
    if (part === 'boolean') { accepts.add('boolean'); continue; }
    // React node / element
    if (/^React(Node|Element)|^ReactNode/.test(part)) {
      accepts.add('node-ref');
      continue;
    }
    // Function types
    if (/=>|\bFunction\b/.test(part)) {
      accepts.add('function');
      continue;
    }
    // Named type alias — look up in contract.types
    if (typeAliases[part]) {
      const alias = typeAliases[part];
      if (alias.kind === 'union' || alias.kind === 'enum') {
        accepts.add('enum');
        enumValues.push(...(alias.values ?? []));
      } else if (alias.alias) {
        const { accepts: inner, enumValues: innerEnum } = parseTypeString(alias.alias, typeAliases);
        inner.forEach((k) => accepts.add(k));
        if (innerEnum) enumValues.push(...innerEnum);
      }
      continue;
    }
    // Object / record / generic
    if (/^Record|^\{|^Map<|^Set</.test(part)) {
      accepts.add('object');
      continue;
    }
    // Anything else
    accepts.add('unknown');
  }

  if (accepts.size === 0) accepts.add('unknown');

  return {
    accepts: [...accepts],
    ...(enumValues.length > 0 ? { enumValues } : {}),
  };
}

// ── Deriver ─────────────────────────────────────────────────────────────────

/**
 * Derive an agent-facing descriptor from a component contract.
 * Pure function — reads contract, returns descriptor.
 */
export function deriveDescriptor(contract: ComponentContract): A2UIDescriptor {
  const typeAliases = contract.types ?? {};

  // --- Props ---
  const styledMembers = contract.props?.styled?.members ?? [];
  const props: A2UIPropDescriptor[] = [];

  for (const member of styledMembers) {
    if (isExcluded(member.name)) continue;

    const { accepts, enumValues } = parseTypeString(
      member.type,
      typeAliases,
      member.nodeKind,
    );

    const descriptor: A2UIPropDescriptor = {
      name: member.name,
      description: member.description,
      required: member.required ?? false,
      accepts,
    };

    if (enumValues && enumValues.length > 0) descriptor.enum = enumValues;
    if (member.default !== undefined) descriptor.default = member.default;

    props.push(descriptor);
  }

  // --- Events (channels + named events merged) ---
  const events: Record<string, A2UIEventDescriptor> = {};

  for (const [channelName, channel] of Object.entries(contract.channels ?? {})) {
    events[channelName] = {
      source: 'channel',
      ...(channel.valueType ? { valueType: channel.valueType } : {}),
      ...(channel.notes ? { notes: channel.notes } : {}),
    };
  }

  // --- Descriptor ---
  return {
    name: contract.name,
    layer: contract.layer,
    props,
    events,
  };
}

/**
 * Derive descriptors for all contracts and key them by component name.
 */
export function deriveRegistry(
  contracts: ComponentContract[],
): Record<string, A2UIDescriptor> {
  return Object.fromEntries(
    contracts.map((c) => [c.name, deriveDescriptor(c)]),
  );
}
