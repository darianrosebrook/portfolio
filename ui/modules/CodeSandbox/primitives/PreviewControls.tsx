import * as React from 'react';

export type PreviewControlsProps = {
  /** Current theme value */
  theme: 'system' | 'light' | 'dark' | string;
  /** Theme change handler */
  onThemeChange: (v: 'system' | 'light' | 'dark' | string) => void;
  /** Current RTL state */
  isRTL: boolean;
  /** RTL toggle handler */
  onRTLChange: (isRTL: boolean) => void;
  /** Theme options */
  themeOptions?: Array<{ label: string; value: string }>;
  /** Whether to show RTL toggle */
  showRTLToggle?: boolean;
  /** Whether to show theme switcher */
  showThemeSwitcher?: boolean;
};

/**
 * Preview controls for documentation playgrounds.
 * Provides theme switching and RTL toggle in a unified control bar.
 */
export function PreviewControls({
  theme,
  onThemeChange,
  isRTL,
  onRTLChange,
  themeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ],
  showRTLToggle = true,
  showThemeSwitcher = true,
}: PreviewControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 12px',
        backgroundColor: 'var(--semantic-color-background-secondary, #f5f5f5)',
        borderRadius: 'var(--semantic-border-radius-md, 8px)',
        border: '1px solid var(--semantic-color-border-subtle, #e5e7eb)',
      }}
    >
      {/* Theme Switcher */}
      {showThemeSwitcher && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--semantic-color-foreground-secondary, #6b7280)',
            }}
          >
            Theme:
          </span>
          <div role="radiogroup" aria-label="Theme" style={{ display: 'flex', gap: '4px' }}>
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={theme === opt.value}
                onClick={() => onThemeChange(opt.value)}
                style={{
                  appearance: 'none',
                  border: '1px solid transparent',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor:
                    theme === opt.value
                      ? 'var(--semantic-color-background-accent, #0a65fe)'
                      : 'var(--semantic-color-background-primary, #ffffff)',
                  color:
                    theme === opt.value
                      ? 'var(--semantic-color-foreground-on-accent, #ffffff)'
                      : 'var(--semantic-color-foreground-secondary, #6b7280)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {showThemeSwitcher && showRTLToggle && (
        <div
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'var(--semantic-color-border-subtle, #e5e7eb)',
          }}
        />
      )}

      {/* RTL Toggle */}
      {showRTLToggle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--semantic-color-foreground-secondary, #6b7280)',
            }}
          >
            Direction:
          </span>
          <div role="radiogroup" aria-label="Text direction" style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              role="radio"
              aria-checked={!isRTL}
              onClick={() => onRTLChange(false)}
              style={{
                appearance: 'none',
                border: '1px solid transparent',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: !isRTL
                  ? 'var(--semantic-color-background-accent, #0a65fe)'
                  : 'var(--semantic-color-background-primary, #ffffff)',
                color: !isRTL
                  ? 'var(--semantic-color-foreground-on-accent, #ffffff)'
                  : 'var(--semantic-color-foreground-secondary, #6b7280)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              LTR
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isRTL}
              onClick={() => onRTLChange(true)}
              style={{
                appearance: 'none',
                border: '1px solid transparent',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: isRTL
                  ? 'var(--semantic-color-background-accent, #0a65fe)'
                  : 'var(--semantic-color-background-primary, #ffffff)',
                color: isRTL
                  ? 'var(--semantic-color-foreground-on-accent, #ffffff)'
                  : 'var(--semantic-color-foreground-secondary, #6b7280)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              RTL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
