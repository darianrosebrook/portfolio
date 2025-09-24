/**
 * Design Token Accessibility Validator
 *
 * This module validates design tokens for WCAG 2.1 accessibility compliance,
 * focusing on color contrast ratios and other accessibility requirements.
 */

import { contrastRatioHex } from "../helpers/colorHelpers.mjs";
import fs from "fs";
import path from "path";

// WCAG 2.1 Contrast Requirements
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5, // WCAG AA for normal text (14pt+)
  AA_LARGE: 3.0, // WCAG AA for large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0, // WCAG AAA for normal text
  AAA_LARGE: 4.5, // WCAG AAA for large text
};

/**
 * Validates a single color pair for WCAG compliance
 */
export function validateColorPair(pair) {
  const contrastRatio = contrastRatioHex(pair.foreground, pair.background);
  const requiredRatio = WCAG_LEVELS[pair.requiredLevel];

  if (contrastRatio === null) {
    return {
      isValid: false,
      contrastRatio: 0,
      requiredRatio,
      level: pair.requiredLevel,
      context: pair.context,
      foreground: pair.foreground,
      background: pair.background,
      suggestion: `Invalid color format. Check: ${pair.foreground} / ${pair.background}`,
    };
  }

  const isValid = contrastRatio >= requiredRatio;

  return {
    isValid,
    contrastRatio,
    requiredRatio,
    level: pair.requiredLevel,
    context: pair.context,
    foreground: pair.foreground,
    background: pair.background,
    suggestion: isValid
      ? undefined
      : generateContrastSuggestion(pair, contrastRatio),
  };
}

/**
 * Generates suggestions for improving contrast
 */
function generateContrastSuggestion(pair, currentRatio) {
  const requiredRatio = WCAG_LEVELS[pair.requiredLevel];
  const improvement = ((requiredRatio / currentRatio) * 100 - 100).toFixed(0);

  return (
    `Contrast ratio ${currentRatio.toFixed(
      2
    )} is below required ${requiredRatio}. ` +
    `Consider darkening foreground or lightening background by ~${improvement}% luminance.`
  );
}

/**
 * Extracts color pairs from design tokens
 */
export function extractColorPairsFromTokens(tokensPath) {
  const pairs = [];

  try {
    // Read the composed design tokens
    const tokensFile = fs.readFileSync(tokensPath, "utf8");
    const tokens = JSON.parse(tokensFile);

    // Extract semantic color tokens
    const semanticColors = tokens.semantic?.color || {};

    // Helper function to get token value
    const getTokenValue = (tokenObj) => {
      if (typeof tokenObj === "string") return tokenObj;
      if (tokenObj?.$value)
        return resolveTokenReference(tokenObj.$value, tokens);
      return null;
    };

    // Define common color pair patterns
    const colorPairPatterns = [
      // Text on backgrounds
      {
        fg: getTokenValue(semanticColors.foreground?.primary),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Primary text on primary background",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.foreground?.secondary),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Secondary text on primary background",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.foreground?.primary),
        bg: getTokenValue(semanticColors.background?.secondary),
        context: "Primary text on secondary background",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.foreground?.primary),
        bg: getTokenValue(semanticColors.background?.elevated),
        context: "Primary text on elevated background",
        level: "AA_NORMAL",
      },
      // Interactive elements
      {
        fg: getTokenValue(semanticColors.foreground?.onAccent),
        bg: getTokenValue(semanticColors.background?.accent),
        context: "Text on accent/primary buttons",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.foreground?.accent),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Accent text on primary background",
        level: "AA_NORMAL",
      },
      // Status colors
      {
        fg: getTokenValue(semanticColors.status?.success),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Success status text",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.status?.warning),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Warning status text",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.status?.danger),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Error status text",
        level: "AA_NORMAL",
      },
      {
        fg: getTokenValue(semanticColors.status?.info),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Info status text",
        level: "AA_NORMAL",
      },
      // Border contrasts (lower requirement)
      {
        fg: getTokenValue(semanticColors.border?.subtle),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Subtle borders",
        level: "AA_LARGE", // Lower requirement for non-text
      },
      {
        fg: getTokenValue(semanticColors.border?.primary),
        bg: getTokenValue(semanticColors.background?.primary),
        context: "Primary borders",
        level: "AA_LARGE",
      },
    ];

    // Filter out undefined color pairs and convert to ColorPair objects
    colorPairPatterns.forEach((pattern) => {
      if (
        pattern.fg &&
        pattern.bg &&
        isValidHexColor(pattern.fg) &&
        isValidHexColor(pattern.bg)
      ) {
        pairs.push({
          foreground: pattern.fg,
          background: pattern.bg,
          context: pattern.context,
          requiredLevel: pattern.level,
        });
      }
    });
  } catch (error) {
    console.error("Error reading design tokens:", error);
  }

  return pairs;
}

/**
 * Resolves token references like {core.color.mode.dark}
 */
function resolveTokenReference(value, tokens) {
  if (
    typeof value !== "string" ||
    !value.startsWith("{") ||
    !value.endsWith("}")
  ) {
    return value;
  }

  const path = value.slice(1, -1); // Remove { and }
  const parts = path.split(".");

  let current = tokens;
  for (const part of parts) {
    current = current?.[part];
    if (!current) return value; // Return original if path not found
  }

  // If we found a token object, get its $value
  if (current?.$value) {
    // Recursively resolve in case of nested references
    return resolveTokenReference(current.$value, tokens);
  }

  return current || value;
}

/**
 * Validates if a string is a valid hex color
 */
function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates all color pairs and generates a comprehensive report
 */
export function validateDesignTokens(tokensPath) {
  const colorPairs = extractColorPairsFromTokens(tokensPath);
  const results = colorPairs.map(validateColorPair);

  const validPairs = results.filter((r) => r.isValid).length;
  const invalidPairs = results.length - validPairs;

  // Calculate compliance levels
  let aaCompliant = 0;
  let aaaCompliant = 0;
  let failing = 0;

  results.forEach((result) => {
    if (result.contrastRatio >= WCAG_LEVELS.AAA_NORMAL) {
      aaaCompliant++;
    } else if (result.contrastRatio >= WCAG_LEVELS.AA_NORMAL) {
      aaCompliant++;
    } else {
      failing++;
    }
  });

  return {
    totalPairs: results.length,
    validPairs,
    invalidPairs,
    results,
    summary: {
      aaCompliant,
      aaaCompliant,
      failing,
    },
  };
}

/**
 * Generates a human-readable report
 */
export function generateAccessibilityReport(report) {
  const { totalPairs, validPairs, invalidPairs, results, summary } = report;

  let output = "\n🎨 DESIGN TOKEN ACCESSIBILITY REPORT\n";
  output += "═".repeat(50) + "\n\n";

  // Summary
  output += `📊 SUMMARY:\n`;
  output += `   Total color pairs tested: ${totalPairs}\n`;
  output += `   ✅ Passing: ${validPairs} (${(
    (validPairs / totalPairs) *
    100
  ).toFixed(1)}%)\n`;
  output += `   ❌ Failing: ${invalidPairs} (${(
    (invalidPairs / totalPairs) *
    100
  ).toFixed(1)}%)\n\n`;

  output += `🏆 COMPLIANCE LEVELS:\n`;
  output += `   🥇 AAA Compliant: ${summary.aaaCompliant}\n`;
  output += `   🥈 AA Compliant: ${summary.aaCompliant}\n`;
  output += `   🚫 Failing: ${summary.failing}\n\n`;

  // Failing pairs
  const failingResults = results.filter((r) => !r.isValid);
  if (failingResults.length > 0) {
    output += `❌ FAILING PAIRS:\n`;
    output += "─".repeat(50) + "\n";

    failingResults.forEach((result, index) => {
      output += `${index + 1}. ${result.context}\n`;
      output += `   Foreground: ${result.foreground}\n`;
      output += `   Background: ${result.background}\n`;
      output += `   Contrast: ${result.contrastRatio.toFixed(2)} (required: ${
        result.requiredRatio
      })\n`;
      output += `   💡 ${result.suggestion}\n\n`;
    });
  }

  // Passing pairs summary
  const passingResults = results.filter((r) => r.isValid);
  if (passingResults.length > 0) {
    output += `✅ PASSING PAIRS:\n`;
    output += "─".repeat(50) + "\n";

    passingResults.forEach((result, index) => {
      const level =
        result.contrastRatio >= WCAG_LEVELS.AAA_NORMAL ? "AAA" : "AA";
      output += `${index + 1}. ${
        result.context
      } - ${result.contrastRatio.toFixed(2)} (${level})\n`;
    });
  }

  return output;
}

/**
 * Main validation function for CLI usage
 */
export async function runAccessibilityValidation(tokensPath) {
  const defaultTokensPath = path.join(
    process.cwd(),
    "ui/designTokens/designTokens.json"
  );
  const finalTokensPath = tokensPath || defaultTokensPath;

  console.log(`🔍 Validating design tokens: ${finalTokensPath}`);

  if (!fs.existsSync(finalTokensPath)) {
    console.error(`❌ Tokens file not found: ${finalTokensPath}`);
    console.log('💡 Run "npm run tokens:build" first to generate tokens.');
    process.exit(1);
  }

  const report = validateDesignTokens(finalTokensPath);
  const reportText = generateAccessibilityReport(report);

  console.log(reportText);

  // Write report to file
  const reportPath = path.join(process.cwd(), "accessibility-report.txt");
  fs.writeFileSync(reportPath, reportText);
  console.log(`📄 Report saved to: ${reportPath}`);

  // Exit with error code if there are failing pairs
  if (report.invalidPairs > 0) {
    console.log(
      `\n❌ ${report.invalidPairs} accessibility issues found. Please fix before deployment.`
    );
    process.exit(1);
  } else {
    console.log(
      `\n✅ All ${report.totalPairs} color pairs pass accessibility requirements!`
    );
  }
}
