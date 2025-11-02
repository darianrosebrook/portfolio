/**
 * Analytics tracking for component documentation.
 * Tracks user interactions to measure documentation effectiveness.
 */

import React from 'react';

export type AnalyticsEvent =
  | 'playground_interaction'
  | 'panel_open'
  | 'panel_close'
  | 'search_no_result'
  | 'component_view'
  | 'component_time_spent'
  | 'variant_selection'
  | 'code_toggle'
  | 'theme_change'
  | 'rtl_toggle';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  component?: string;
  section?: string;
  value?: string | number;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event.
 * Uses Vercel Analytics if available, otherwise logs to console.
 */
export function trackEvent(data: AnalyticsEventData): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering
  }

  const { event, component, section, value, metadata } = data;

  // Try to use Vercel Analytics
  if (typeof (window as any).va !== 'undefined') {
    try {
      (window as any).va('track', event, {
        component,
        section,
        value,
        ...metadata,
      });
      return;
    } catch (error) {
      console.warn('Vercel Analytics tracking failed:', error);
    }
  }

  // Fallback: log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', {
      event,
      component,
      section,
      value,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  // Could also send to custom analytics endpoint here
  // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) })
}

/**
 * Track playground interactions (variant selection, code toggles).
 */
export function trackPlaygroundInteraction(
  component: string,
  interaction: 'variant_selection' | 'code_toggle',
  value: string
): void {
  trackEvent({
    event: 'playground_interaction',
    component,
    section: 'variants',
    value,
    metadata: { interaction },
  });
}

/**
 * Track panel opens/closes (A11yPanel, PerfPanel, TokenPanel).
 */
export function trackPanelToggle(
  component: string,
  panel: 'a11y' | 'perf' | 'token',
  isOpen: boolean
): void {
  trackEvent({
    event: isOpen ? 'panel_open' : 'panel_close',
    component,
    section: 'panels',
    value: panel,
    metadata: { panel },
  });
}

/**
 * Track search queries with no results.
 */
export function trackSearchNoResult(query: string, component?: string): void {
  trackEvent({
    event: 'search_no_result',
    component,
    section: 'search',
    value: query,
    metadata: { query },
  });
}

/**
 * Track component page view.
 */
export function trackComponentView(component: string): void {
  trackEvent({
    event: 'component_view',
    component,
    metadata: { timestamp: Date.now() },
  });
}

/**
 * Track time spent on component page.
 */
export function trackComponentTimeSpent(
  component: string,
  timeMs: number
): void {
  trackEvent({
    event: 'component_time_spent',
    component,
    value: timeMs,
    metadata: { timeSeconds: Math.round(timeMs / 1000) },
  });
}

/**
 * Track theme changes.
 */
export function trackThemeChange(
  component: string,
  theme: 'light' | 'dark' | 'system'
): void {
  trackEvent({
    event: 'theme_change',
    component,
    value: theme,
    metadata: { theme },
  });
}

/**
 * Track RTL toggle.
 */
export function trackRTLToggle(component: string, isRTL: boolean): void {
  trackEvent({
    event: 'rtl_toggle',
    component,
    value: isRTL ? 'rtl' : 'ltr',
    metadata: { isRTL },
  });
}

/**
 * Hook for tracking time spent on a component page.
 * Automatically tracks when component unmounts.
 */
export function useComponentTimeTracking(component: string): void {
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const startTime = Date.now();
    trackComponentView(component);

    return () => {
      const timeSpent = Date.now() - startTime;
      trackComponentTimeSpent(component, timeSpent);
    };
  }, [component]);
}
