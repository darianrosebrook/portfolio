/**
 * Lighthouse CI Configuration - Mobile
 * Mobile-specific performance budgets
 */

const baseConfig = require('./.lighthouserc.js');

module.exports = {
  ...baseConfig,
  ci: {
    ...baseConfig.ci,
    collect: {
      ...baseConfig.ci.collect,
      settings: {
        ...baseConfig.ci.collect.settings,
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        // Slightly more lenient for mobile
        'categories:performance': ['error', { minScore: 0.8 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        interactive: ['error', { maxNumericValue: 4500 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 4000 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
