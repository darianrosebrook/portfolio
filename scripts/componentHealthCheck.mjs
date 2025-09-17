#!/usr/bin/env node
/**
 * Component Health Check
 * Comprehensive validation and reporting for component standards compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../ui/components');

class ComponentHealthChecker {
  constructor() {
    this.results = {
      total: 0,
      compliant: 0,
      warnings: 0,
      errors: 0,
      components: [],
    };
  }

  checkComponent(componentName) {
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const result = {
      name: componentName,
      layer: 'unknown',
      score: 0,
      maxScore: 0,
      issues: [],
      strengths: [],
    };

    // Required files check
    const requiredFiles = [
      'index.tsx',
      `${componentName}.tsx`,
      `${componentName}.module.scss`,
      `${componentName}.contract.json`,
      'README.md',
      `tests/${componentName}.test.tsx`,
    ];

    requiredFiles.forEach((file) => {
      result.maxScore += 10;
      if (fs.existsSync(path.join(componentPath, file))) {
        result.score += 10;
        result.strengths.push(`Has ${file}`);
      } else {
        result.issues.push(`Missing ${file}`);
      }
    });

    // Contract validation
    const contractPath = path.join(
      componentPath,
      `${componentName}.contract.json`
    );
    if (fs.existsSync(contractPath)) {
      try {
        const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        result.layer = contract.layer || 'unknown';

        result.maxScore += 20;
        if (
          contract.name &&
          contract.layer &&
          contract.anatomy &&
          contract.a11y &&
          contract.tokens
        ) {
          result.score += 20;
          result.strengths.push('Complete contract schema');
        } else {
          result.issues.push('Incomplete contract schema');
        }

        // A11y completeness
        result.maxScore += 15;
        if (
          contract.a11y?.role &&
          contract.a11y?.keyboard &&
          contract.a11y?.labeling
        ) {
          result.score += 15;
          result.strengths.push('Complete a11y specification');
        } else {
          result.issues.push('Incomplete a11y specification');
        }
      } catch (error) {
        result.issues.push(`Invalid contract JSON: ${error.message}`);
      }
    }

    // Component implementation check
    const mainFile = path.join(componentPath, `${componentName}.tsx`);
    if (fs.existsSync(mainFile)) {
      try {
        const content = fs.readFileSync(mainFile, 'utf8');

        // TypeScript interface
        result.maxScore += 10;
        if (content.includes(`interface ${componentName}Props`)) {
          result.score += 10;
          result.strengths.push('Exports TypeScript interface');
        } else {
          result.issues.push('Missing TypeScript props interface');
        }

        // React.memo usage
        result.maxScore += 5;
        if (content.includes('React.memo')) {
          result.score += 5;
          result.strengths.push('Uses React.memo optimization');
        } else {
          result.issues.push('Consider using React.memo');
        }

        // forwardRef usage
        result.maxScore += 10;
        if (content.includes('forwardRef')) {
          result.score += 10;
          result.strengths.push('Forwards refs correctly');
        } else {
          result.issues.push('Should forward refs to underlying element');
        }

        // Boolean prop explosion check
        const booleanProps = content.match(/(\w+)\?\s*:\s*boolean/g);
        if (booleanProps && booleanProps.length > 4) {
          result.issues.push(
            `Has ${booleanProps.length} boolean props - consider composition`
          );
        } else {
          result.strengths.push('Reasonable prop complexity');
        }
      } catch (error) {
        result.issues.push(`Error reading component file: ${error.message}`);
      }
    }

    // SCSS validation
    const scssFile = path.join(componentPath, `${componentName}.module.scss`);
    if (fs.existsSync(scssFile)) {
      try {
        const content = fs.readFileSync(scssFile, 'utf8');

        // Design tokens usage
        result.maxScore += 15;
        if (
          content.includes('var(--') &&
          content.includes('.tokens.generated.scss')
        ) {
          result.score += 15;
          result.strengths.push('Uses design tokens correctly');
        } else {
          result.issues.push(
            'Should use design tokens instead of hardcoded values'
          );
        }

        // Focus styles
        result.maxScore += 10;
        if (content.includes(':focus') || content.includes(':focus-visible')) {
          result.score += 10;
          result.strengths.push('Includes focus styles');
        } else {
          result.issues.push('Missing focus styles for accessibility');
        }

        // Hardcoded values check
        if (content.match(/#[0-9a-fA-F]{3,6}/)) {
          result.issues.push('Contains hardcoded color values');
        }
      } catch (error) {
        result.issues.push(`Error reading SCSS file: ${error.message}`);
      }
    }

    // README validation
    const readmePath = path.join(componentPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');

        result.maxScore += 15;
        const sections = ['Usage', 'Props', 'Accessibility', 'Design Tokens'];
        const foundSections = sections.filter((section) =>
          content.includes(`## ${section}`)
        );

        result.score += (foundSections.length / sections.length) * 15;

        if (foundSections.length === sections.length) {
          result.strengths.push('Complete README documentation');
        } else {
          result.issues.push(
            `README missing sections: ${sections.filter((s) => !foundSections.includes(s)).join(', ')}`
          );
        }
      } catch (error) {
        result.issues.push(`Error reading README: ${error.message}`);
      }
    }

    // Test coverage check
    const testFile = path.join(
      componentPath,
      'tests',
      `${componentName}.test.tsx`
    );
    if (fs.existsSync(testFile)) {
      try {
        const content = fs.readFileSync(testFile, 'utf8');

        result.maxScore += 10;
        if (content.includes('axe') && content.includes('toHaveNoViolations')) {
          result.score += 10;
          result.strengths.push('Includes accessibility tests');
        } else {
          result.issues.push('Missing accessibility tests');
        }
      } catch (error) {
        result.issues.push(`Error reading test file: ${error.message}`);
      }
    }

    // Calculate percentage
    result.percentage =
      result.maxScore > 0
        ? Math.round((result.score / result.maxScore) * 100)
        : 0;

    return result;
  }

  generateReport() {
    if (!fs.existsSync(COMPONENTS_DIR)) {
      console.error(`Components directory not found: ${COMPONENTS_DIR}`);
      return;
    }

    const components = fs.readdirSync(COMPONENTS_DIR).filter((item) => {
      const itemPath = path.join(COMPONENTS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    });

    console.log(`🔍 Analyzing ${components.length} components...\n`);

    components.forEach((componentName) => {
      const result = this.checkComponent(componentName);
      this.results.components.push(result);
      this.results.total++;

      if (result.percentage >= 90) {
        this.results.compliant++;
      } else if (result.percentage >= 70) {
        this.results.warnings++;
      } else {
        this.results.errors++;
      }
    });

    this.printReport();
  }

  printReport() {
    console.log('📊 Component Health Report\n');
    console.log('='.repeat(80));

    // Summary
    console.log(`\n📈 Overall Health:`);
    console.log(`   Total Components: ${this.results.total}`);
    console.log(`   ✅ Compliant (≥90%): ${this.results.compliant}`);
    console.log(`   ⚠️  Needs Work (70-89%): ${this.results.warnings}`);
    console.log(`   ❌ Critical Issues (<70%): ${this.results.errors}`);

    const overallHealth = Math.round(
      ((this.results.compliant * 100 +
        this.results.warnings * 80 +
        this.results.errors * 50) /
        (this.results.total * 100)) *
        100
    );
    console.log(`   🎯 Overall Health Score: ${overallHealth}%\n`);

    // Layer breakdown
    const layerStats = {};
    this.results.components.forEach((comp) => {
      if (!layerStats[comp.layer]) {
        layerStats[comp.layer] = { count: 0, totalScore: 0 };
      }
      layerStats[comp.layer].count++;
      layerStats[comp.layer].totalScore += comp.percentage;
    });

    console.log('🏗️  By Layer:');
    Object.entries(layerStats).forEach(([layer, stats]) => {
      const avgScore = Math.round(stats.totalScore / stats.count);
      console.log(`   ${layer}: ${stats.count} components, ${avgScore}% avg`);
    });

    // Top performers
    const topPerformers = this.results.components
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    console.log('\n🏆 Top Performers:');
    topPerformers.forEach((comp, i) => {
      console.log(
        `   ${i + 1}. ${comp.name} (${comp.layer}): ${comp.percentage}%`
      );
    });

    // Components needing attention
    const needsAttention = this.results.components
      .filter((comp) => comp.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage);

    if (needsAttention.length > 0) {
      console.log('\n🚨 Components Needing Attention:');
      needsAttention.forEach((comp) => {
        console.log(`\n   ${comp.name} (${comp.layer}): ${comp.percentage}%`);
        console.log(`   Issues: ${comp.issues.slice(0, 3).join(', ')}`);
        if (comp.issues.length > 3) {
          console.log(`   ... and ${comp.issues.length - 3} more`);
        }
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');

    const commonIssues = {};
    this.results.components.forEach((comp) => {
      comp.issues.forEach((issue) => {
        commonIssues[issue] = (commonIssues[issue] || 0) + 1;
      });
    });

    const sortedIssues = Object.entries(commonIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    sortedIssues.forEach(([issue, count]) => {
      console.log(`   • ${issue} (${count} components)`);
    });

    console.log('\n🎯 Next Steps:');
    console.log('   1. Run `npm run generate:contracts` for missing contracts');
    console.log('   2. Add missing test files using colocated structure');
    console.log(
      '   3. Update components with hardcoded values to use design tokens'
    );
    console.log('   4. Add accessibility tests to existing test suites');
    console.log('   5. Complete README documentation for all components');

    console.log('\n' + '='.repeat(80));
  }
}

// CLI execution
const checker = new ComponentHealthChecker();
checker.generateReport();
