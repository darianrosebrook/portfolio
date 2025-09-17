// Slotting & Composition Pattern
// Build flexible components through strategic slot placement

import React from 'react';

/**
 * Slotting allows components to accept custom content in specific areas, enabling
 * maximum flexibility while maintaining consistent structure and behavior.
 */

// Example: OTP Input with Slots (from example1.md)
export interface OTPInputProps {
  children: React.ReactNode;
  className?: string;
}

export function OTPInput(props: OTPInputProps) {
  const { id, describedBy, length, disabled, readOnly } = useOtpCtx();

  return (
    <div
      role="group"
      className={[styles.root, props.className].filter(Boolean).join(' ')}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-describedby={describedBy}
      id={id}
      data-length={length}
    >
      {props.children}
    </div>
  );
}

// Individual slot components
export function OTPField({ index, className, ...aria }: OTPFieldProps) {
  const {
    chars,
    register,
    setChar,
    clearChar,
    handlePaste,
    disabled,
    readOnly,
    autocomplete,
    inputMode,
    mask,
  } = useOtpCtx();

  return (
    <input
      ref={(el) => register(el, index)}
      className={[styles.field, className].filter(Boolean).join(' ')}
      value={mask && chars[index] ? '•' : chars[index] || ''}
      inputMode={inputMode}
      autoComplete={autocomplete}
      maxLength={1}
      onKeyDown={onKeyDown}
      onChange={onChange}
      onPaste={onPaste}
      disabled={disabled}
      readOnly={readOnly}
      aria-label={aria['aria-label'] ?? `Digit ${index + 1}`}
    />
  );
}

export function OTPSeparator({
  children = ' ',
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

export function OTPLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}

export function OTPError({
  id,
  children,
  className,
}: {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div role="alert" id={id} className={className}>
      {children}
    </div>
  );
}

// Usage example showing slot composition
export function CheckoutOtpExample() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <OTPProvider
        length={6}
        mode="numeric"
        onComplete={(code) => console.log('OTP:', code)}
      >
        <OTPLabel>Enter the 6-digit code</OTPLabel>
        <OTPInput>
          <OTPField index={0} />
          <OTPField index={1} />
          <OTPField index={2} />
          <OTPSeparator>-</OTPSeparator>
          <OTPField index={3} />
          <OTPField index={4} />
          <OTPField index={5} />
        </OTPInput>
        <OTPError id="otp-error">
          {/* show error text when server rejects */}
        </OTPError>
      </OTPProvider>
      <button type="submit">Verify</button>
    </form>
  );
}

/**
 * Key Benefits of Slotting:
 *
 * 1. Flexibility: Users can customize specific parts without breaking structure
 * 2. Consistency: Core behavior remains the same across different visual styles
 * 3. Composability: Slots can be mixed and matched in different combinations
 * 4. Maintainability: Changes to slot behavior affect all usages
 * 5. Accessibility: Slots maintain proper ARIA relationships
 */

// Example: Toolbar with Slots (from example3.md)
export function Toolbar({
  ariaLabel = 'Toolbar',
  className,
  children,
}: {
  ariaLabel?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { containerRef, state } = useToolbarCtx();

  return (
    <div
      ref={containerRef}
      role="toolbar"
      aria-label={ariaLabel}
      className={className}
      aria-orientation="horizontal"
    >
      {/* Primary & Secondary slots (left/right) */}
      <ToolbarSection id="primary" />
      <div className={styles.spacer} />
      <ToolbarSection id="secondary" />
      <ToolbarOverflow />
      {children /* optional custom regions */}
    </div>
  );
}

export function ToolbarSection({ id }: { id: 'primary' | 'secondary' }) {
  const { state, registerMeasure } = useToolbarCtx();
  const s = state();
  const items = s.items.filter((i) => i.section === id && i.visible);

  return (
    <div className={styles.section} data-section={id}>
      {items.map((i) => (
        <div key={i.action.id} className={styles.item}>
          <ToolbarItem action={i.action} />
        </div>
      ))}
    </div>
  );
}

export function ToolbarOverflow() {
  const { state } = useToolbarCtx();
  const s = state();
  if (!s.overflowIds.length) return null;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button data-tb-focusable="true" aria-label="More actions">
          ⋯
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Menu>
          {s.items
            .filter((i) => s.overflowIds.includes(i.action.id))
            .map(({ action }, idx) => (
              <MenuItem
                key={action.id}
                disabled={action.disabled}
                onSelect={() => action.onExecute?.(s)}
              >
                {action.icon}
                {action.label}
              </MenuItem>
            ))}
        </Menu>
      </Popover.Content>
    </Popover>
  );
}

/**
 * Slot Design Principles:
 *
 * 1. Named Slots: Each slot has a clear purpose and name
 * 2. Default Implementations: Provide sensible defaults for common cases
 * 3. Clear Boundaries: Slots should have well-defined responsibilities
 * 4. Consistent Naming: Use consistent naming conventions across components
 * 5. Accessibility: Slots maintain proper ARIA relationships
 */

// Example: Field with Slots (from example6.md)
export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const f = useFieldCtx();
  const cls = [styles.root, f.status === 'invalid' && styles.invalid, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      role="group"
      aria-labelledby={f.labelId}
      data-status={f.status}
    >
      <div className={styles.header}>
        <Label />
      </div>
      <div className={styles.control}>{children}</div>
      <div className={styles.meta}>
        <ErrorText />
        <HelpText />
      </div>
    </div>
  );
}

export function Label({ children }: { children?: React.ReactNode }) {
  const f = useFieldCtx();
  return (
    <label id={f.labelId} htmlFor={f.inputId}>
      {children ?? f.label}
      {f.required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );
}

export function HelpText({ children }: { children?: React.ReactNode }) {
  const f = useFieldCtx();
  const content = children ?? f.helpText;
  if (!content) return null;
  return <div id={f.helpId}>{content}</div>;
}

export function ErrorText() {
  const f = useFieldCtx();
  if (!f.errors.length) return null;
  return (
    <div id={f.errId} role="alert">
      {f.errors.map((e, i) => (
        <div key={i}>{e}</div>
      ))}
    </div>
  );
}

/**
 * When to Slot vs Configure:
 *
 * Use Slots when:
 * - You need to replace entire sections of UI
 * - Content structure varies significantly
 * - You want maximum flexibility
 * - Different teams need different visual styles
 *
 * Use Configuration Props when:
 * - Simple variations like colors, sizes, text
 * - Behavior changes, not structure
 * - You want to limit choices
 * - Performance is critical
 */

// Placeholder imports and types
function useOtpCtx() {
  return {} as any;
}
function useToolbarCtx() {
  return {} as any;
}
function useFieldCtx() {
  return {} as any;
}
const styles = {} as any;
const Popover = { Trigger: 'div', Content: 'div' } as any;
const Button = 'button' as any;
const Menu = 'div' as any;
const MenuItem = 'div' as any;

interface OTPFieldProps {
  index: number;
  className?: string;
  'aria-label'?: string;
}
