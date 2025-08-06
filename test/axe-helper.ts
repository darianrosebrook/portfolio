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

/**
 * Design system specific axe configuration for testing components
 */
export const designSystemAxeConfig = {
  rules: {
    'color-contrast': { enabled: false }, // Disabled during development
    'landmark-one-main': { enabled: false }, // Not applicable to isolated components
    'page-has-heading-one': { enabled: false }, // Not applicable to isolated components
  },
};

/**
 * Helper function to check for accessibility violations with custom config
 */
export const expectNoAccessibilityViolations = async (element: Element | { container: Element }) => {
  const targetElement = 'container' in element ? element.container : element;
  const results = await axe(targetElement);
  expect(results).toHaveNoViolations();
};
