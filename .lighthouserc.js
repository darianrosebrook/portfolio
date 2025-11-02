/**
 * Lighthouse CI Configuration
 * Performance budgets and audit settings for design system portfolio
 */

module.exports = {
  ci: {
    collect: {
      // Number of runs per URL for stability
      numberOfRuns: 3,
      // Start a local server for testing
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/blueprints',
        'http://localhost:3000/blueprints/component-standards',
        'http://localhost:3000/blueprints/foundations',
        'http://localhost:3000/articles',
        'http://localhost:3000/work',
      ],
      // Chrome settings for consistent results
      chromeFlags: '--no-sandbox --disable-gpu',
      // Settings for desktop and mobile
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu',
        preset: 'desktop', // Also test mobile: 'mobile'
      },
    },
    assert: {
      // Performance budgets (Core Web Vitals + Speed Index)
      assertions: {
        // Performance score (0-100)
        'categories:performance': ['error', { minScore: 0.85 }],

        // Largest Contentful Paint (LCP) - good < 2.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // First Input Delay (FID) - good < 100ms
        // Note: FID is deprecated in Lighthouse 10+, using INP instead
        interactive: ['error', { maxNumericValue: 3800 }],

        // Cumulative Layout Shift (CLS) - good < 0.1
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Total Blocking Time (TBT) - good < 200ms
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        // Speed Index - good < 3.4s
        'speed-index': ['error', { maxNumericValue: 3400 }],

        // First Contentful Paint (FCP) - good < 1.8s
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],

        // Accessibility score
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // Best Practices score
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO score
        'categories:seo': ['error', { minScore: 0.9 }],

        // Network payload size limits
        'total-byte-weight': ['warn', { maxNumericValue: 5000000 }], // 5MB

        // Unused JavaScript
        'unused-javascript': ['warn', { maxLength: 50 }],

        // Image optimization
        'uses-optimized-images': 'off', // Next.js handles this

        // Modern image formats
        'uses-webp-images': 'off', // Next.js handles this

        // Font display
        'font-display': ['warn', {}],
      },
    },
    upload: {
      // Only upload to Lighthouse CI server if token is provided
      target: process.env.LHCI_GITHUB_APP_TOKEN
        ? 'temporary-public-storage'
        : undefined,
    },
    server: {
      // Port for Lighthouse CI server
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './.lighthouseci',
      },
    },
  },
};
