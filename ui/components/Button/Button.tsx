import React, { useMemo } from 'react';
import { mergeRefs } from '@/utils/refs';
import { isValidReactElement } from '@/utils/type-guards';
import styles from './Button.module.scss';

// Simple Slot implementation to avoid Radix dependency
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactElement;
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!isValidReactElement(children)) {
      return null;
    }

    const { className, ...rest } = props;
    const childProps = children.props as React.HTMLAttributes<HTMLElement>;
    const childClassName = [className, childProps.className]
      .filter(Boolean)
      .join(' ');

    // Merge refs safely
    const childRef = 'ref' in childProps 
      ? (childProps.ref as React.Ref<HTMLElement> | undefined)
      : undefined;
    const mergedRef = ref ? mergeRefs(ref, childRef) : childRef;

    return React.cloneElement(children, {
      ...rest,
      ...childProps,
      className: childClassName,
      ref: mergedRef,
    } as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> });
  }
);

Slot.displayName = 'Slot';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'destructive'
  | 'outline';

interface ButtonBaseProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string; // Ensure you have a title prop for accessibility
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  role?: React.AriaRole;
  asChild?: boolean;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'className' | 'type' | 'onClick' | 'disabled'
    > {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsAnchor
  extends ButtonBaseProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'className' | 'href' | 'onClick'
    > {
  as: 'a';
  href: string;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({
  as = 'button',
  size = 'medium',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  title = '',
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  role,
  asChild = false,
  children,
  ...rest
}, ref) => {
  const baseClassName = styles.button;
  const sizeClassName = styles[size];
  const variantClassName = styles[variant];
  const isLoadingClassName = loading ? styles.isLoading : '';
  const isDisabledClassName = disabled ? styles.disabled : '';

  const childCount = React.Children.count(children);
  const isSingleChild = childCount === 1;
  const hasOnlyIcon =
    isSingleChild &&
    isValidReactElement(children) &&
    (children.type === 'svg' ||
      (children.props &&
        typeof children.props === 'object' &&
        ('aria-label' in children.props || 'data-icon' in children.props)));

  const combinedClassName = useMemo(
    () =>
      [
        baseClassName,
        sizeClassName,
        variantClassName,
        isLoadingClassName,
        isDisabledClassName,
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [
      baseClassName,
      sizeClassName,
      variantClassName,
      isLoadingClassName,
      isDisabledClassName,
      className,
    ]
  );

  const ariaProps: Record<string, string | boolean | undefined> = {};
  if (hasOnlyIcon && (title || ariaLabel)) {
    ariaProps['aria-label'] = title || ariaLabel;
  }
  if (ariaExpanded !== undefined) {
    ariaProps['aria-expanded'] = ariaExpanded;
  }
  if (ariaPressed !== undefined) {
    ariaProps['aria-pressed'] = ariaPressed;
  }
  if (role) {
    ariaProps['role'] = role;
  }

  const renderChildren = () => {
    if (loading) {
      return (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {children ? (
            <span className={styles.loadingText}>{children}</span>
          ) : null}
        </>
      );
    }

    if (children == null) return null;
    if (typeof children === 'string' || typeof children === 'number') {
      return <span>{children}</span>;
    }
    return children;
  };

  // Handle asChild pattern
  if (asChild) {
    const childElement = isValidReactElement(children) ? children : null;
    if (!childElement) return null;
    
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={combinedClassName}
        title={title}
        {...ariaProps}
        data-slot="button"
      >
        {childElement}
      </Slot>
    );
  }

  if (as === 'a') {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClassName}
        title={title}
        {...ariaProps}
        {...anchorRest}
        data-slot="button"
      >
        {renderChildren()}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={combinedClassName}
      disabled={disabled}
      title={title}
      {...(rest as ButtonAsButton)}
      {...ariaProps}
      data-slot="button"
    >
      {renderChildren()}
    </button>
  );
});

Button.displayName = 'Button';

export default React.memo(Button) as typeof Button;
