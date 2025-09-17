#!/usr/bin/env node
/**
 * Design Tokens Build Runner
 *
 * Main orchestration script that runs all token generation steps
 * in the correct order with proper error handling and reporting.
 */

import { logSummary } from '../core/index';
import { composeTokens } from '../generators/compose';
import { generateGlobalTokens } from '../generators/global';
import { generateTokenTypes } from '../generators/types';

interface BuildStep {
  name: string;
  description: string;
  fn: () => boolean | Promise<boolean>;
  required: boolean;
}

/**
 * Design tokens build pipeline
 */
export async function buildTokens(): Promise<boolean> {
  console.log('🎨 Design Tokens Build Pipeline\n');

  const steps: BuildStep[] = [
    {
      name: 'compose',
      description: 'Compose core and semantic tokens',
      fn: composeTokens,
      required: true,
    },
    {
      name: 'global',
      description: 'Generate global CSS variables',
      fn: generateGlobalTokens,
      required: true,
    },
    {
      name: 'types',
      description: 'Generate TypeScript types',
      fn: generateTokenTypes,
      required: false,
    },
  ];

  const results: Array<{ step: string; success: boolean; duration: number }> =
    [];
  let totalErrors = 0;

  // Execute each step
  for (const step of steps) {
    const startTime = Date.now();
    console.log(`[${step.name}] ${step.description}...`);

    try {
      const success = await step.fn();
      const duration = Date.now() - startTime;

      results.push({ step: step.name, success, duration });

      if (success) {
        console.log(`[${step.name}] ✅ Completed in ${duration}ms`);
      } else {
        console.error(`[${step.name}] ❌ Failed`);
        totalErrors++;

        if (step.required) {
          console.error(`[build] Required step failed, aborting build`);
          break;
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({ step: step.name, success: false, duration });
      totalErrors++;

      console.error(`[${step.name}] ❌ Error:`, error);

      if (step.required) {
        console.error(`[build] Required step failed, aborting build`);
        break;
      }
    }

    console.log(''); // Add spacing between steps
  }

  // Print summary
  console.log('📊 Build Summary:');
  console.log('─'.repeat(50));

  results.forEach(({ step, success, duration }) => {
    const status = success ? '✅' : '❌';
    const time =
      duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
    console.log(`  ${status} ${step.padEnd(12)} ${time.padStart(8)}`);
  });

  console.log('─'.repeat(50));

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successCount = results.filter((r) => r.success).length;
  const timeStr =
    totalDuration < 1000
      ? `${totalDuration}ms`
      : `${(totalDuration / 1000).toFixed(1)}s`;

  console.log(
    `  ${successCount}/${results.length} steps completed in ${timeStr}`
  );

  if (totalErrors === 0) {
    console.log('\n🎉 Design tokens build completed successfully!');
  } else {
    console.log(`\n⚠️  Build completed with ${totalErrors} error(s)`);
  }

  return totalErrors === 0;
}

/**
 * Run specific step(s) only
 */
export async function runSteps(stepNames: string[]): Promise<boolean> {
  const availableSteps: Record<string, () => boolean | Promise<boolean>> = {
    compose: composeTokens,
    global: generateGlobalTokens,
    types: generateTokenTypes,
  };

  let success = true;

  for (const stepName of stepNames) {
    if (!availableSteps[stepName]) {
      console.error(`[build] Unknown step: ${stepName}`);
      console.error(
        `[build] Available steps: ${Object.keys(availableSteps).join(', ')}`
      );
      return false;
    }

    console.log(`[${stepName}] Running...`);
    const stepSuccess = await availableSteps[stepName]();

    if (!stepSuccess) {
      console.error(`[${stepName}] ❌ Failed`);
      success = false;
    } else {
      console.log(`[${stepName}] ✅ Completed`);
    }
  }

  return success;
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Run specific steps
    const success = await runSteps(args);
    process.exit(success ? 0 : 1);
  } else {
    // Run full build
    const success = await buildTokens();
    process.exit(success ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('[build] Fatal error:', error);
    process.exit(1);
  });
}
