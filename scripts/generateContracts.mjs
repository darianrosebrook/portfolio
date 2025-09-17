#!/usr/bin/env node
/**
 * Generate Contract Files for Existing Components
 * Creates ComponentName.contract.json files following the schema in COMPONENT_STANDARDS.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../ui/components');

// Component layer classification heuristics
function classifyComponent(componentName, componentPath) {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);

  if (!fs.existsSync(mainFile)) {
    return 'primitive'; // default fallback
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8');

    // Composer indicators
    if (
      content.includes('Provider') ||
      content.includes('Context') ||
      content.includes('createContext')
    ) {
      return 'composer';
    }

    // Compound indicators - multiple sub-components
    const subComponentFiles = fs
      .readdirSync(componentPath)
      .filter(
        (file) =>
          file.endsWith('.tsx') &&
          file !== 'index.tsx' &&
          file !== `${componentName}.tsx`
      );

    if (subComponentFiles.length > 0) {
      return 'compound';
    }

    return 'primitive';
  } catch (error) {
    console.warn(`Error reading ${componentName}: ${error.message}`);
    return 'primitive';
  }
}

// Extract component anatomy from implementation
function extractAnatomy(componentName, componentPath) {
  const scssFile = path.join(componentPath, `${componentName}.module.scss`);
  const anatomy = ['root'];

  if (fs.existsSync(scssFile)) {
    try {
      const content = fs.readFileSync(scssFile, 'utf8');

      // Look for common anatomy patterns in CSS classes
      const classMatches = content.match(
        /\.[a-zA-Z][a-zA-Z0-9]*(?:[A-Z][a-z]*)*\s*{/g
      );
      if (classMatches) {
        const classes = classMatches.map((match) =>
          match.replace(/^\./, '').replace(/\s*{$/, '')
        );

        // Filter out the main component class and add unique parts
        const componentClass = componentName.toLowerCase();
        const parts = classes
          .filter(
            (cls) =>
              cls !== componentClass &&
              !cls.includes('hover') &&
              !cls.includes('focus')
          )
          .slice(0, 5); // limit to reasonable number

        anatomy.push(...parts);
      }
    } catch (error) {
      console.warn(`Error reading SCSS for ${componentName}: ${error.message}`);
    }
  }

  return [...new Set(anatomy)]; // remove duplicates
}

// Extract variants from TypeScript interface
function extractVariants(componentName, componentPath) {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  const variants = {};

  if (fs.existsSync(mainFile)) {
    try {
      const content = fs.readFileSync(mainFile, 'utf8');

      // Look for variant prop definitions
      const variantMatch = content.match(
        /variant\?\s*:\s*['"`]([^'"`]+)['"`](?:\s*\|\s*['"`]([^'"`]+)['"`])*/
      );
      if (variantMatch) {
        const variantValues = content.match(
          /variant\?\s*:\s*(['"`][^'"`]+['"`](?:\s*\|\s*['"`][^'"`]+['"`])*)/
        );
        if (variantValues) {
          const values = variantValues[1]
            .match(/['"`]([^'"`]+)['"`]/g)
            ?.map((v) => v.replace(/['"`]/g, ''));
          if (values) {
            variants.variant = values;
          }
        }
      }

      // Look for size prop definitions
      const sizeMatch = content.match(
        /size\?\s*:\s*(['"`][^'"`]+['"`](?:\s*\|\s*['"`][^'"`]+['"`])*)/
      );
      if (sizeMatch) {
        const values = sizeMatch[1]
          .match(/['"`]([^'"`]+)['"`]/g)
          ?.map((v) => v.replace(/['"`]/g, ''));
        if (values) {
          variants.size = values;
        }
      }
    } catch (error) {
      console.warn(
        `Error extracting variants for ${componentName}: ${error.message}`
      );
    }
  }

  return variants;
}

// Generate accessibility info based on component type
function generateA11yInfo(componentName, layer) {
  const name = componentName.toLowerCase();

  // Interactive components
  if (name.includes('button')) {
    return {
      role: 'button',
      labeling: ['aria-label', 'aria-labelledby'],
      keyboard: [{ key: 'Enter|Space', when: 'root', then: 'activate' }],
      apgPattern: 'button',
    };
  }

  if (name.includes('input') || name.includes('field')) {
    return {
      role: 'textbox',
      labeling: ['aria-label', 'aria-labelledby', 'aria-describedby'],
      keyboard: [{ key: 'Tab', when: 'root', then: 'focus' }],
      apgPattern: 'textbox',
    };
  }

  if (name.includes('modal') || name.includes('dialog')) {
    return {
      role: 'dialog',
      labeling: ['aria-label', 'aria-labelledby'],
      keyboard: [
        { key: 'Escape', when: 'any', then: 'close' },
        { key: 'Tab', when: 'any', then: 'cycle focus within' },
      ],
      apgPattern: 'dialog',
    };
  }

  if (name.includes('toast')) {
    return {
      role: 'status',
      labeling: ['aria-label'],
      keyboard: [{ key: 'Escape', when: 'focused', then: 'dismiss' }],
      apgPattern: 'alert',
    };
  }

  // Default based on layer
  switch (layer) {
    case 'composer':
      return {
        role: 'region',
        labeling: ['aria-label', 'aria-labelledby'],
        keyboard: [{ key: 'Tab', when: 'any', then: 'navigate children' }],
        apgPattern: null,
      };
    case 'compound':
      return {
        role: 'group',
        labeling: ['aria-label', 'aria-labelledby'],
        keyboard: [],
        apgPattern: null,
      };
    default:
      return {
        role: 'generic',
        labeling: ['aria-label'],
        keyboard: [],
        apgPattern: null,
      };
  }
}

// Generate token references
function generateTokenReferences(componentName) {
  const lower = componentName.toLowerCase();

  return {
    root: [
      `${lower}.color.background.default`,
      `${lower}.color.foreground.primary`,
      `${lower}.size.padding.default`,
      `${lower}.size.radius.default`,
    ],
  };
}

// Generate contract for a component
function generateContract(componentName, componentPath) {
  const layer = classifyComponent(componentName, componentPath);
  const anatomy = extractAnatomy(componentName, componentPath);
  const variants = extractVariants(componentName, componentPath);
  const a11y = generateA11yInfo(componentName, layer);
  const tokens = generateTokenReferences(componentName);

  return {
    name: componentName,
    layer: layer,
    anatomy: anatomy,
    variants: variants,
    states: ['default', 'hover', 'focus', 'active', 'disabled'],
    slots: {},
    a11y: a11y,
    tokens: tokens,
    ssr: {
      hydrateOn: layer === 'composer' ? 'interaction' : 'none',
    },
    rtl: {
      flipIcon: anatomy.includes('icon'),
    },
  };
}

// Main execution
function generateContractsForAllComponents() {
  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`Components directory not found: ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const components = fs.readdirSync(COMPONENTS_DIR).filter((item) => {
    const itemPath = path.join(COMPONENTS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`Found ${components.length} components to process...\n`);

  let created = 0;
  let skipped = 0;

  components.forEach((componentName) => {
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const contractPath = path.join(
      componentPath,
      `${componentName}.contract.json`
    );

    if (fs.existsSync(contractPath)) {
      console.log(`⏭️  Skipped ${componentName} (contract already exists)`);
      skipped++;
      return;
    }

    try {
      const contract = generateContract(componentName, componentPath);
      fs.writeFileSync(contractPath, JSON.stringify(contract, null, 2) + '\n');
      console.log(
        `✅ Created contract for ${componentName} (${contract.layer})`
      );
      created++;
    } catch (error) {
      console.error(
        `❌ Failed to create contract for ${componentName}: ${error.message}`
      );
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${components.length}`);
}

// CLI execution
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Generate Contract Files for Components

Usage:
  node scripts/generateContracts.mjs

This script will:
- Scan all components in ui/components/
- Analyze each component to determine layer (primitive/compound/composer)
- Extract anatomy, variants, and accessibility patterns
- Generate ComponentName.contract.json files
- Skip components that already have contracts

The generated contracts follow the schema defined in COMPONENT_STANDARDS.md Section 12.
`);
  process.exit(0);
}

generateContractsForAllComponents();
