#!/usr/bin/env node
/**
 * validateComponentLayers.mjs
 *
 * Diagnostic aid for the four-layer component framework.
 * NOT a quality gate — conclusions are heuristics based on prop counts,
 * string matches, and a hardcoded classification registry.
 * Run `caws validate` for gate status.
 *
 * Usage:
 *   node scripts/validateComponentLayers.mjs           # human-readable summary
 *   node scripts/validateComponentLayers.mjs --json    # JSON array, one object per component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_MODE = process.argv.includes('--json');

// Component layer definitions
const LAYER_DEFINITIONS = {
  primitive: {
    name: 'Primitive',
    description: 'Irreducible building blocks',
    rules: [
      'Should have minimal, essential props only',
      'Must use design tokens, no hardcoded values',
      'Should be boring and stable',
      'No complex orchestration logic',
      'Maximum 8 props (excluding HTML attributes)',
    ],
    examples: ['Button', 'Input', 'Checkbox', 'Icon', 'Text'],
  },
  compound: {
    name: 'Compound',
    description: 'Predictable bundles of primitives',
    rules: [
      'Should bundle 2-4 primitives together',
      'Avoid boolean prop explosion (max 3 booleans)',
      'Should codify conventions',
      'No complex state orchestration',
      'Should have predictable sub-components',
    ],
    examples: ['TextField', 'Card', 'Alert', 'Breadcrumbs'],
  },
  composer: {
    name: 'Composer',
    description: 'Orchestrate state and interaction',
    rules: [
      'Must have Provider + Context pattern',
      'Should use slots for composition',
      'Should orchestrate multiple children',
      'Must handle complex state/interaction',
      'Should have headless logic hook',
    ],
    examples: ['Field', 'Select', 'Details', 'OTP', 'Walkthrough'],
  },
  assembly: {
    name: 'Assembly',
    description: 'Application-specific flows',
    rules: [
      'Should live in app layer, not design system',
      'Product-specific business logic',
      'Uses system components but not part of system',
      'Volatile requirements',
    ],
    examples: ['DocLayout', 'SideNavigation', 'Sidebar'],
  },
};

// Known component classifications
const COMPONENT_CLASSIFICATIONS = {
  // Primitives
  Button: 'primitive',
  Input: 'primitive',
  Checkbox: 'primitive',
  Icon: 'primitive',
  Text: 'primitive',
  Divider: 'primitive',
  Spinner: 'primitive',
  Avatar: 'primitive',
  Badge: 'primitive',
  Progress: 'primitive',
  Switch: 'primitive',
  Label: 'primitive',

  // Compounds
  TextField: 'compound',
  Card: 'compound',
  Alert: 'compound',
  AlertNotice: 'compound',
  Breadcrumbs: 'compound',
  List: 'compound',
  Blockquote: 'compound',
  Links: 'compound',
  Postcard: 'compound',
  ProfileFlag: 'compound',
  ShowMore: 'compound',
  Shuttle: 'compound',
  Status: 'compound',
  ToggleSwitch: 'compound',
  Truncate: 'compound',
  VisuallyHidden: 'compound',

  // Composers
  Field: 'composer',
  Select: 'composer',
  Details: 'composer',
  OTP: 'composer',
  Walkthrough: 'composer',
  Tabs: 'composer',
  Dialog: 'composer',
  Popover: 'composer',
  Toast: 'composer',
  Tooltip: 'compound',

  // Special cases
  AspectRatio: 'primitive', // utility primitive
  Image: 'primitive', // enhanced primitive
  Skeleton: 'primitive', // loading primitive
  SlinkyCursor: 'primitive', // interaction primitive
};

/**
 * Each signal has:
 *   id          — stable identifier for the check
 *   status      — "pass" | "flag"
 *   confidence  — "structural" (file-system observable) | "heuristic" (regex/count)
 *   required    — internal only; true = flag → result escalates to review_required
 */

class ComponentValidator {
  constructor() {
    this.componentsDir = path.join(__dirname, '../ui/components');
    // Each entry: { component, expectedLayer, result, signals }
    this.records = [];
  }

  async validate() {
    const components = await this.getComponents();
    for (const component of components) {
      this.records.push(await this.validateComponent(component));
    }
    return this.records;
  }

  async getComponents() {
    const entries = fs.readdirSync(this.componentsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !name.startsWith('.'));
  }

  async validateComponent(componentName) {
    const expectedLayer = COMPONENT_CLASSIFICATIONS[componentName];

    if (!expectedLayer) {
      return {
        component: componentName,
        expectedLayer: null,
        result: 'unclassified',
        signals: [],
      };
    }

    if (expectedLayer === 'assembly') {
      return {
        component: componentName,
        expectedLayer: 'assembly',
        result: 'assembly',
        signals: [
          {
            id: 'assembly-placement',
            status: 'flag',
            confidence: 'structural',
          },
        ],
      };
    }

    const componentPath = path.join(this.componentsDir, componentName);
    const analysis = await this.analyzeComponent(componentPath, componentName);
    const rawSignals = this.buildSignals(analysis, expectedLayer);

    // Derive result from signals
    const hasRequiredFlag = rawSignals.some(
      (s) => s.required && s.status === 'flag'
    );
    const hasAnyFlag = rawSignals.some((s) => s.status === 'flag');
    const result = hasRequiredFlag
      ? 'review_required'
      : hasAnyFlag
        ? 'flag'
        : 'pass';

    // Strip the internal `required` field from output
    const signals = rawSignals.map(({ id, status, confidence }) => ({
      id,
      status,
      confidence,
    }));

    return { component: componentName, expectedLayer, result, signals };
  }

  async analyzeComponent(componentPath, componentName) {
    const analysis = {
      name: componentName,
      hasProvider: false,
      hasContext: false,
      hasSlots: false,
      hasHeadlessHook: false,
      propCount: 0,
      booleanPropCount: 0,
      hasTokens: false,
    };

    try {
      const mainFile = path.join(componentPath, `${componentName}.tsx`);
      if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf8');

        const basePropsMatch = content.match(
          /interface\s+\w*BaseProps[^{]*\{([^}]+)\}/s
        );
        const fallbackPropsMatch = content.match(
          /interface\s+\w*Props[^{]*\{([^}]+)\}/s
        );
        const propsMatch = basePropsMatch || fallbackPropsMatch;
        if (propsMatch) {
          const propsContent = propsMatch[1];
          const props = propsContent
            .split('\n')
            .map((line) => line.trim())
            .filter(
              (line) =>
                line &&
                !line.startsWith('//') &&
                !line.startsWith('*') &&
                !line.startsWith('extends')
            )
            .filter((line) => line.includes(':') || line.includes('?'))
            .filter((line) => {
              const accessibilityProps = [
                'ariaLabel',
                'ariaExpanded',
                'ariaPressed',
                'role',
                'title',
              ];
              return !accessibilityProps.some((prop) => line.includes(prop));
            });

          analysis.propCount = props.length;
          analysis.booleanPropCount = props.filter(
            (prop) =>
              prop.includes('boolean') ||
              (prop.includes('?:') &&
                (prop.includes('true') || prop.includes('false')))
          ).length;
        }

        // String-based detection — all heuristic
        analysis.hasProvider =
          content.includes('Provider') || content.includes('Context');
        analysis.hasContext =
          content.includes('useContext') || content.includes('createContext');
        analysis.hasSlots =
          content.includes('.displayName') && content.includes('=');
        analysis.hasHeadlessHook =
          content.includes('use' + componentName) ||
          fs.existsSync(path.join(componentPath, `use${componentName}.ts`));
      }

      const providerFile = path.join(
        componentPath,
        `${componentName}Provider.tsx`
      );
      if (fs.existsSync(providerFile)) {
        analysis.hasProvider = true;
        analysis.hasContext = true;
      }

      // File-existence checks are structural
      const tokensFile = path.join(
        componentPath,
        `${componentName}.tokens.json`
      );
      const generatedTokensFile = path.join(
        componentPath,
        `${componentName}.tokens.generated.scss`
      );
      analysis.hasTokens =
        fs.existsSync(tokensFile) || fs.existsSync(generatedTokensFile);
    } catch {
      // analysis stays at defaults
    }

    return analysis;
  }

  buildSignals(analysis, expectedLayer) {
    switch (expectedLayer) {
      case 'primitive':
        return this.primitiveSignals(analysis);
      case 'compound':
        return this.compoundSignals(analysis);
      case 'composer':
        return this.composerSignals(analysis);
      default:
        return [];
    }
  }

  primitiveSignals(analysis) {
    return [
      {
        id: 'prop-count',
        status: analysis.propCount <= 8 ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'boolean-prop-count',
        status: analysis.booleanPropCount <= 3 ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'token-files',
        status: analysis.hasTokens ? 'pass' : 'flag',
        confidence: 'structural',
        required: false,
      },
      {
        id: 'no-orchestration',
        status: !analysis.hasProvider && !analysis.hasContext ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
    ];
  }

  compoundSignals(analysis) {
    const propInRange = analysis.propCount >= 3 && analysis.propCount <= 12;
    return [
      {
        id: 'prop-count',
        status: propInRange ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'boolean-prop-count',
        status: analysis.booleanPropCount <= 3 ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'token-files',
        status: analysis.hasTokens ? 'pass' : 'flag',
        confidence: 'structural',
        required: false,
      },
      {
        id: 'no-provider',
        status: !analysis.hasProvider ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
    ];
  }

  composerSignals(analysis) {
    return [
      {
        id: 'provider-context',
        status: analysis.hasProvider && analysis.hasContext ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'slot-detection',
        status: analysis.hasSlots ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: true,
      },
      {
        id: 'headless-hook',
        status: analysis.hasHeadlessHook ? 'pass' : 'flag',
        confidence: 'heuristic',
        required: false,
      },
      {
        id: 'token-files',
        status: analysis.hasTokens ? 'pass' : 'flag',
        confidence: 'structural',
        required: false,
      },
    ];
  }

  printResults(records) {
    const pass = records.filter((r) => r.result === 'pass');
    const flags = records.filter((r) => r.result === 'flag');
    const reviewRequired = records.filter(
      (r) => r.result === 'review_required'
    );
    const unclassified = records.filter((r) => r.result === 'unclassified');
    const assembly = records.filter((r) => r.result === 'assembly');

    console.log(
      `${pass.length} pass, ${flags.length} flags, ${reviewRequired.length} review-required, ` +
        `${unclassified.length} unclassified — run caws validate for gate status.\n`
    );

    if (pass.length > 0) {
      console.log('pass:');
      pass.forEach((r) => console.log(`  ${r.component} (${r.expectedLayer})`));
      console.log('');
    }

    if (flags.length > 0) {
      console.log('flags:');
      flags.forEach((r) => {
        console.log(`  ${r.component} (${r.expectedLayer})`);
        r.signals
          .filter((s) => s.status === 'flag')
          .forEach((s) => console.log(`    ${s.id} [${s.confidence}]`));
      });
      console.log('');
    }

    if (reviewRequired.length > 0) {
      console.log('review-required:');
      reviewRequired.forEach((r) => {
        console.log(`  ${r.component} (${r.expectedLayer})`);
        r.signals
          .filter((s) => s.status === 'flag')
          .forEach((s) => console.log(`    ${s.id} [${s.confidence}]`));
      });
      console.log('');
    }

    if (unclassified.length > 0) {
      console.log('unclassified:');
      unclassified.forEach((r) => console.log(`  ${r.component}`));
      console.log('');
    }

    if (assembly.length > 0) {
      console.log('assembly (not counted in totals):');
      assembly.forEach((r) => console.log(`  ${r.component}`));
      console.log('');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ComponentValidator();
  validator
    .validate()
    .then((records) => {
      if (JSON_MODE) {
        console.log(JSON.stringify(records, null, 2));
      } else {
        validator.printResults(records);
      }
    })
    .catch(console.error);
}
