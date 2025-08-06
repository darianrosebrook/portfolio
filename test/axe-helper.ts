import { configureAxe } from 'jest-axe';

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Disable color contrast rule for now (can be enabled later)
    'color-contrast': { enabled: false },
    // Focus on structural accessibility
    'page-has-heading-one': { enabled: true },
    'landmark-one-main': { enabled: true },
  },
});

export { toHaveNoViolations } from 'jest-axe';
