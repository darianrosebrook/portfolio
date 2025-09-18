#!/usr/bin/env node

/**
 * Component Layer Scaffolding Script
 *
 * Creates component scaffolds following the 4-layer framework:
 * - Primitives: Boring, stable, minimal props, design tokens only
 * - Compounds: Bundle primitives, codify conventions, avoid mega-props
 * - Composers: Orchestrate state/interaction/context, provider pattern
 * - Assemblies: Application-specific flows, use system components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LAYERS = {
  primitive: {
    description: 'Irreducible building blocks',
    files: [
      '{{componentName}}.tsx',
      '{{componentName}}.module.scss',
      'index.tsx',
      'README.md',
    ],
    templates: [
      'primitive.template.tsx',
      'primitive.template.scss',
      'index.template.tsx',
      'README.primitive.template.md',
    ],
  },
  compound: {
    description: 'Predictable bundles of primitives',
    files: [
      '{{componentName}}.tsx',
      '{{componentName}}.module.scss',
      'index.tsx',
      'README.md',
    ],
    templates: [
      'compound.template.tsx',
      'primitive.template.scss',
      'index.template.tsx',
      'README.primitive.template.md',
    ],
  },
  composer: {
    description: 'Orchestrate state, interaction, and context',
    files: [
      '{{componentName}}.tsx',
      '{{componentName}}.module.scss',
      'use{{componentName}}.ts',
      '{{componentName}}Provider.tsx',
      'index.tsx',
      'README.md',
    ],
    templates: [
      'composer.template.tsx',
      'primitive.template.scss',
      'composer.hook.template.ts',
      'composer.provider.template.tsx',
      'index.template.tsx',
      'README.composer.template.md',
    ],
  },
  assembly: {
    description: 'Application-specific flows',
    files: [
      '{{componentName}}.tsx',
      '{{componentName}}.module.scss',
      'index.tsx',
      'README.md',
    ],
    templates: [
      'assembly.template.tsx',
      'primitive.template.scss',
      'index.template.tsx',
      'README.primitive.template.md',
    ],
  },
};

function showUsage() {
  console.log(`
Usage: node scaffoldComponentLayer.mjs <layer> <ComponentName> [options]

Layers:
  primitive  - Irreducible building blocks (Button, Input, Icon)
  compound   - Predictable bundles (TextField, Card, Alert) 
  composer   - Orchestration with context (Modal, Select, Tabs)
  assembly   - Application flows (CheckoutFlow, Onboarding)

Options:
  --description "Component description"
  --functionality "What it does"
  --use-cases "When to use it"
  --html-element "div|button|input" (for primitives)

Examples:
  node scaffoldComponentLayer.mjs primitive Badge --description "Status indicator"
  node scaffoldComponentLayer.mjs composer Dropdown --description "Dropdown menu"
  node scaffoldComponentLayer.mjs assembly UserOnboarding --description "User setup flow"
`);
}

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    showUsage();
    process.exit(1);
  }

  const [layer, componentName, ...options] = args;

  if (!LAYERS[layer]) {
    console.error(`❌ Invalid layer: ${layer}`);
    console.error(`Valid layers: ${Object.keys(LAYERS).join(', ')}`);
    process.exit(1);
  }

  // Parse options
  const config = {
    layer,
    componentName,
    description: 'Component description',
    functionality: 'basic functionality',
    useCases: 'General use cases',
    htmlElement: 'div',
  };

  for (let i = 0; i < options.length; i += 2) {
    const key = options[i]?.replace('--', '');
    const value = options[i + 1];
    if (key && value) {
      config[key.replace('-', '')] = value;
    }
  }

  return config;
}

function createTemplateVariables(config) {
  const {
    componentName,
    layer,
    description,
    functionality,
    useCases,
    htmlElement,
  } = config;

  return {
    componentName,
    componentNameLower: componentName.toLowerCase(),
    layer: layer.charAt(0).toUpperCase() + layer.slice(1),
    layerDescription: LAYERS[layer].description,
    description,
    functionality,
    useCases,
    htmlElement: htmlElement.charAt(0).toUpperCase() + htmlElement.slice(1),
    htmlElementLower: htmlElement.toLowerCase(),
    isPrimitive: layer === 'primitive',
    isCompound: layer === 'compound',
    isComposer: layer === 'composer',
    isAssembly: layer === 'assembly',
  };
}

function replaceTemplateVars(content, vars) {
  let result = content;

  // Replace simple variables
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  // Handle conditional blocks (simplified handlebars-like syntax)
  result = result.replace(
    /{{#if (\w+)}}([\s\S]*?){{\/if}}/g,
    (match, condition, content) => {
      return vars[condition] ? content : '';
    }
  );

  return result;
}

function scaffoldComponent(config) {
  const { layer, componentName } = config;
  const layerConfig = LAYERS[layer];
  const templateVars = createTemplateVariables(config);

  // Create component directory
  const componentDir = path.join(
    process.cwd(),
    'ui',
    'components',
    componentName
  );

  if (fs.existsSync(componentDir)) {
    console.error(`❌ Component directory already exists: ${componentDir}`);
    process.exit(1);
  }

  fs.mkdirSync(componentDir, { recursive: true });
  console.log(`📁 Created directory: ${componentDir}`);

  // Generate files from templates
  layerConfig.files.forEach((fileName, index) => {
    const templateName = layerConfig.templates[index];
    const templatePath = path.join(__dirname, 'templates', templateName);

    if (!fs.existsSync(templatePath)) {
      console.warn(`⚠️  Template not found: ${templatePath}`);
      return;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const processedContent = replaceTemplateVars(templateContent, templateVars);
    const processedFileName = replaceTemplateVars(fileName, templateVars);
    const filePath = path.join(componentDir, processedFileName);

    fs.writeFileSync(filePath, processedContent);
    console.log(`✅ Created: ${processedFileName}`);
  });

  console.log(`
🎉 Successfully scaffolded ${layer} component: ${componentName}

Next steps:
1. Review generated files in: ${componentDir}
2. Customize the implementation for your specific needs
3. Update design tokens in the SCSS file
4. Add component to the showcase
5. Write tests following the layer patterns

Layer Guidelines:
${getLayerGuidelines(layer)}
`);
}

function getLayerGuidelines(layer) {
  const guidelines = {
    primitive: `
• Keep it boring and stable - minimal API changes
• Use design tokens for all styling
• No complex logic or orchestration
• Essential props only (size, variant, disabled)
• Built-in accessibility (ARIA, keyboard support)`,

    compound: `
• Bundle primitives into predictable patterns
• Avoid "mega-props" - use composition instead
• Codify common conventions
• Provide structured sub-components (Header, Body, Footer)
• No complex state management`,

    composer: `
• Use provider pattern for orchestration
• Separate logic into headless hooks
• Provide slots for flexible composition
• Coordinate multiple children through context
• Handle complex interactions (keyboard nav, focus management)`,

    assembly: `
• Combine system components to solve app problems
• Live at the application layer, not in the design system
• Handle complete user flows and workflows
• Use primitives, compounds, and composers as building blocks
• Application-specific logic and validation`,
  };

  return guidelines[layer] || '';
}

// Main execution
try {
  const config = parseArgs();
  scaffoldComponent(config);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
