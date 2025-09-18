#!/usr/bin/env node

/**
 * Component Layer Validation Script
 *
 * Validates that components follow the 4-layer framework:
 * - Primitives: Boring, minimal props, token-driven
 * - Compounds: Bundle primitives, avoid mega-props
 * - Composers: Provider + context, slots not props
 * - Assemblies: App-specific, should live in app layer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Assemblies (moved to ui/modules/ - no longer in components)
  // DocLayout: 'assembly', // Now in ui/modules/
  // SideNavigation: 'assembly', // Now in ui/modules/
  // Sidebar: 'assembly', // Now in ui/modules/

  // Special cases
  AspectRatio: 'primitive', // utility primitive
  Image: 'primitive', // enhanced primitive
  Skeleton: 'primitive', // loading primitive
  SlinkyCursor: 'primitive', // interaction primitive
};

class ComponentValidator {
  constructor() {
    this.componentsDir = path.join(__dirname, '../ui/components');
    this.results = {
      aligned: [],
      misaligned: [],
      unclassified: [],
      warnings: [],
    };
  }

  async validate() {
    console.log('🔍 Validating Component Layer Alignment...\n');

    const components = await this.getComponents();

    for (const component of components) {
      await this.validateComponent(component);
    }

    this.printResults();
    return this.results;
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
      this.results.unclassified.push({
        name: componentName,
        reason: 'Not classified in framework',
      });
      return;
    }

    const componentPath = path.join(this.componentsDir, componentName);
    const analysis = await this.analyzeComponent(componentPath, componentName);

    const validation = this.validateAgainstLayer(analysis, expectedLayer);

    if (validation.aligned) {
      this.results.aligned.push({
        name: componentName,
        layer: expectedLayer,
        score: validation.score,
        strengths: validation.strengths,
      });
    } else {
      this.results.misaligned.push({
        name: componentName,
        layer: expectedLayer,
        score: validation.score,
        issues: validation.issues,
        suggestions: validation.suggestions,
      });
    }

    // Add warnings for any issues
    if (validation.warnings?.length > 0) {
      this.results.warnings.push({
        name: componentName,
        warnings: validation.warnings,
      });
    }
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
      hasReadme: false,
      complexity: 'unknown',
    };

    try {
      // Check for main component file
      const mainFile = path.join(componentPath, `${componentName}.tsx`);
      if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf8');

        // Analyze props interface - prioritize base props interface
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
              // Exclude standard accessibility props that are essential for primitives
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

        // Check for composer patterns
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

      // Check for provider file
      const providerFile = path.join(
        componentPath,
        `${componentName}Provider.tsx`
      );
      if (fs.existsSync(providerFile)) {
        analysis.hasProvider = true;
        analysis.hasContext = true;
      }

      // Check for tokens (either source or generated)
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

      // Check for README
      const readmeFile = path.join(componentPath, 'README.md');
      analysis.hasReadme = fs.existsSync(readmeFile);
    } catch (error) {
      console.warn(
        `Warning: Could not analyze ${componentName}:`,
        error.message
      );
    }

    return analysis;
  }

  validateAgainstLayer(analysis, expectedLayer) {
    const validation = {
      aligned: false,
      score: 0,
      strengths: [],
      issues: [],
      suggestions: [],
      warnings: [],
    };

    switch (expectedLayer) {
      case 'primitive':
        return this.validatePrimitive(analysis, validation);
      case 'compound':
        return this.validateCompound(analysis, validation);
      case 'composer':
        return this.validateComposer(analysis, validation);
      case 'assembly':
        return this.validateAssembly(analysis, validation);
      default:
        validation.issues.push('Unknown layer classification');
        return validation;
    }
  }

  validatePrimitive(analysis, validation) {
    let score = 0;

    // Primitives should be boring and minimal
    if (analysis.propCount <= 8) {
      score += 25;
      validation.strengths.push('Minimal prop count');
    } else {
      validation.issues.push(
        `Too many props (${analysis.propCount}), primitives should have ≤8`
      );
    }

    if (analysis.booleanPropCount <= 3) {
      score += 25;
      validation.strengths.push('Reasonable boolean props');
    } else {
      validation.issues.push(
        `Too many boolean props (${analysis.booleanPropCount}), suggests compound/composer`
      );
    }

    if (analysis.hasTokens) {
      score += 25;
      validation.strengths.push('Uses design tokens');
    } else {
      validation.issues.push('Missing design tokens');
      validation.suggestions.push(
        'Add .tokens.json file with design token references'
      );
    }

    // Primitives should NOT have complex patterns
    if (!analysis.hasProvider && !analysis.hasContext) {
      score += 25;
      validation.strengths.push(
        'No complex orchestration (good for primitive)'
      );
    } else {
      validation.issues.push(
        'Has provider/context patterns (suggests composer layer)'
      );
    }

    validation.score = score;
    validation.aligned = score >= 75;

    return validation;
  }

  validateCompound(analysis, validation) {
    let score = 0;

    // Compounds should bundle primitives without explosion
    if (analysis.propCount >= 3 && analysis.propCount <= 12) {
      score += 30;
      validation.strengths.push('Appropriate prop count for bundling');
    } else if (analysis.propCount < 3) {
      validation.issues.push('Too few props, might be better as primitive');
    } else {
      validation.issues.push(
        `Too many props (${analysis.propCount}), suggests composer layer`
      );
    }

    if (analysis.booleanPropCount <= 3) {
      score += 30;
      validation.strengths.push('Avoids boolean prop explosion');
    } else {
      validation.issues.push(
        `Boolean prop explosion (${analysis.booleanPropCount}), should refactor to composer`
      );
    }

    if (analysis.hasTokens) {
      score += 20;
      validation.strengths.push('Uses design tokens');
    } else {
      validation.warnings.push('Consider adding design tokens');
    }

    // Compounds should not have complex orchestration
    if (!analysis.hasProvider) {
      score += 20;
      validation.strengths.push(
        'No provider pattern (appropriate for compound)'
      );
    } else {
      validation.issues.push('Has provider pattern (suggests composer layer)');
    }

    validation.score = score;
    validation.aligned = score >= 70;

    return validation;
  }

  validateComposer(analysis, validation) {
    let score = 0;

    // Composers MUST have provider + context
    if (analysis.hasProvider && analysis.hasContext) {
      score += 40;
      validation.strengths.push('Has provider + context pattern');
    } else {
      validation.issues.push(
        'Missing provider + context pattern (required for composers)'
      );
      validation.suggestions.push('Add Provider component with React Context');
    }

    // Should have slots for composition
    if (analysis.hasSlots) {
      score += 30;
      validation.strengths.push('Uses slot-based composition');
    } else {
      validation.issues.push('Missing slot components');
      validation.suggestions.push(
        'Add slot components (e.g., Component.Trigger, Component.Content)'
      );
    }

    // Should have headless logic
    if (analysis.hasHeadlessHook) {
      score += 20;
      validation.strengths.push('Has headless logic hook');
    } else {
      validation.warnings.push(
        'Consider extracting headless logic to custom hook'
      );
    }

    if (analysis.hasTokens) {
      score += 10;
      validation.strengths.push('Uses design tokens');
    }

    validation.score = score;
    validation.aligned = score >= 80;

    return validation;
  }

  validateAssembly(analysis, validation) {
    // Assemblies should ideally not be in the design system
    validation.warnings.push(
      'Assembly components should live in app layer, not design system'
    );
    validation.suggestions.push(
      'Consider moving to app/components or similar app-specific location'
    );

    validation.score = 50; // Neutral score since they shouldn't be here
    validation.aligned = true; // Don't fail them, just warn

    return validation;
  }

  printResults() {
    console.log('📊 Component Layer Validation Results\n');

    // Summary
    const total =
      this.results.aligned.length +
      this.results.misaligned.length +
      this.results.unclassified.length;
    const alignmentPercentage = Math.round(
      (this.results.aligned.length / total) * 100
    );

    console.log(
      `🎯 Overall Alignment: ${alignmentPercentage}% (${this.results.aligned.length}/${total} components)`
    );
    console.log('');

    // Aligned components
    if (this.results.aligned.length > 0) {
      console.log('✅ Well-Aligned Components:');
      this.results.aligned.forEach((comp) => {
        console.log(`  ${comp.name} (${comp.layer}) - Score: ${comp.score}%`);
        if (comp.strengths.length > 0) {
          console.log(`    Strengths: ${comp.strengths.join(', ')}`);
        }
      });
      console.log('');
    }

    // Misaligned components
    if (this.results.misaligned.length > 0) {
      console.log('❌ Misaligned Components:');
      this.results.misaligned.forEach((comp) => {
        console.log(`  ${comp.name} (${comp.layer}) - Score: ${comp.score}%`);
        if (comp.issues.length > 0) {
          console.log(`    Issues: ${comp.issues.join(', ')}`);
        }
        if (comp.suggestions.length > 0) {
          console.log(`    Suggestions: ${comp.suggestions.join(', ')}`);
        }
      });
      console.log('');
    }

    // Unclassified components
    if (this.results.unclassified.length > 0) {
      console.log('❓ Unclassified Components:');
      this.results.unclassified.forEach((comp) => {
        console.log(`  ${comp.name} - ${comp.reason}`);
      });
      console.log('');
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.results.warnings.forEach((warning) => {
        console.log(`  ${warning.name}:`);
        warning.warnings.forEach((w) => console.log(`    - ${w}`));
      });
      console.log('');
    }

    // Recommendations
    console.log('🚀 Next Steps:');
    if (this.results.misaligned.length > 0) {
      console.log(
        '  1. Address misaligned components by following layer-specific patterns'
      );
    }
    if (this.results.unclassified.length > 0) {
      console.log('  2. Classify unclassified components in the framework');
    }
    if (alignmentPercentage >= 90) {
      console.log(
        '  🎉 Excellent framework alignment! Consider this a model system.'
      );
    } else if (alignmentPercentage >= 80) {
      console.log(
        '  👍 Good framework alignment. A few tweaks will get you to excellence.'
      );
    } else {
      console.log(
        '  📈 Framework alignment needs improvement. Focus on layer-specific patterns.'
      );
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ComponentValidator();
  validator.validate().catch(console.error);
}

export { ComponentValidator };
