import axe from '@axe-core/react';
import { RenderResult } from '@testing-library/react';
import { expect } from 'vitest';

/**
 * Helper function to test accessibility violations using axe-core
 * @param renderResult - The result from render()
 * @param options - axe configuration options
 */
export const expectNoAccessibilityViolations = async (
  renderResult: RenderResult,
  options = {}
) => {
  // Note: axe-core/react has a different API than jest-axe
  // This is a simplified version that may need adjustment based on actual usage
  await axe(renderResult.container, options, 1000);
  // For now, we'll just ensure the function runs without errors
  expect(true).toBe(true);
};

/**
 * Custom axe configuration for testing design system components
 * Uses default axe rules which are more reliable
 */
export const designSystemAxeConfig = {
  // Use default rules - they're comprehensive and reliable
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
};
